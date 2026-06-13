-- ─────────────────────────────────────────────────────────────────────────
-- Sensei — Migration initiale du schéma.
-- Traduction directe de docs/DATA_DICTIONARY.md. Toute divergence est un bug.
-- Conventions : snake_case, PK uuid, argent = bigint cents USD, dates timestamptz UTC.
-- ─────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ── Énumérations (DATA_DICTIONARY §0) ────────────────────────────────────
create type currency               as enum ('USD');
create type language               as enum ('fr', 'en', 'ln', 'sw');
create type kyc_status             as enum ('unverified', 'pending', 'verified', 'rejected');
create type consent_scope          as enum ('credit_score_read', 'credit_report_read', 'data_sharing_lender');
create type score_band             as enum ('poor', 'fair', 'good', 'very_good', 'excellent');
create type bnpl_application_status as enum ('draft', 'submitted', 'approved', 'declined', 'expired');
create type bnpl_plan_status       as enum ('active', 'completed', 'defaulted', 'cancelled');
create type installment_status     as enum ('scheduled', 'due', 'paid', 'late', 'failed', 'waived');
create type payment_method_type    as enum ('mobile_money', 'card', 'bnpl');
create type payment_status         as enum ('initiated', 'pending', 'succeeded', 'failed', 'refunded');
create type booking_status         as enum ('searching', 'held', 'pending_payment', 'confirmed', 'cancelled', 'refunded');
create type actor_type             as enum ('consumer', 'lender', 'merchant', 'staff', 'system');

-- ── Helper: trigger updated_at ───────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 1. users ─────────────────────────────────────────────────────────────
create table users (
  id                 uuid primary key default gen_random_uuid(),
  auth_id            uuid not null unique references auth.users (id) on delete cascade,
  email              text unique,
  phone              text not null unique,
  full_name          text not null default '',
  preferred_language language not null default 'fr',
  kyc_status         kyc_status not null default 'unverified',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger users_updated_at before update on users
  for each row execute function set_updated_at();

-- ── 2. identities (KYC) ──────────────────────────────────────────────────
create table identities (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users (id) on delete cascade,
  id_type       text not null check (id_type in ('national_id','passport','voter_card','driver_license')),
  id_number     text not null,           -- chiffré au repos (à gérer applicativement)
  document_url  text,                     -- Storage privé
  verified_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- ── 3. consents (registre de consentement) ───────────────────────────────
create table consents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  scope       consent_scope not null,
  granted_to  uuid,                       -- lenders.id (FK ajoutée après création de lenders)
  is_active   boolean not null default true,
  granted_at  timestamptz not null default now(),
  revoked_at  timestamptz
);

-- ── 8.1 lenders ──────────────────────────────────────────────────────────
create table lenders (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  api_key_hash  text not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);
alter table consents
  add constraint consents_granted_to_fkey foreign key (granted_to) references lenders (id);

-- ── 8.2 merchants ────────────────────────────────────────────────────────
create table merchants (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  settlement_account text,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

-- ── 4.1 credit_profiles ──────────────────────────────────────────────────
create table credit_profiles (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references users (id) on delete cascade,
  current_score    integer not null default 500 check (current_score between 300 and 850),
  score_band       score_band not null default 'fair',
  score_updated_at timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

-- ── 4.2 credit_score_events (append-only) ────────────────────────────────
create table credit_score_events (
  id                uuid primary key default gen_random_uuid(),
  credit_profile_id uuid not null references credit_profiles (id) on delete cascade,
  previous_score    integer not null,
  new_score         integer not null,
  reason_code       text not null,
  source            text not null,
  created_at        timestamptz not null default now()
);

-- ── 4.3 credit_report_lines ──────────────────────────────────────────────
create table credit_report_lines (
  id                uuid primary key default gen_random_uuid(),
  credit_profile_id uuid not null references credit_profiles (id) on delete cascade,
  category          text not null,
  description       text not null default '',
  amount_cents      bigint not null default 0,
  currency          currency not null default 'USD',
  status            text not null check (status in ('current','late','closed','disputed')),
  reported_by       uuid references lenders (id),
  created_at        timestamptz not null default now()
);

-- ── 4.4 credit_inquiries (trace des consultations B2B) ───────────────────
create table credit_inquiries (
  id                uuid primary key default gen_random_uuid(),
  credit_profile_id uuid not null references credit_profiles (id) on delete cascade,
  requested_by      uuid not null references lenders (id),
  consent_id        uuid not null references consents (id),  -- consentement obligatoire
  inquiry_type      text not null check (inquiry_type in ('soft','hard')),
  created_at        timestamptz not null default now()
);

-- ── 4.5 disputes ─────────────────────────────────────────────────────────
create table disputes (
  id                    uuid primary key default gen_random_uuid(),
  credit_report_line_id uuid not null references credit_report_lines (id) on delete cascade,
  user_id               uuid not null references users (id) on delete cascade,
  reason                text not null,
  status                text not null default 'open' check (status in ('open','under_review','resolved','rejected')),
  created_at            timestamptz not null default now(),
  resolved_at           timestamptz
);

-- ── 5.1 bnpl_applications ────────────────────────────────────────────────
create table bnpl_applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users (id) on delete cascade,
  merchant_id     uuid references merchants (id),
  order_ref       text not null,
  principal_cents bigint not null check (principal_cents > 0),
  currency        currency not null default 'USD',
  status          bnpl_application_status not null default 'draft',
  decision_score  integer,
  decision_reason text,
  created_at      timestamptz not null default now(),
  decided_at      timestamptz
);

-- ── 5.2 bnpl_plans ───────────────────────────────────────────────────────
create table bnpl_plans (
  id                uuid primary key default gen_random_uuid(),
  application_id    uuid not null references bnpl_applications (id) on delete cascade,
  user_id           uuid not null references users (id) on delete cascade,
  principal_cents   bigint not null check (principal_cents > 0),
  fee_cents         bigint not null default 0 check (fee_cents >= 0),
  total_cents       bigint not null check (total_cents > 0),
  installment_count integer not null check (installment_count > 0),
  currency          currency not null default 'USD',
  status            bnpl_plan_status not null default 'active',
  created_at        timestamptz not null default now(),
  -- garde-fou : le total doit correspondre au capital + frais
  constraint bnpl_plan_total_check check (total_cents = principal_cents + fee_cents)
);

-- ── 5.3 installments ─────────────────────────────────────────────────────
create table installments (
  id           uuid primary key default gen_random_uuid(),
  plan_id      uuid not null references bnpl_plans (id) on delete cascade,
  sequence     integer not null check (sequence > 0),
  amount_cents bigint not null check (amount_cents > 0),
  due_date     date not null,
  status       installment_status not null default 'scheduled',
  paid_at      timestamptz,
  unique (plan_id, sequence)
);

-- ── 6.1 payment_methods ──────────────────────────────────────────────────
create table payment_methods (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users (id) on delete cascade,
  type              payment_method_type not null,
  provider          text not null,
  masked_identifier text not null,
  is_default        boolean not null default false,
  created_at        timestamptz not null default now()
);

-- ── 6.2 payments ─────────────────────────────────────────────────────────
create table payments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users (id) on delete cascade,
  payment_method_id uuid references payment_methods (id),
  purpose           text not null check (purpose in ('booking','installment','bnpl_settlement')),
  reference_id      uuid not null,
  amount_cents      bigint not null check (amount_cents > 0),
  currency          currency not null default 'USD',
  status            payment_status not null default 'initiated',
  provider_ref      text unique,          -- idempotence (ERROR_LOG [payments])
  created_at        timestamptz not null default now(),
  settled_at        timestamptz
);

-- ── 7.1 flight_searches ──────────────────────────────────────────────────
create table flight_searches (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references users (id) on delete set null,
  origin          text not null,          -- IATA
  destination     text not null,          -- IATA
  depart_date     date not null,
  return_date     date,
  passenger_count integer not null default 1 check (passenger_count > 0),
  cabin_class     text not null default 'economy' check (cabin_class in ('economy','premium','business')),
  created_at      timestamptz not null default now()
);

-- ── 7.2 flight_offers ────────────────────────────────────────────────────
create table flight_offers (
  id                uuid primary key default gen_random_uuid(),
  search_id         uuid not null references flight_searches (id) on delete cascade,
  provider          text not null,
  provider_offer_id text not null,
  total_cents       bigint not null check (total_cents > 0),
  currency          currency not null default 'USD',
  expires_at        timestamptz not null,
  segments_json     jsonb not null default '[]'::jsonb
);

-- ── 7.3 bookings ─────────────────────────────────────────────────────────
create table bookings (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references users (id) on delete cascade,
  offer_id             uuid not null references flight_offers (id),
  provider_booking_ref text,
  status               booking_status not null default 'pending_payment',
  total_cents          bigint not null check (total_cents > 0),
  currency             currency not null default 'USD',
  payment_id           uuid references payments (id),
  bnpl_plan_id         uuid references bnpl_plans (id),
  created_at           timestamptz not null default now(),
  confirmed_at         timestamptz
);

-- ── 7.4 passengers ───────────────────────────────────────────────────────
create table passengers (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references bookings (id) on delete cascade,
  full_name       text not null,
  birth_date      date,
  document_number text,
  type            text not null default 'adult' check (type in ('adult','child','infant'))
);

-- ── 8.3 audit_logs (journal transverse) ──────────────────────────────────
create table audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_type   actor_type not null,
  actor_id     uuid,
  action       text not null,
  target_table text not null,
  target_id    uuid not null,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- ── Index utiles ─────────────────────────────────────────────────────────
create index idx_consents_user           on consents (user_id) where is_active;
create index idx_score_events_profile    on credit_score_events (credit_profile_id, created_at desc);
create index idx_inquiries_profile       on credit_inquiries (credit_profile_id, created_at desc);
create index idx_bnpl_plans_user         on bnpl_plans (user_id);
create index idx_installments_plan       on installments (plan_id, sequence);
create index idx_installments_due        on installments (due_date) where status in ('scheduled','due','late');
create index idx_payments_user           on payments (user_id, created_at desc);
create index idx_bookings_user           on bookings (user_id, created_at desc);
create index idx_audit_target            on audit_logs (target_table, target_id);
