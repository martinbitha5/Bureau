// Edge Function `merchant-checkout`
// Étape 1 du flux intégrateur : le marchand crée une session de checkout.
// Appelée avec la clé publique (navigateur ou serveur).
// Retourne {checkoutToken, checkoutUrl} → le marchand redirige l'acheteur.

import { adminClient, corsHeaders, findMerchantByPublicKey, json } from "../_shared/merchant.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const {
    publicKey,
    amount,
    currency = "USD",
    orderId,
    items = [],
    returnUrl,
    cancelUrl,
  } = body as {
    publicKey?: string;
    amount?: number;
    currency?: string;
    orderId?: string;
    items?: unknown[];
    returnUrl?: string;
    cancelUrl?: string;
  };

  if (!publicKey) return json({ error: "public_key_required" }, 400);
  if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0)
    return json({ error: "amount_must_be_positive_integer_cents" }, 400);
  if (!orderId) return json({ error: "order_id_required" }, 400);
  if (!returnUrl || !cancelUrl)
    return json({ error: "return_url_and_cancel_url_required" }, 400);

  const admin = adminClient();
  const merchant = await findMerchantByPublicKey(admin, publicKey);
  if (!merchant) return json({ error: "invalid_public_key" }, 401);

  const { data: session, error } = await admin
    .from("checkout_sessions")
    .insert({
      merchant_id: merchant.id,
      amount_cents: amount,
      currency,
      order_ref: orderId,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      metadata_json: { items, merchantName: merchant.name },
    })
    .select("id, token")
    .single();

  if (error || !session) {
    console.error("checkout_sessions insert error:", error);
    return json({ error: "session_creation_failed" }, 500);
  }

  const baseUrl =
    Deno.env.get("BNPL_WEB_URL") ?? "https://pay.sensei.cd";

  return json({
    checkoutToken: session.token,
    checkoutUrl: `${baseUrl}/checkout?token=${session.token}`,
    sessionId: session.id,
    expiresIn: 86400, // secondes
  });
});
