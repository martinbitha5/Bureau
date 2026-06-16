import { z } from "zod";
import {
  ActorType,
  BnplApplicationStatus,
  BnplPlanStatus,
  BookingStatus,
  ConsentScope,
  Currency,
  InstallmentStatus,
  KycStatus,
  Language,
  MerchantPayoutStatus,
  MerchantPayoutType,
  PaymentMethodType,
  PaymentStatus,
  ScoreBand,
} from "./enums";

/**
 * Schémas d'entités — alignés sur docs/DATA_DICTIONARY.md.
 * Règle d'or : l'argent est TOUJOURS un entier en cents USD (`*_cents`).
 */

const uuid = z.string().uuid();
const timestamp = z.string().datetime({ offset: true });
const cents = z.number().int(); // entier ; jamais de float pour de l'argent

// ── Compte & identité ────────────────────────────────────────
export const User = z.object({
  id: uuid,
  auth_id: uuid,
  email: z.string().email().nullable(),
  phone: z.string(), // E.164, ex: +243...
  full_name: z.string(),
  preferred_language: Language.default("fr"),
  kyc_status: KycStatus.default("unverified"),
  created_at: timestamp,
  updated_at: timestamp,
});
export type User = z.infer<typeof User>;

export const Consent = z.object({
  id: uuid,
  user_id: uuid,
  scope: ConsentScope,
  granted_to_type: ActorType.nullable(),
  granted_to_id: uuid.nullable(),
  is_active: z.boolean().default(true),
  granted_at: timestamp,
  revoked_at: timestamp.nullable(),
});
export type Consent = z.infer<typeof Consent>;

// ── Crédit ───────────────────────────────────────────────────
export const CreditProfile = z.object({
  id: uuid,
  user_id: uuid,
  current_score: z.number().int().min(300).max(850),
  score_band: ScoreBand,
  score_updated_at: timestamp,
  created_at: timestamp,
});
export type CreditProfile = z.infer<typeof CreditProfile>;

export const CreditScoreEvent = z.object({
  id: uuid,
  credit_profile_id: uuid,
  previous_score: z.number().int(),
  new_score: z.number().int(),
  reason_code: z.string(),
  source: z.string(),
  created_at: timestamp,
});
export type CreditScoreEvent = z.infer<typeof CreditScoreEvent>;

export const CreditInquiry = z.object({
  id: uuid,
  credit_profile_id: uuid,
  requested_by_type: ActorType,
  requested_by_id: uuid,
  consent_id: uuid,
  inquiry_type: z.enum(["soft", "hard"]),
  created_at: timestamp,
});
export type CreditInquiry = z.infer<typeof CreditInquiry>;

// ── BNPL ─────────────────────────────────────────────────────
export const BnplApplication = z.object({
  id: uuid,
  user_id: uuid,
  merchant_id: uuid.nullable(),
  order_ref: z.string(),
  principal_cents: cents,
  currency: Currency,
  status: BnplApplicationStatus,
  decision_score: z.number().int().nullable(),
  decision_reason: z.string().nullable(),
  created_at: timestamp,
  decided_at: timestamp.nullable(),
});
export type BnplApplication = z.infer<typeof BnplApplication>;

export const BnplPlan = z.object({
  id: uuid,
  application_id: uuid,
  user_id: uuid,
  principal_cents: cents,
  fee_cents: cents,
  total_cents: cents,
  installment_count: z.number().int().positive(),
  currency: Currency,
  status: BnplPlanStatus,
  created_at: timestamp,
});
export type BnplPlan = z.infer<typeof BnplPlan>;

export const Installment = z.object({
  id: uuid,
  plan_id: uuid,
  sequence: z.number().int().positive(),
  amount_cents: cents,
  due_date: z.string(), // date (YYYY-MM-DD)
  status: InstallmentStatus,
  paid_at: timestamp.nullable(),
});
export type Installment = z.infer<typeof Installment>;

// ── Paiements ────────────────────────────────────────────────
export const Payment = z.object({
  id: uuid,
  user_id: uuid,
  payment_method_id: uuid.nullable(),
  purpose: z.string(),
  reference_id: uuid,
  amount_cents: cents,
  currency: Currency,
  status: PaymentStatus,
  provider_ref: z.string().nullable(),
  created_at: timestamp,
  settled_at: timestamp.nullable(),
});
export type Payment = z.infer<typeof Payment>;

export const PaymentMethod = z.object({
  id: uuid,
  user_id: uuid,
  type: PaymentMethodType,
  provider: z.string(),
  masked_identifier: z.string(),
  is_default: z.boolean().default(false),
  created_at: timestamp,
});
export type PaymentMethod = z.infer<typeof PaymentMethod>;

// ── Marchand / règlement ─────────────────────────────────────
export const MerchantPayout = z.object({
  id: uuid,
  merchant_id: uuid,
  type: MerchantPayoutType,
  status: MerchantPayoutStatus,
  capture_transaction_id: uuid,
  refund_transaction_id: uuid.nullable(),
  source_payout_id: uuid.nullable(),
  commission_bps_snapshot: z.number().int().min(0).max(10000),
  gross_amount_cents: cents,
  commission_cents: cents,
  net_amount_cents: cents,
  currency: Currency,
  settlement_account: z.string().nullable(),
  created_at: timestamp,
  settled_at: timestamp.nullable(),
});
export type MerchantPayout = z.infer<typeof MerchantPayout>;

// ── Vols ─────────────────────────────────────────────────────
export const Booking = z.object({
  id: uuid,
  user_id: uuid,
  offer_id: uuid,
  provider_booking_ref: z.string().nullable(),
  status: BookingStatus,
  total_cents: cents,
  currency: Currency,
  payment_id: uuid.nullable(),
  bnpl_plan_id: uuid.nullable(),
  created_at: timestamp,
  confirmed_at: timestamp.nullable(),
});
export type Booking = z.infer<typeof Booking>;

// ── Audit ────────────────────────────────────────────────────
export const AuditLog = z.object({
  id: uuid,
  actor_type: ActorType,
  actor_id: uuid.nullable(),
  action: z.string(),
  target_table: z.string(),
  target_id: uuid,
  metadata: z.record(z.unknown()).default({}),
  created_at: timestamp,
});
export type AuditLog = z.infer<typeof AuditLog>;
