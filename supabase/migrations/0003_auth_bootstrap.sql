-- ─────────────────────────────────────────────────────────────────────────
-- Sensei — Bootstrap utilisateur + politiques d'écriture (checkout authentifié).
--
-- 1) À la création d'un compte Auth, on crée automatiquement la ligne `users` et un
--    `credit_profiles` de départ (score 600 = "fair", permet un BNPL d'entrée de gamme).
--    Pattern Supabase standard : trigger SECURITY DEFINER sur auth.users.
-- 2) Politiques INSERT manquantes pour que l'utilisateur authentifié puisse créer SES
--    propres recherche/offre/demande/plan/échéances/réservation (RLS, owner = app_user_id()).
--    Le SCORE et les PAIEMENTS restent écrits côté serveur (service_role) — l'utilisateur
--    ne peut ni gonfler son score ni simuler un encaissement.
-- ─────────────────────────────────────────────────────────────────────────

-- 1) Trigger de bootstrap ----------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_user_id uuid;
  resolved_phone text;
begin
  -- phone fourni à l'inscription (metadata) ou fallback unique pour ne pas violer l'unicité
  resolved_phone := coalesce(
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    new.phone,
    'pending-' || left(new.id::text, 18)
  );

  insert into public.users (auth_id, phone, email, full_name, kyc_status)
  values (
    new.id,
    resolved_phone,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'unverified'
  )
  returning id into new_user_id;

  insert into public.credit_profiles (user_id, current_score, score_band)
  values (new_user_id, 600, 'fair');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2) Politiques INSERT (écritures appartenant à l'utilisateur) ----------------
-- Idempotent : drop-if-exists avant chaque create (migration rejouable).

-- Recherches & offres de vol
drop policy if exists flight_offers_insert on flight_offers;
create policy flight_offers_insert on flight_offers for insert
  with check (search_id in (select id from flight_searches where user_id = app_user_id()));

-- BNPL : demande, plan, échéances
drop policy if exists bnpl_app_insert on bnpl_applications;
create policy bnpl_app_insert on bnpl_applications for insert
  with check (user_id = app_user_id());
drop policy if exists bnpl_plan_insert on bnpl_plans;
create policy bnpl_plan_insert on bnpl_plans for insert
  with check (user_id = app_user_id());
drop policy if exists installments_insert on installments;
create policy installments_insert on installments for insert
  with check (plan_id in (select id from bnpl_plans where user_id = app_user_id()));

-- Réservations (création + mise à jour de statut/paiement par le propriétaire)
drop policy if exists bookings_insert on bookings;
create policy bookings_insert on bookings for insert
  with check (user_id = app_user_id());
drop policy if exists bookings_update on bookings;
create policy bookings_update on bookings for update
  using (user_id = app_user_id())
  with check (user_id = app_user_id());
