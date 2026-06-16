-- ─────────────────────────────────────────────────────────────────────────
-- Sensei — Traçabilité des accès au score par les marchands
-- consents.granted_to et credit_inquiries.requested_by ne pointaient que vers
-- lenders (B2B, V2). Le flux marchand BNPL (checkout-confirm, livré le
-- 2026-06-15) lit le score sans aucun consentement ni trace : violation de
-- CLAUDE.md §5 ("pas de donnée de crédit sans consent actif", "tout accès par
-- un tiers est tracé"). On généralise les deux colonnes en (type, id)
-- polymorphique sur `actor_type` — le même motif que audit_logs.actor_type/
-- actor_id, déjà dans 0001_init.sql — pour couvrir lender ET merchant.
-- ─────────────────────────────────────────────────────────────────────────

-- ── consents ─────────────────────────────────────────────────────────────
alter table consents drop constraint if exists consents_granted_to_fkey;
alter table consents rename column granted_to to granted_to_id;
alter table consents add column granted_to_type actor_type;

alter table consents
  add constraint consents_granted_to_consistency
  check ((granted_to_id is null) = (granted_to_type is null));

-- ── credit_inquiries ─────────────────────────────────────────────────────
alter table credit_inquiries drop constraint if exists credit_inquiries_requested_by_fkey;
alter table credit_inquiries rename column requested_by to requested_by_id;
alter table credit_inquiries add column requested_by_type actor_type not null default 'merchant';
alter table credit_inquiries alter column requested_by_type drop default;
