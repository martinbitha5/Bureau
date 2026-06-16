// Edge Function `merchant-refund`
// Rembourse une transaction capturée — totalement ou partiellement.
// Remboursement total : plan cancelled, échéances non payées waived.
// Dans les deux cas : reprise proportionnelle du versement marchand (merchant_payouts).

import { adminClient, corsHeaders, findMerchantBySecretKey, json } from "../_shared/merchant.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { secretKey, transactionId, amountCents } = body as {
    secretKey?: string;
    transactionId?: string;
    amountCents?: number;
  };

  if (!secretKey || !transactionId)
    return json({ error: "secret_key_and_transaction_id_required" }, 400);

  const admin = adminClient();
  const merchant = await findMerchantBySecretKey(admin, secretKey);
  if (!merchant) return json({ error: "invalid_secret_key" }, 401);

  const { data: captureTx } = await admin
    .from("merchant_transactions")
    .select("id, checkout_session_id, merchant_id, amount_cents, currency")
    .eq("id", transactionId)
    .eq("type", "capture")
    .maybeSingle();

  if (!captureTx) return json({ error: "capture_transaction_not_found" }, 404);
  if (captureTx.merchant_id !== merchant.id) return json({ error: "forbidden" }, 403);

  // Sommer les remboursements déjà émis sur cette capture — sinon des remboursements
  // partiels successifs (ou un partiel suivi d'un "total") pourraient dépasser le
  // montant réellement capturé et sur-reprendre le versement marchand.
  const { data: priorRefunds } = await admin
    .from("merchant_transactions")
    .select("amount_cents")
    .eq("checkout_session_id", captureTx.checkout_session_id)
    .eq("type", "refund");

  const alreadyRefunded = (priorRefunds ?? []).reduce((sum, r) => sum + r.amount_cents, 0);
  const remaining = captureTx.amount_cents - alreadyRefunded;

  const refundAmount = amountCents ?? remaining;
  if (!Number.isInteger(refundAmount) || refundAmount <= 0)
    return json({ error: "amount_cents_must_be_positive_integer" }, 400);
  if (refundAmount > remaining)
    return json({ error: "refund_exceeds_remaining_captured_amount" }, 400);

  const isFullRefund = alreadyRefunded + refundAmount === captureTx.amount_cents;

  const { data: tx, error: txErr } = await admin
    .from("merchant_transactions")
    .insert({
      checkout_session_id: captureTx.checkout_session_id,
      merchant_id: merchant.id,
      type: "refund",
      status: "succeeded",
      amount_cents: refundAmount,
      currency: captureTx.currency,
      provider_ref: `refund_${captureTx.id}_${Date.now()}`,
      metadata_json: { isPartial: !isFullRefund, captureId: transactionId },
    })
    .select("id")
    .single();

  if (txErr || !tx) return json({ error: "refund_failed" }, 500);

  // Remboursement total : annuler le plan et délier les échéances non payées.
  // IMPORTANT : un remboursement est une décision du MARCHAND (retour produit,
  // rupture de stock, etc.) — ce n'est PAS un défaut de paiement de l'acheteur.
  // On n'applique donc JAMAIS d'impact score ici. Le seul chemin qui pénalise
  // le score acheteur reste un véritable impayé d'échéance, détecté ailleurs
  // (pay-installment / job de relance), pas merchant-refund.
  if (isFullRefund) {
    const { data: session } = await admin
      .from("checkout_sessions")
      .select("plan_id")
      .eq("id", captureTx.checkout_session_id)
      .single();

    if (session?.plan_id) {
      await admin.from("bnpl_plans").update({ status: "cancelled" }).eq("id", session.plan_id);
      await admin
        .from("installments")
        .update({ status: "waived" })
        .eq("plan_id", session.plan_id)
        .neq("status", "paid");
    }
  }

  // ── Reprise du versement marchand (reversal), proportionnelle au remboursement ──
  const { data: originalPayout } = await admin
    .from("merchant_payouts")
    .select("id, status, commission_bps_snapshot, currency, settlement_account")
    .eq("capture_transaction_id", captureTx.id)
    .eq("type", "payout")
    .maybeSingle();

  if (originalPayout) {
    // On reprend le MÊME taux snapshoté que le versement initial (pas le taux
    // courant du marchand, qui peut avoir changé depuis).
    const bps = originalPayout.commission_bps_snapshot;
    const reversalCommissionCents = Math.round((refundAmount * bps) / 10000);
    const reversalNetCents = refundAmount - reversalCommissionCents;

    const { data: reversal } = await admin
      .from("merchant_payouts")
      .insert({
        merchant_id: merchant.id,
        type: "reversal",
        // Si le versement d'origine n'a jamais été physiquement réglé (pending,
        // settlement_account manquant), la reprise ne peut pas être "succeeded"
        // non plus — l'argent n'a jamais quitté Sensei.
        status: originalPayout.status === "pending" ? "pending" : "succeeded",
        capture_transaction_id: captureTx.id,
        refund_transaction_id: tx.id,
        source_payout_id: originalPayout.id,
        commission_bps_snapshot: bps,
        gross_amount_cents: refundAmount,
        commission_cents: reversalCommissionCents,
        net_amount_cents: reversalNetCents,
        currency: originalPayout.currency,
        settlement_account: originalPayout.settlement_account,
        provider_ref: `reversal_refund_${tx.id}`,
        settled_at: originalPayout.status === "pending" ? null : new Date().toISOString(),
      })
      .select("id, status")
      .single();

    if (reversal?.status === "succeeded") {
      await admin.from("webhook_events").insert({
        merchant_id: merchant.id,
        event_type: "PAYOUT.REVERSED",
        payload_json: {
          payoutId: reversal.id,
          captureId: captureTx.id,
          refundTransactionId: tx.id,
          grossAmountCents: refundAmount,
          commissionCents: reversalCommissionCents,
          netAmountCents: reversalNetCents,
          currency: originalPayout.currency,
        },
      });
    }
  }

  await admin.from("webhook_events").insert({
    merchant_id: merchant.id,
    event_type: "PAYMENT.REFUNDED",
    payload_json: {
      transactionId: tx.id,
      captureId: transactionId,
      amountRefunded: refundAmount,
      isPartial: !isFullRefund,
    },
  });

  return json({
    transactionId: tx.id,
    status: "refunded",
    amountRefunded: refundAmount,
    isPartial: !isFullRefund,
  });
});
