-- ─────────────────────────────────────────────────────────────────────────
-- Sensei — Portail marchands
-- Lie chaque marchand à un utilisateur (user_id), active la RLS pour que les
-- marchands lisent leurs propres données depuis le portail (JWT client).
-- ─────────────────────────────────────────────────────────────────────────

-- ── Lier merchants à users ────────────────────────────────────────────────
alter table merchants
  add column if not exists user_id uuid unique references users (id) on delete set null;

create index if not exists idx_merchants_user
  on merchants (user_id) where user_id is not null;

-- ── Helper : merchant_id de l'utilisateur connecté ────────────────────────
create or replace function app_merchant_id()
returns uuid language sql stable as $$
  select id from merchants
  where user_id = app_user_id()
    and is_active = true
  limit 1;
$$;

-- ── RLS merchants : lecture et mise à jour de sa propre ligne ─────────────
create policy merchant_self_select on merchants for select
  using (user_id = app_user_id());

create policy merchant_self_update on merchants for update
  using (user_id = app_user_id())
  with check (user_id = app_user_id());

-- ── RLS checkout_sessions : le marchand lit ses propres sessions ──────────
create policy checkout_sessions_merchant_select on checkout_sessions for select
  using (merchant_id = app_merchant_id());

-- ── RLS merchant_transactions : le marchand lit ses propres transactions ──
create policy merchant_tx_merchant_select on merchant_transactions for select
  using (merchant_id = app_merchant_id());

-- ── RLS webhook_events : le marchand lit ses propres events ──────────────
create policy webhook_events_merchant_select on webhook_events for select
  using (merchant_id = app_merchant_id());
