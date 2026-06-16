import { z } from "zod";

/**
 * Énumérations partagées — alignées sur docs/DATA_DICTIONARY.md §0.
 * Toute valeur ici DOIT correspondre exactement aux enums Postgres.
 */

export const Currency = z.enum(["USD"]);
export type Currency = z.infer<typeof Currency>;

export const Language = z.enum(["fr", "en", "ln", "sw"]);
export type Language = z.infer<typeof Language>;

export const KycStatus = z.enum(["unverified", "pending", "verified", "rejected"]);
export type KycStatus = z.infer<typeof KycStatus>;

export const ConsentScope = z.enum([
  "credit_score_read",
  "credit_report_read",
  "data_sharing_lender",
]);
export type ConsentScope = z.infer<typeof ConsentScope>;

export const ScoreBand = z.enum(["poor", "fair", "good", "very_good", "excellent"]);
export type ScoreBand = z.infer<typeof ScoreBand>;

export const BnplApplicationStatus = z.enum([
  "draft",
  "submitted",
  "approved",
  "declined",
  "expired",
]);
export type BnplApplicationStatus = z.infer<typeof BnplApplicationStatus>;

export const BnplPlanStatus = z.enum(["active", "completed", "defaulted", "cancelled"]);
export type BnplPlanStatus = z.infer<typeof BnplPlanStatus>;

export const InstallmentStatus = z.enum([
  "scheduled",
  "due",
  "paid",
  "late",
  "failed",
  "waived",
]);
export type InstallmentStatus = z.infer<typeof InstallmentStatus>;

export const PaymentMethodType = z.enum(["mobile_money", "card", "bnpl"]);
export type PaymentMethodType = z.infer<typeof PaymentMethodType>;

export const PaymentStatus = z.enum([
  "initiated",
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

export const BookingStatus = z.enum([
  "searching",
  "held",
  "pending_payment",
  "confirmed",
  "cancelled",
  "refunded",
]);
export type BookingStatus = z.infer<typeof BookingStatus>;

export const ActorType = z.enum(["consumer", "lender", "merchant", "staff", "system"]);
export type ActorType = z.infer<typeof ActorType>;

export const MerchantPayoutType = z.enum(["payout", "reversal"]);
export type MerchantPayoutType = z.infer<typeof MerchantPayoutType>;

export const MerchantPayoutStatus = z.enum(["pending", "succeeded", "failed"]);
export type MerchantPayoutStatus = z.infer<typeof MerchantPayoutStatus>;
