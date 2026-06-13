import { assertSumEquals, splitIntoInstallments } from "@sensei/utils";
import type { ScoreBand } from "@sensei/types";

/**
 * Moteur de décision BNPL — V1, règles simples, transparentes (docs/BRAND_BRIEF.md : pas de
 * frais cachés ; docs/APP_SPEC.md : le BNPL consomme le score du bureau de crédit).
 * Logique PURE et testable. La même logique est répliquée dans l'Edge Function
 * `supabase/functions/bnpl-decision` (runtime Deno isolé).
 */

export const SCORE_MIN = 300;
export const SCORE_MAX = 850;

/** Score → tranche lisible (aligné sur l'enum score_band du dictionnaire). */
export function scoreToBand(score: number): ScoreBand {
  if (score < 580) return "poor";
  if (score < 670) return "fair";
  if (score < 740) return "good";
  if (score < 800) return "very_good";
  return "excellent";
}

/** Plafond de financement par tranche, en cents USD. V1 — prudent et lisible. */
const MAX_PRINCIPAL_CENTS: Record<ScoreBand, number> = {
  poor: 0,
  fair: 50_000, // 500 $
  good: 150_000, // 1 500 $
  very_good: 300_000, // 3 000 $
  excellent: 500_000, // 5 000 $
};

/** Échéances autorisées en V1. */
export const ALLOWED_INSTALLMENTS = [3, 4] as const;

export interface BnplDecisionInput {
  score: number;
  principalCents: number;
  installmentCount: number;
}

export interface BnplDecisionApproved {
  approved: true;
  reasonCode: "approved";
  band: ScoreBand;
  principalCents: number;
  feeCents: number; // 0 en V1 (sans frais, transparent)
  totalCents: number;
  installmentCount: number;
}

export interface BnplDecisionDeclined {
  approved: false;
  reasonCode: "score_too_low" | "amount_over_limit" | "invalid_installments" | "invalid_amount";
  band: ScoreBand;
  message: string;
}

export type BnplDecision = BnplDecisionApproved | BnplDecisionDeclined;

/** Décide d'accorder ou non un financement, et à quelles conditions. */
export function decideBnpl(input: BnplDecisionInput): BnplDecision {
  const band = scoreToBand(input.score);

  if (!Number.isInteger(input.principalCents) || input.principalCents <= 0) {
    return { approved: false, reasonCode: "invalid_amount", band, message: "Montant invalide." };
  }
  if (!ALLOWED_INSTALLMENTS.includes(input.installmentCount as 3 | 4)) {
    return {
      approved: false,
      reasonCode: "invalid_installments",
      band,
      message: "Nombre d'échéances non autorisé (3 ou 4 en V1).",
    };
  }
  if (input.score < 580) {
    return {
      approved: false,
      reasonCode: "score_too_low",
      band,
      message: "Score insuffisant pour un financement.",
    };
  }
  const max = MAX_PRINCIPAL_CENTS[band];
  if (input.principalCents > max) {
    return {
      approved: false,
      reasonCode: "amount_over_limit",
      band,
      message: `Montant supérieur au plafond de votre tranche (${max} cents).`,
    };
  }

  const feeCents = 0; // V1 : sans frais
  return {
    approved: true,
    reasonCode: "approved",
    band,
    principalCents: input.principalCents,
    feeCents,
    totalCents: input.principalCents + feeCents,
    installmentCount: input.installmentCount,
  };
}

export interface PlannedInstallment {
  sequence: number;
  amountCents: number;
  dueDate: string; // YYYY-MM-DD
}

/** Construit l'échéancier : montants entiers (sans perdre un cent) + dates mensuelles. */
export function buildInstallments(
  totalCents: number,
  count: number,
  startDate: Date,
): PlannedInstallment[] {
  const amounts = splitIntoInstallments(totalCents, count);
  assertSumEquals(amounts, totalCents);
  return amounts.map((amountCents, i) => {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    return { sequence: i + 1, amountCents, dueDate: d.toISOString().slice(0, 10) };
  });
}

/**
 * Impact d'un événement sur le score (V1, règles simples). Append-only : on calcule le
 * nouveau score, on n'écrase jamais l'historique (docs/ERROR_LOG.md [credit]).
 */
export const SCORE_DELTAS = {
  on_time_payment: 8,
  late_payment: -25,
  bnpl_completed: 20,
  bnpl_default: -60,
  new_inquiry: -3,
} as const;

export type ScoreReasonCode = keyof typeof SCORE_DELTAS;

/** Applique un delta de score en restant borné à [SCORE_MIN, SCORE_MAX]. */
export function applyScoreDelta(current: number, reason: ScoreReasonCode): number {
  const next = current + SCORE_DELTAS[reason];
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, next));
}
