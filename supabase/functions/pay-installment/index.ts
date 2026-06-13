// Edge Function `pay-installment` (runtime Deno, service_role).
// Paie une échéance BNPL (paiement MOCKÉ en V1) et applique l'impact sur le score CÔTÉ SERVEUR.
// C'est le point d'application unique : l'utilisateur ne peut pas écrire son score (RLS), seul
// ce service le fait, après avoir vérifié qu'il est bien propriétaire de l'échéance.
//
// Sécurité : identifie l'utilisateur via son JWT, vérifie la propriété du plan, idempotence via
// payments.provider_ref. Au déploiement réel, remplacer le bloc "paiement mocké" par le vrai
// prestataire (webhook de confirmation) — le reste ne bouge pas.
//
// Déploiement : node tools/deploy-function.mjs pay-installment

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SCORE_DELTAS: Record<string, number> = {
  on_time_payment: 8,
  late_payment: -25,
  bnpl_completed: 20,
};
const SCORE_MIN = 300;
const SCORE_MAX = 850;
const clamp = (n: number) => Math.max(SCORE_MIN, Math.min(SCORE_MAX, n));
const bandOf = (s: number) =>
  s < 580 ? "poor" : s < 670 ? "fair" : s < 740 ? "good" : s < 800 ? "very_good" : "excellent";

// CORS : l'app web (navigateur) appelle cette fonction → preflight OPTIONS + en-têtes requis.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  // 1) Identifier l'utilisateur à partir de son JWT
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) return json({ error: "unauthorized" }, 401);

  const { installmentId } = await req.json().catch(() => ({}));
  if (!installmentId) return json({ error: "installmentId_required" }, 400);

  const admin = createClient(url, service);

  // 2) Identité applicative
  const { data: appUser } = await admin.from("users").select("id").eq("auth_id", user.id).single();
  if (!appUser) return json({ error: "profile_not_found" }, 404);

  // 3) Charger l'échéance + le plan, vérifier la propriété
  const { data: inst } = await admin
    .from("installments")
    .select("id, plan_id, amount_cents, due_date, status")
    .eq("id", installmentId)
    .single();
  if (!inst) return json({ error: "installment_not_found" }, 404);

  const { data: plan } = await admin
    .from("bnpl_plans")
    .select("id, user_id")
    .eq("id", inst.plan_id)
    .single();
  if (!plan || plan.user_id !== appUser.id) return json({ error: "forbidden" }, 403);

  if (inst.status === "paid") return json({ alreadyPaid: true });

  // 4) Paiement MOCKÉ (idempotent via provider_ref unique)
  const providerRef = `mock_inst_${inst.id}`;
  await admin.from("payments").insert({
    user_id: appUser.id,
    purpose: "installment",
    reference_id: inst.id,
    amount_cents: inst.amount_cents,
    status: "succeeded",
    provider_ref: providerRef,
    settled_at: new Date().toISOString(),
  });
  await admin
    .from("installments")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", inst.id);

  // 5) Événement de score (append-only) + mise à jour du profil
  const today = new Date().toISOString().slice(0, 10);
  const reason = inst.due_date < today ? "late_payment" : "on_time_payment";

  const { data: profile } = await admin
    .from("credit_profiles")
    .select("id, current_score")
    .eq("user_id", appUser.id)
    .single();

  let prev = profile!.current_score as number;
  let newScore = clamp(prev + SCORE_DELTAS[reason]);
  await admin.from("credit_score_events").insert({
    credit_profile_id: profile!.id,
    previous_score: prev,
    new_score: newScore,
    reason_code: reason,
    source: "bnpl",
  });

  // 6) Plan soldé ? bonus bnpl_completed
  const { data: unpaid } = await admin
    .from("installments")
    .select("id")
    .eq("plan_id", plan.id)
    .neq("status", "paid");
  let planCompleted = false;
  if (!unpaid || unpaid.length === 0) {
    planCompleted = true;
    prev = newScore;
    newScore = clamp(prev + SCORE_DELTAS.bnpl_completed);
    await admin.from("credit_score_events").insert({
      credit_profile_id: profile!.id,
      previous_score: prev,
      new_score: newScore,
      reason_code: "bnpl_completed",
      source: "bnpl",
    });
    await admin.from("bnpl_plans").update({ status: "completed" }).eq("id", plan.id);
  }

  await admin
    .from("credit_profiles")
    .update({ current_score: newScore, score_band: bandOf(newScore), score_updated_at: new Date().toISOString() })
    .eq("id", profile!.id);

  return json({ paid: true, reason, newScore, planCompleted });
});
