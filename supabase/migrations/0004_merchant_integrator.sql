-- ─────────────────────────────────────────────────────────────────────────
-- Sensei — Intégrateur marchand BNPL ("Sensei for Developers")
-- Enrichissement de merchants + checkout_sessions + merchant_transactions +
-- webhook_events + RLS correspondante.
-- Inspiration : modèle Affirm (checkout_token, authorize/capture/void/refund).
-- ─────────────────────────────────────────────────────────────────────────

-- ── Enrichissement de merchants ──────────────────────────────────────────
-- Clés API : publique (front/navigateur) et secrète (serveur, stockée hashée).
-- Le secret brut n'est JAMAIS persisté — SHA-256 uniquement.
alter table merchants
  add column if not exists api_key_public      text unique,
  add column if not exists api_key_secret_hash text,
  add column if not exists website_url         text,
  add column if not exists webhook_url         text,
  add column if not exists webhook_secret_hash text,  -- HMAC pour signer les webhooks sortants
  add column if not exists updated_at          timestamptz not null default now();

create trigger merchants_updated_at before update on merchants
  for each row execute function set_updated_at();

-- ── Nouveaux types énumérés ───────────────────────────────────────────────
create type checkout_session_status     as enum ('pending', 'authorized', 'expired', 'cancelled');
create type merchant_transaction_type   as enum ('authorize', 'capture', 'void', 'refund');
create type merchant_transaction_status as enum ('pending', 'succeeded', 'failed');

-- ── checkout_sessions ─────────────────────────────────────────────────────
-- Une session = une tentative de checkout initiée par le marchand.
-- Le token (48 hex = 192 bits d'entropie) est renvoyé au marchand après
-- confirmation de l'acheteur, et utilisé pour l'appel merchant-authorize.
create table checkout_sessions (
  id            uuid    primary key default gen_random_uuid(),
  token         text    not null unique default encode(gen_random_bytes(24), 'hex'),
  merchant_id   uuid    not null references merchants (id) on delete restrict,
  amount_cents  bigint  not null check (amount_cents > 0),
  currency      currency not null default 'USD',
  order_ref     text    not null,
  return_url    text    not null,
  cancel_url    text    not null,
  status        checkout_session_status not null default 'pending',
  metadata_json jsonb   not null default '{}'::jsonb,
  user_id       uuid    references users (id) on delete set null,    -- rempli à l'autorisation
  plan_id       uuid    references bnpl_plans (id) on delete set null,
  expires_at    timestamptz not null default (now() + interval '24 hours'),
  created_at    timestamptz not null default now()
);
create index idx_checkout_sessions_token    on checkout_sessions (token);
create index idx_checkout_sessions_merchant on checkout_sessions (merchant_id, created_at desc);
create index idx_checkout_sessions_pending  on checkout_sessions (status, expires_at)
  where status = 'pending';

-- ── merchant_transactions ─────────────────────────────────────────────────
-- Cycle de vie : authorize → capture | void | refund.
-- Idempotent via provider_ref unique.
create table merchant_transactions (
  id                  uuid    primary key default gen_random_uuid(),
  checkout_session_id uuid    not null references checkout_sessions (id) on delete restrict,
  merchant_id         uuid    not null references merchants (id) on delete restrict,
  type                merchant_transaction_type not null,
  status              merchant_transaction_status not null default 'pending',
  amount_cents        bigint  not null check (amount_cents > 0),
  currency            currency not null default 'USD',
  provider_ref        text    unique,
  metadata_json       jsonb   not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);
create index idx_merchant_tx_session  on merchant_transactions (checkout_session_id);
create index idx_merchant_tx_merchant on merchant_transactions (merchant_id, created_at desc);

-- ── webhook_events ────────────────────────────────────────────────────────
-- Log de chaque event à livrer aux marchands (avec retry jusqu'à 5 tentatives).
create table webhook_events (
  id              uuid    primary key default gen_random_uuid(),
  merchant_id     uuid    not null references merchants (id) on delete cascade,
  event_type      text    not null,
  payload_json    jsonb   not null,
  status          text    not null default 'pending'
    check (status in ('pending', 'delivered', 'failed')),
  attempts        integer not null default 0,
  last_attempt_at timestamptz,
  delivered_at    timestamptz,
  created_at      timestamptz not null default now()
);
create index idx_webhook_events_merchant on webhook_events (merchant_id, created_at desc);
create index idx_webhook_events_pending  on webhook_events (status, created_at)
  where status = 'pending';

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table checkout_sessions     enable row level security;
alter table merchant_transactions  enable row level security;
alter table webhook_events         enable row level security;

-- checkout_sessions : lisible par l'acheteur connecté (sa propre session)
-- ou par n'importe qui si encore non assignée (user_id is null = session pending).
-- Le token de 192 bits joue le rôle de secret — la RLS complète le modèle.
create policy checkout_session_buyer_select on checkout_sessions for select
  using (user_id = app_user_id() or user_id is null);

-- merchant_transactions et webhook_events : service_role uniquement.
-- Aucune politique consumer → invisibles côté navigateur. Voulu.
