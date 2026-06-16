// Edge Function `merchant-capture`
// Confirme l'encaissement d'une transaction autorisée.
// Appelée côté serveur marchand après fulfillment de la commande.
// Idempotente via provider_ref unique.

import {
  adminClient,
  computeCommission,
  corsHeaders,
  findMerchantBySecretKey,
  json,
} from "../_shared/merchant.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { secretKey, transactionId } = body as {
    secretKey?: string;
    transactionId?: string;
  };

  if (!secretKey || !transactionId)
    return json({ error: "secret_key_and_transaction_id_required" }, 400);

  const admin = adminClient();
  const merchant = await findMerchantBySecretKey(admin, secretKey);
  if (!merchant) return json({ error: "invalid_secret_key" }, 401);

  // Charger la transaction authorize
  const { data: authTx } = await admin
    .from("merchant_transactions")
    .select("id, checkout_session_id, merchant_id, amount_cents, currency, status")
    .eq("id", transactionId)
    .eq("type", "authorize")
    .maybeSingle();

  if (!authTx) return json({ error: "authorize_transaction_not_found" }, 404);
  if (authTx.merchant_id !== merchant.id) return json({ error: "forbidden" }, 403);
  if (authTx.status !== "succeeded")
    return json({ error: "transaction_not_authorized" }, 409);

  // Idempotence : capture déjà créée ?
  const { data: existing } = await admin
    .from("merchant_transactions")
    .select("id")
    .eq("checkout_session_id", authTx.checkout_session_id)
    .eq("type", "capture")
    .maybeSingle();

  let captureId: string;

  if (existing) {
    captureId = existing.id;
  } else {
    const { data: tx, error: txErr } = await admin
      .from("merchant_transactions")
      .insert({
        checkout_session_id: authTx.checkout_session_id,
        merchant_id: merchant.id,
        type: "capture",
        status: "succeeded",
        amount_cents: authTx.amount_cents,
        currency: authTx.currency,
        provider_ref: `capture_${authTx.checkout_session_id}`,
      })
      .select("id")
      .single();

    if (txErr || !tx) return json({ error: "capture_failed" }, 500);
    captureId = tx.id;

    await admin.from("webhook_events").insert({
      merchant_id: merchant.id,
      event_type: "PAYMENT.CAPTURED",
      payload_json: {
        transactionId: tx.id,
        authorizeId: transactionId,
        amountCents: authTx.amount_cents,
        currency: authTx.currency,
      },
    });
  }

  // ── Versement marchand (V1 : paiement MOCKÉ, même convention que pay-installment) ──
  // Au déploiement réel, remplacer ce bloc par le vrai rail de règlement (mobile money) —
  // le reste (calcul commission/net, traçabilité) ne bouge pas.
  // On vérifie l'existence même si `existing` était déjà là : un crash entre l'insert de
  // la capture et celui du payout ne doit jamais laisser un marchand livré et jamais payé.
  const { data: existingPayout } = await admin
    .from("merchant_payouts")
    .select("id, status, net_amount_cents, commission_cents")
    .eq("capture_transaction_id", captureId)
    .eq("type", "payout")
    .maybeSingle();

  let payout = existingPayout;

  if (!payout) {
    const { commissionCents, netCents } = computeCommission(
      authTx.amount_cents,
      merchant.commission_bps,
    );
    const hasSettlementAccount = !!merchant.settlement_account;

    const { data: newPayout, error: payoutErr } = await admin
      .from("merchant_payouts")
      .insert({
        merchant_id: merchant.id,
        type: "payout",
        status: hasSettlementAccount ? "succeeded" : "pending",
        capture_transaction_id: captureId,
        commission_bps_snapshot: merchant.commission_bps,
        gross_amount_cents: authTx.amount_cents,
        commission_cents: commissionCents,
        net_amount_cents: netCents,
        currency: authTx.currency,
        settlement_account: merchant.settlement_account,
        provider_ref: `payout_capture_${captureId}`,
        settled_at: hasSettlementAccount ? new Date().toISOString() : null,
      })
      .select("id, status, net_amount_cents, commission_cents")
      .single();

    if (payoutErr || !newPayout) {
      // La capture est déjà actée ; on ne fait pas échouer la requête, mais on logue
      // pour permettre une réconciliation manuelle (le marchand reste dû).
      console.error("merchant payout insert error:", payoutErr);
    } else {
      payout = newPayout;
      if (payout.status === "succeeded") {
        await admin.from("webhook_events").insert({
          merchant_id: merchant.id,
          event_type: "PAYOUT.PAID",
          payload_json: {
            payoutId: payout.id,
            captureId,
            grossAmountCents: authTx.amount_cents,
            commissionCents: payout.commission_cents,
            netAmountCents: payout.net_amount_cents,
            currency: authTx.currency,
          },
        });
      }
    }
  }

  return json({
    transactionId: captureId,
    status: "captured",
    alreadyCaptured: !!existing,
    payout: payout
      ? {
          id: payout.id,
          status: payout.status,
          netAmountCents: payout.net_amount_cents,
          commissionCents: payout.commission_cents,
        }
      : null,
  });
});
