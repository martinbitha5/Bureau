-- ─────────────────────────────────────────────────────────────────────────
-- Sensei — Row Level Security.
-- RÈGLE (docs/CLAUDE.md §5, docs/ERROR_LOG.md [rls]) : RLS sur TOUTES les tables.
-- Une table sans politique = bug. Le service_role (Edge Functions) contourne la RLS
-- et sert aux opérations privilégiées (décision BNPL, écriture de score, audit).
-- ─────────────────────────────────────────────────────────────────────────

-- Helper : id applicatif (users.id) de l'utilisateur authentifié courant.
create or replace function app_user_id()
returns uuid language sql stable as $$
  select id from users where auth_id = auth.uid();
$$;

-- Active la RLS partout.
alter table users               enable row level security;
alter table identities          enable row level security;
alter table consents            enable row level security;
alter table lenders             enable row level security;
alter table merchants           enable row level security;
alter table credit_profiles     enable row level security;
alter table credit_score_events enable row level security;
alter table credit_report_lines enable row level security;
alter table credit_inquiries    enable row level security;
alter table disputes            enable row level security;
alter table bnpl_applications   enable row level security;
alter table bnpl_plans          enable row level security;
alter table installments        enable row level security;
alter table payment_methods     enable row level security;
alter table payments            enable row level security;
alter table flight_searches     enable row level security;
alter table flight_offers       enable row level security;
alter table bookings            enable row level security;
alter table passengers          enable row level security;
alter table audit_logs          enable row level security;

-- ── users : chacun lit/écrit sa propre ligne ─────────────────────────────
create policy users_self_select on users for select using (auth_id = auth.uid());
create policy users_self_update on users for update using (auth_id = auth.uid());

-- ── identities ───────────────────────────────────────────────────────────
create policy identities_owner on identities for all
  using (user_id = app_user_id()) with check (user_id = app_user_id());

-- ── consents : l'utilisateur gère ses propres consentements ──────────────
create policy consents_owner on consents for all
  using (user_id = app_user_id()) with check (user_id = app_user_id());

-- ── credit_profiles : lecture de SON profil uniquement ───────────────────
-- (l'accès tiers/B2B passe par une Edge Function en service_role qui vérifie consentement + audit)
create policy credit_profile_owner_select on credit_profiles for select
  using (user_id = app_user_id());

-- ── credit_score_events : lecture de son historique ──────────────────────
create policy score_events_owner_select on credit_score_events for select
  using (credit_profile_id in (select id from credit_profiles where user_id = app_user_id()));

-- ── credit_report_lines : lecture de son rapport ─────────────────────────
create policy report_lines_owner_select on credit_report_lines for select
  using (credit_profile_id in (select id from credit_profiles where user_id = app_user_id()));

-- ── credit_inquiries : l'utilisateur voit qui a consulté son score ───────
create policy inquiries_owner_select on credit_inquiries for select
  using (credit_profile_id in (select id from credit_profiles where user_id = app_user_id()));

-- ── disputes : l'utilisateur crée et lit ses contestations ───────────────
create policy disputes_owner on disputes for all
  using (user_id = app_user_id()) with check (user_id = app_user_id());

-- ── BNPL : l'utilisateur lit ses demandes/plans/échéances ────────────────
create policy bnpl_app_owner on bnpl_applications for select using (user_id = app_user_id());
create policy bnpl_plan_owner on bnpl_plans       for select using (user_id = app_user_id());
create policy installments_owner on installments  for select
  using (plan_id in (select id from bnpl_plans where user_id = app_user_id()));

-- ── Paiements ────────────────────────────────────────────────────────────
create policy payment_methods_owner on payment_methods for all
  using (user_id = app_user_id()) with check (user_id = app_user_id());
create policy payments_owner_select on payments for select using (user_id = app_user_id());

-- ── Vols ─────────────────────────────────────────────────────────────────
-- Recherches : l'auteur (ou anonyme via service côté serveur). Offres : lisibles via la recherche.
create policy flight_searches_owner on flight_searches for all
  using (user_id = app_user_id() or user_id is null)
  with check (user_id = app_user_id() or user_id is null);
create policy flight_offers_via_search on flight_offers for select
  using (search_id in (select id from flight_searches where user_id = app_user_id() or user_id is null));
create policy bookings_owner on bookings for select using (user_id = app_user_id());
create policy passengers_owner on passengers for all
  using (booking_id in (select id from bookings where user_id = app_user_id()))
  with check (booking_id in (select id from bookings where user_id = app_user_id()));

-- ── lenders / merchants / audit_logs ─────────────────────────────────────
-- Pas de politique d'accès direct pour les consumers : ces tables ne sont manipulées
-- que par le back-office en service_role. RLS activée => invisibles côté client. C'est voulu.
