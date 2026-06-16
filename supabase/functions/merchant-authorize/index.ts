// Edge Function `merchant-authorize`
// Étape 3 côté MARCHAND : échange le checkout_token contre un transactionId.
// Appelée côté serveur avec la clé secrète, après redirection de l'acheteur.
// Idempotente : un deuxième appel avec le même token retourne la même transaction.

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

  const { secretKey, checkoutToken, orderId } = body as {
    secretKey?: string;
    checkoutToken?: string;
    orderId?: string;
  };

  if (!secretKey) return json({ error: "secret_key_required" }, 400);
  if (!checkoutToken) return json({ error: "checkout_token_required" }, 400);

  const admin = adminClient();
  const merchant = await findMerchantBySecretKey(admin, secretKey);
  if (!merchant) return json({ error: "invalid_secret_key" }, 401);

  const { data: session } = await admin
    .from("checkout_sessions")
    .select("id, merchant_id, amount_cents, currency, plan_id, status")
    .eq("token", checkoutToken)
    .single();

  if (!session) return json({ error: "session_not_found" }, 404);
  if (session.merchant_id !== merchant.id) return json({ error: "forbidden" }, 403);
  if (session.status !== "authorized")
    return json({ error: "session_not_authorized", currentStatus: session.status }, 409);

  // Idempotence : un authorize déjà créé pour cette session
  const { data: existing } = await admin
    .from("merchant_transactions")
    .select("id, status")
    .eq("checkout_session_id", session.id)
    .eq("type", "authorize")
    .maybeSingle();

  if (existing) {
    return json({
      transactionId: existing.id,
      status: "authorized",
      amountCents: session.amount_cents,
      currency: session.currency,
      planId: session.plan_id,
      alreadyAuthorized: true,
    });
  }

  const { data: tx, error: txErr } = await admin
    .from("merchant_transactions")
    .insert({
      checkout_session_id: session.id,
      merchant_id: merchant.id,
      type: "authorize",
      status: "succeeded",
      amount_cents: session.amount_cents,
      currency: session.currency,
      provider_ref: `authorize_${session.id}`,
      metadata_json: { orderId: orderId ?? null },
    })
    .select("id")
    .single();

  if (txErr || !tx) return json({ error: "authorize_failed" }, 500);

  return json({
    transactionId: tx.id,
    status: "authorized",
    amountCents: session.amount_cents,
    currency: session.currency,
    planId: session.plan_id,
  });
});
