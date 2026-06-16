-- ─────────────────────────────────────────────────────────────────────────
-- Sensei — Règlement marchand (commission + versement net)
-- Constat : merchant-capture n'effectuait aucun calcul de commission ni
-- versement — seulement une ligne merchant_transactions + un webhook
-- PAYMENT.CAPTURED. Logique voulue : à la capture, Sensei prélève une
-- commission (points de base) et verse le NET au comptant, en une fois, au
-- marchand. Le risque d'impayé acheteur reste 100% porté par Sensei
-- (bnpl_plans / installments restent indépendants de cette table).
-- ─────────────────────────────────────────────────────────────────────────

-- ── Taux de commission marchand ───────────────────────────────────────────
-- Entier en points de base (1/100 de %) pour éviter tout float sur de
-- l'argent. 500 = 5.00 %. Modifiable seulement en base en V1 (pas de
-- back-office staff dans ce repo).
alter table merchants
  add column if not exists commission_bps integer not null default 500
    check (commission_bps >= 0 and commission_bps <= 10000);

comment on column merchants.commission_bps is
  'Taux de commission Sensei en points de base (500 = 5.00%). Modifiable seulement en base (pas de back-office) en V1.';

-- ── Nouveaux types énumérés ───────────────────────────────────────────────
create type merchant_payout_type   as enum ('payout', 'reversal');
create type merchant_payout_status as enum ('pending', 'succeeded', 'failed');

-- ── merchant_payouts ───────────────────────────────────────────────────────
-- Grand livre des versements (capture → payout) et reprises (refund →
-- reversal). Le taux est TOUJOURS snapshoté ici au moment du versement —
-- merchants.commission_bps peut changer plus tard sans jamais affecter les
-- versements déjà émis (même principe append-only que credit_score_events).
create table merchant_payouts (
  id                       uuid    primary key default gen_random_uuid(),
  merchant_id              uuid    not null references merchants (id) on delete restrict,
  type                     merchant_payout_type   not null,
  status                   merchant_payout_status not null default 'pending',

  -- Transaction d'origine (toujours la capture — un reversal référence
  -- aussi la capture, pas le refund, pour remonter d'un coup à la source).
  capture_transaction_id   uuid    not null references merchant_transactions (id) on delete restrict,
  -- Pour un reversal uniquement : la transaction refund qui le déclenche.
  refund_transaction_id    uuid    references merchant_transactions (id) on delete restrict,
  -- Pour un reversal uniquement : le payout initial dont on reprend une
  -- fraction (permet de retrouver le taux snapshoté sans recalcul ambigu).
  source_payout_id         uuid    references merchant_payouts (id) on delete restrict,

  -- Snapshot du taux au moment du versement initial (copié tel quel sur les
  -- reversals pour que le calcul reste cohérent même si le taux marchand a
  -- changé entre-temps).
  commission_bps_snapshot  integer not null check (commission_bps_snapshot >= 0 and commission_bps_snapshot <= 10000),

  gross_amount_cents       bigint  not null check (gross_amount_cents > 0),
  commission_cents         bigint  not null check (commission_cents >= 0),
  net_amount_cents         bigint  not null check (net_amount_cents >= 0),
  currency                 currency not null default 'USD',

  settlement_account       text,   -- copie de merchants.settlement_account au moment du versement (audit)
  provider_ref             text    unique, -- idempotence, ex: payout_capture_<id> / reversal_refund_<id>
  metadata_json            jsonb   not null default '{}'::jsonb,

  created_at               timestamptz not null default now(),
  settled_at                timestamptz, -- horodatage du règlement effectif (fixé par l'Edge Function, mocké = created_at)

  constraint merchant_payouts_consistency check (
    (type = 'payout'   and refund_transaction_id is null and source_payout_id is null)
    or
    (type = 'reversal' and refund_transaction_id is not null and source_payout_id is not null)
  ),
  -- Vérifie l'arrondi cohérent : net = brut - commission (jamais d'écart stocké).
  constraint merchant_payouts_amount_consistency check (
    net_amount_cents = gross_amount_cents - commission_cents
  )
);

-- Un seul versement initial par capture (empêche tout double-payout).
create unique index idx_merchant_payouts_one_payout_per_capture
  on merchant_payouts (capture_transaction_id)
  where type = 'payout';

create index idx_merchant_payouts_merchant on merchant_payouts (merchant_id, created_at desc);
create index idx_merchant_payouts_capture  on merchant_payouts (capture_transaction_id);
create index idx_merchant_payouts_refund   on merchant_payouts (refund_transaction_id) where refund_transaction_id is not null;
create index idx_merchant_payouts_source   on merchant_payouts (source_payout_id) where source_payout_id is not null;

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table merchant_payouts enable row level security;

-- Le marchand lit ses propres versements (même pattern que merchant_transactions).
create policy merchant_payouts_merchant_select on merchant_payouts for select
  using (merchant_id = app_merchant_id());

-- Pas de policy insert/update/delete → service_role uniquement (Edge Functions).
