// Edge Function `checkout-confirm`
// Étape 2 côté ACHETEUR : appelée depuis la page /checkout avec le JWT de l'utilisateur.
// Évalue l'éligibilité, crée le plan BNPL et marque la session comme autorisée.
// Le marchand peut ensuite appeler merchant-authorize avec le checkout_token.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { adminClient, corsHeaders, json } from "../_shared/merchant.ts";

// ── Logique BNPL répliquée (runtime Deno isolé, pas d'import monorepo) ────
const MAX_PRINCIPAL: Record<string, number> = {
  poor: 0,
  fair: 50_000,
  good: 150_000,
  very_good: 300_000,
  excellent: 500_000,
};

function scoreToBand(s: number): string {
  if (s < 580) return "poor";
  if (s < 670) return "fair";
  if (s < 740) return "good";
  if (s < 800) return "very_good";
  return "excellent";
}

function splitInstallments(total: number, n: number): number[] {
  const base = Math.floor(total / n);
  const rem = total - base * n;
  return Array.from({ length: n }, (_, i) =>
    i === n - 1 ? base + rem : base,
  );
}
// ─────────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // Identifier l'acheteur via son JWT
  const authHeader = req.headers.get("Authorization") ?? "";
  const supaUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const userClient = createClient(supaUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) return json({ error: "unauthorized" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { token, installmentCount = 3 } = body as {
    token?: string;
    installmentCount?: number;
  };

  if (!token) return json({ error: "token_required" }, 400);
  if (![3, 4].includes(installmentCount as number))
    return json({ error: "installment_count_must_be_3_or_4" }, 400);

  const admin = adminClient();

  // Profil applicatif
  const { data: appUser } = await admin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();
  if (!appUser) return json({ error: "profile_not_found" }, 404);

  // Session de checkout
  const { data: session } = await admin
    .from("checkout_sessions")
    .select(
      "id, merchant_id, amount_cents, currency, order_ref, return_url, status, expires_at",
    )
    .eq("token", token)
    .single();

  if (!session) return json({ error: "session_not_found" }, 404);
  if (session.status !== "pending")
    return json({ error: "session_not_pending", currentStatus: session.status }, 409);
  if (new Date(session.expires_at) < new Date()) {
    await admin
      .from("checkout_sessions")
      .update({ status: "expired" })
      .eq("id", session.id);
    return json({ error: "session_expired" }, 410);
  }

  // Score de crédit
  const { data: profile } = await admin
    .from("credit_profiles")
    .select("id, current_score")
    .eq("user_id", appUser.id)
    .single();
  if (!profile) return json({ error: "credit_profile_not_found" }, 404);

  // Consentement + traçabilité : tout accès au score par un tiers (ici le
  // marchand via Sensei Pay) exige un consentement actif et est journalisé
  // (consents + credit_inquiries + audit_logs), peu importe la décision
  // d'éligibilité qui suit (CLAUDE.md §5).
  const { data: existingConsent } = await admin
    .from("consents")
    .select("id")
    .eq("user_id", appUser.id)
    .eq("scope", "credit_score_read")
    .eq("granted_to_type", "merchant")
    .eq("granted_to_id", session.merchant_id)
    .eq("is_active", true)
    .maybeSingle();

  let consentId = existingConsent?.id as string | undefined;
  if (!consentId) {
    const { data: newConsent, error: consentErr } = await admin
      .from("consents")
      .insert({
        user_id: appUser.id,
        scope: "credit_score_read",
        granted_to_type: "merchant",
        granted_to_id: session.merchant_id,
      })
      .select("id")
      .single();
    if (consentErr || !newConsent) return json({ error: "consent_failed" }, 500);
    consentId = newConsent.id as string;
  }

  await admin.from("credit_inquiries").insert({
    credit_profile_id: profile.id,
    requested_by_type: "merchant",
    requested_by_id: session.merchant_id,
    consent_id: consentId,
    inquiry_type: "soft",
  });

  await admin.from("audit_logs").insert({
    actor_type: "merchant",
    actor_id: session.merchant_id,
    action: "credit_score.read",
    target_table: "credit_profiles",
    target_id: profile.id,
    metadata: { checkout_session_id: session.id, order_ref: session.order_ref },
  });

  const score = profile.current_score as number;
  const band = scoreToBand(score);
  const maxCents = MAX_PRINCIPAL[band] ?? 0;

  if (score < 580)
    return json({ approved: false, reasonCode: "score_too_low", band });
  if (session.amount_cents > maxCents)
    return json({ approved: false, reasonCode: "amount_over_limit", band, maxCents });

  // Demande BNPL
  const { data: app, error: appErr } = await admin
    .from("bnpl_applications")
    .insert({
      user_id: appUser.id,
      merchant_id: session.merchant_id,
      order_ref: session.order_ref,
      principal_cents: session.amount_cents,
      status: "approved",
      decision_score: score,
      decision_reason: "approved",
      decided_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (appErr || !app) return json({ error: "application_failed" }, 500);

  // Plan
  const { data: plan, error: planErr } = await admin
    .from("bnpl_plans")
    .insert({
      application_id: app.id,
      user_id: appUser.id,
      principal_cents: session.amount_cents,
      fee_cents: 0,
      total_cents: session.amount_cents,
      installment_count: installmentCount,
      status: "active",
    })
    .select("id")
    .single();
  if (planErr || !plan) return json({ error: "plan_creation_failed" }, 500);

  // Échéances
  const amounts = splitInstallments(session.amount_cents, installmentCount as number);
  const installments = amounts.map((amountCents, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    return {
      plan_id: plan.id,
      sequence: i + 1,
      amount_cents: amountCents,
      due_date: d.toISOString().slice(0, 10),
      status: "scheduled",
    };
  });
  const { error: insErr } = await admin.from("installments").insert(installments);
  if (insErr) return json({ error: "installments_creation_failed" }, 500);

  // Marquer la session comme autorisée
  await admin
    .from("checkout_sessions")
    .update({ status: "authorized", user_id: appUser.id, plan_id: plan.id })
    .eq("id", session.id);

  // Webhook event CHECKOUT.AUTHORIZED
  await admin.from("webhook_events").insert({
    merchant_id: session.merchant_id,
    event_type: "CHECKOUT.AUTHORIZED",
    payload_json: {
      checkoutToken: token,
      sessionId: session.id,
      orderId: session.order_ref,
      amountCents: session.amount_cents,
      currency: session.currency,
      planId: plan.id,
      installmentCount,
    },
  });

  const sep = session.return_url.includes("?") ? "&" : "?";
  return json({
    approved: true,
    checkoutToken: token,
    planId: plan.id,
    installmentCount,
    totalCents: session.amount_cents,
    redirectUrl: `${session.return_url}${sep}checkout_token=${token}`,
  });
});
