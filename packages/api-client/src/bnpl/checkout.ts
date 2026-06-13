import type { SupabaseClient } from "@supabase/supabase-js";
import { type BnplDecision, buildInstallments, decideBnpl } from "@sensei/payments";

/**
 * Orchestration d'un checkout BNPL : décision → application → plan → échéancier.
 * S'appuie sur le moteur pur `@sensei/payments`. Écrit dans Supabase via le client fourni.
 * (docs/CLAUDE.md §3 : tout accès backend passe par ce package.)
 */

export interface BnplCheckoutParams {
  userId: string;
  orderRef: string; // ex : bookings.id
  principalCents: number;
  installmentCount: number;
  score: number; // score courant lu depuis credit_profiles
  merchantId?: string | null;
}

export interface BnplCheckoutResult {
  decision: BnplDecision;
  applicationId: string;
  planId?: string;
}

export async function createBnplCheckout(
  supabase: SupabaseClient,
  params: BnplCheckoutParams,
): Promise<BnplCheckoutResult> {
  const decision = decideBnpl({
    score: params.score,
    principalCents: params.principalCents,
    installmentCount: params.installmentCount,
  });

  const { data: app, error: appErr } = await supabase
    .from("bnpl_applications")
    .insert({
      user_id: params.userId,
      merchant_id: params.merchantId ?? null,
      order_ref: params.orderRef,
      principal_cents: params.principalCents,
      status: decision.approved ? "approved" : "declined",
      decision_score: params.score,
      decision_reason: decision.reasonCode,
      decided_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (appErr) throw appErr;

  if (!decision.approved) {
    return { decision, applicationId: app.id };
  }

  const { data: plan, error: planErr } = await supabase
    .from("bnpl_plans")
    .insert({
      application_id: app.id,
      user_id: params.userId,
      principal_cents: decision.principalCents,
      fee_cents: decision.feeCents,
      total_cents: decision.totalCents,
      installment_count: decision.installmentCount,
      status: "active",
    })
    .select("id")
    .single();
  if (planErr) throw planErr;

  const planned = buildInstallments(decision.totalCents, decision.installmentCount, new Date());
  const { error: insErr } = await supabase.from("installments").insert(
    planned.map((p) => ({
      plan_id: plan.id,
      sequence: p.sequence,
      amount_cents: p.amountCents,
      due_date: p.dueDate,
      status: "scheduled",
    })),
  );
  if (insErr) throw insErr;

  return { decision, applicationId: app.id, planId: plan.id };
}
