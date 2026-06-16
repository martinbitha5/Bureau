// Edge Function `merchant-void`
// Annule une transaction avant capture : le plan BNPL est cancelled, aucune charge.
// Non disponible après capture (utiliser merchant-refund).

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

  const { secretKey, transactionId } = body as {
    secretKey?: string;
    transactionId?: string;
  };

  if (!secretKey || !transactionId)
    return json({ error: "secret_key_and_transaction_id_required" }, 400);

  const admin = adminClient();
  const merchant = await findMerchantBySecretKey(admin, secretKey);
  if (!merchant) return json({ error: "invalid_secret_key" }, 401);

  const { data: authTx } = await admin
    .from("merchant_transactions")
    .select("id, checkout_session_id, merchant_id, amount_cents, currency, status")
    .eq("id", transactionId)
    .eq("type", "authorize")
    .maybeSingle();

  if (!authTx) return json({ error: "authorize_transaction_not_found" }, 404);
  if (authTx.merchant_id !== merchant.id) return json({ error: "forbidden" }, 403);

  // Impossible de void après capture
  const { data: capture } = await admin
    .from("merchant_transactions")
    .select("id")
    .eq("checkout_session_id", authTx.checkout_session_id)
    .eq("type", "capture")
    .maybeSingle();
  if (capture) return json({ error: "already_captured_use_refund" }, 409);

  // Idempotence
  const { data: existing } = await admin
    .from("merchant_transactions")
    .select("id")
    .eq("checkout_session_id", authTx.checkout_session_id)
    .eq("type", "void")
    .maybeSingle();
  if (existing) return json({ transactionId: existing.id, status: "voided", alreadyVoided: true });

  const { data: tx, error: txErr } = await admin
    .from("merchant_transactions")
    .insert({
      checkout_session_id: authTx.checkout_session_id,
      merchant_id: merchant.id,
      type: "void",
      status: "succeeded",
      amount_cents: authTx.amount_cents,
      currency: authTx.currency,
      provider_ref: `void_${authTx.checkout_session_id}`,
    })
    .select("id")
    .single();

  if (txErr || !tx) return json({ error: "void_failed" }, 500);

  // Annuler plan + échéances
  const { data: session } = await admin
    .from("checkout_sessions")
    .select("plan_id")
    .eq("id", authTx.checkout_session_id)
    .single();

  if (session?.plan_id) {
    await admin.from("bnpl_plans").update({ status: "cancelled" }).eq("id", session.plan_id);
    await admin
      .from("installments")
      .update({ status: "waived" })
      .eq("plan_id", session.plan_id)
      .neq("status", "paid");
  }

  await admin
    .from("checkout_sessions")
    .update({ status: "cancelled" })
    .eq("id", authTx.checkout_session_id);

  await admin.from("webhook_events").insert({
    merchant_id: merchant.id,
    event_type: "PAYMENT.VOIDED",
    payload_json: { transactionId: tx.id, authorizeId: transactionId },
  });

  return json({ transactionId: tx.id, status: "voided" });
});
