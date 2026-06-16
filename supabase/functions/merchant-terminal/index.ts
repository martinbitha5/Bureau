// Edge Function `merchant-terminal`
// Terminal virtuel : permet à un marchand connecté (JWT, tableau de bord) de créer
// une session de checkout pour une vente par téléphone/en agence, puis de la
// finaliser (authorize+capture+versement) une fois l'acheteur passé par /checkout.
// Authentification par JWT (comme `merchant-setup`) — jamais par clé secrète, le
// tableau de bord n'a pas accès à la clé secrète brute après sa création.
//
// Actions :
//   create  → crée une checkout_sessions, retourne le lien à partager
//   capture → authorize+capture+versement sur une session déjà autorisée par l'acheteur

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  adminClient,
  computeCommission,
  corsHeaders,
  json,
} from "../_shared/merchant.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // Identifier le marchand via JWT
  const authHeader = req.headers.get("Authorization") ?? "";
  const supaUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const userClient = createClient(supaUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) return json({ error: "unauthorized" }, 401);

  const admin = adminClient();

  const { data: appUser } = await admin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();
  if (!appUser) return json({ error: "profile_not_found" }, 404);

  const { data: merchant } = await admin
    .from("merchants")
    .select("id, name, is_active, commission_bps, settlement_account")
    .eq("user_id", appUser.id)
    .maybeSingle();
  if (!merchant || !merchant.is_active) return json({ error: "merchant_not_found" }, 404);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* pas de body */ }

  const action = (body["action"] as string) ?? "create";

  // ── CREATE ───────────────────────────────────────────────────────────────

  if (action === "create") {
    const { amountCents, orderRef, customerNote } = body as {
      amountCents?: number;
      orderRef?: string;
      customerNote?: string;
    };

    if (typeof amountCents !== "number" || !Number.isInteger(amountCents) || amountCents <= 0)
      return json({ error: "amount_must_be_positive_integer_cents" }, 400);

    const baseUrl = Deno.env.get("BNPL_WEB_URL") ?? "https://pay.sensei.cd";
    const ref = orderRef?.trim() || `VT-${Date.now()}`;

    const { data: session, error } = await admin
      .from("checkout_sessions")
      .insert({
        merchant_id: merchant.id,
        amount_cents: amountCents,
        currency: "USD",
        order_ref: ref,
        return_url: `${baseUrl}/checkout/merci`,
        cancel_url: `${baseUrl}/`,
        metadata_json: {
          merchantName: merchant.name,
          source: "virtual_terminal",
          customerNote: customerNote?.trim() || null,
        },
      })
      .select("id, token")
      .single();

    if (error || !session) {
      console.error("checkout_sessions insert error:", error);
      return json({ error: "session_creation_failed" }, 500);
    }

    return json({
      sessionId: session.id,
      checkoutToken: session.token,
      checkoutUrl: `${baseUrl}/checkout?token=${session.token}`,
      expiresIn: 86400,
    });
  }

  // ── CAPTURE ──────────────────────────────────────────────────────────────

  if (action === "capture") {
    const { sessionId } = body as { sessionId?: string };
    if (!sessionId) return json({ error: "session_id_required" }, 400);

    const { data: session } = await admin
      .from("checkout_sessions")
      .select("id, merchant_id, amount_cents, currency, status")
      .eq("id", sessionId)
      .maybeSingle();

    if (!session) return json({ error: "session_not_found" }, 404);
    if (session.merchant_id !== merchant.id) return json({ error: "forbidden" }, 403);
    if (session.status !== "authorized")
      return json({ error: "session_not_authorized", currentStatus: session.status }, 409);

    // Idempotence : authorize déjà créé pour cette session ?
    const { data: existingAuth } = await admin
      .from("merchant_transactions")
      .select("id")
      .eq("checkout_session_id", session.id)
      .eq("type", "authorize")
      .maybeSingle();

    let authTxId: string;
    if (existingAuth) {
      authTxId = existingAuth.id;
    } else {
      const { data: authTx, error: authErr } = await admin
        .from("merchant_transactions")
        .insert({
          checkout_session_id: session.id,
          merchant_id: merchant.id,
          type: "authorize",
          status: "succeeded",
          amount_cents: session.amount_cents,
          currency: session.currency,
          provider_ref: `authorize_${session.id}`,
          metadata_json: { source: "virtual_terminal" },
        })
        .select("id")
        .single();
      if (authErr || !authTx) return json({ error: "authorize_failed" }, 500);
      authTxId = authTx.id;
    }

    // Idempotence : capture déjà créée ?
    const { data: existingCapture } = await admin
      .from("merchant_transactions")
      .select("id")
      .eq("checkout_session_id", session.id)
      .eq("type", "capture")
      .maybeSingle();

    let captureId: string;
    const alreadyCaptured = !!existingCapture;

    if (existingCapture) {
      captureId = existingCapture.id;
    } else {
      const { data: captureTx, error: captureErr } = await admin
        .from("merchant_transactions")
        .insert({
          checkout_session_id: session.id,
          merchant_id: merchant.id,
          type: "capture",
          status: "succeeded",
          amount_cents: session.amount_cents,
          currency: session.currency,
          provider_ref: `capture_${session.id}`,
        })
        .select("id")
        .single();
      if (captureErr || !captureTx) return json({ error: "capture_failed" }, 500);
      captureId = captureTx.id;

      await admin.from("webhook_events").insert({
        merchant_id: merchant.id,
        event_type: "PAYMENT.CAPTURED",
        payload_json: {
          transactionId: captureTx.id,
          authorizeId: authTxId,
          amountCents: session.amount_cents,
          currency: session.currency,
        },
      });
    }

    // Versement (même logique que merchant-capture)
    const { data: existingPayout } = await admin
      .from("merchant_payouts")
      .select("id, status, net_amount_cents, commission_cents")
      .eq("capture_transaction_id", captureId)
      .eq("type", "payout")
      .maybeSingle();

    let payout = existingPayout;

    if (!payout) {
      const { commissionCents, netCents } = computeCommission(
        session.amount_cents,
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
          gross_amount_cents: session.amount_cents,
          commission_cents: commissionCents,
          net_amount_cents: netCents,
          currency: session.currency,
          settlement_account: merchant.settlement_account,
          provider_ref: `payout_capture_${captureId}`,
          settled_at: hasSettlementAccount ? new Date().toISOString() : null,
        })
        .select("id, status, net_amount_cents, commission_cents")
        .single();

      if (payoutErr || !newPayout) {
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
              grossAmountCents: session.amount_cents,
              commissionCents: payout.commission_cents,
              netAmountCents: payout.net_amount_cents,
              currency: session.currency,
            },
          });
        }
      }
    }

    return json({
      transactionId: captureId,
      status: "captured",
      alreadyCaptured,
      payout: payout
        ? {
            id: payout.id,
            status: payout.status,
            netAmountCents: payout.net_amount_cents,
            commissionCents: payout.commission_cents,
          }
        : null,
    });
  }

  return json({ error: "unknown_action" }, 400);
});
