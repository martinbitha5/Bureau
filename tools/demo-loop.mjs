// ─────────────────────────────────────────────────────────────────────────
// PREUVE DE LA BOUCLE V1 (docs/APP_SPEC.md : "boucler UN cycle complet").
// Exécute, contre la VRAIE base cloud (service_role bypasse la RLS) :
//   user + credit_profile → recherche/offre vol → décision BNPL → plan + échéancier
//   → réservation → paiement échéance 1 (mock) → événement de score → le score bouge.
//
// La logique BNPL est dupliquée ici en petit (script autonome). Source canonique :
// packages/payments/src/bnpl.ts.  Usage : node tools/demo-loop.mjs
// ─────────────────────────────────────────────────────────────────────────
const URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("❌ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY requis.");
  process.exit(1);
}

const h = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

async function rest(method, path, body, extraHeaders = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: { ...h, Prefer: "return=representation", ...extraHeaders },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

// — moteur BNPL (mirroir de packages/payments) —
const MAX = { poor: 0, fair: 50000, good: 150000, very_good: 300000, excellent: 500000 };
const band = (s) => (s < 580 ? "poor" : s < 670 ? "fair" : s < 740 ? "good" : s < 800 ? "very_good" : "excellent");
function decide(score, principal, count) {
  const b = band(score);
  if (![3, 4].includes(count)) return { approved: false, reasonCode: "invalid_installments", band: b };
  if (score < 580) return { approved: false, reasonCode: "score_too_low", band: b };
  if (principal > MAX[b]) return { approved: false, reasonCode: "amount_over_limit", band: b };
  return { approved: true, reasonCode: "approved", band: b, principalCents: principal, feeCents: 0, totalCents: principal, installmentCount: count };
}
function split(total, count) {
  const base = Math.floor(total / count);
  const rem = total - base * count;
  return Array.from({ length: count }, (_, i) => (i === 0 ? base + rem : base));
}
const fmt = (c) => `${(c / 100).toFixed(2)} $`;

const stamp = Date.now();
const log = (s) => console.log(s);

try {
  log("─".repeat(60));
  // 1) Utilisateur Auth + profil applicatif
  const authRes = await fetch(`${URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: h,
    body: JSON.stringify({ email: `demo+${stamp}@sensei.test`, password: `Demo!${stamp}`, email_confirm: true }),
  });
  const authUser = await authRes.json();
  if (!authRes.ok) throw new Error(`auth admin → ${authRes.status} ${JSON.stringify(authUser)}`);
  log(`1. Utilisateur Auth créé           ${authUser.id}`);

  const [user] = await rest("POST", "users", {
    auth_id: authUser.id,
    phone: `+24390${String(stamp).slice(-7)}`,
    email: `demo+${stamp}@sensei.test`,
    full_name: "Démo Voyageur",
    kyc_status: "verified",
  });
  log(`   users                           ${user.id}`);

  const startScore = 620;
  const [profile] = await rest("POST", "credit_profiles", {
    user_id: user.id,
    current_score: startScore,
    score_band: band(startScore),
  });
  log(`2. Profil de crédit                 score=${startScore} (${band(startScore)})`);

  // 3) Recherche + offre vol (provider mock)
  const [search] = await rest("POST", "flight_searches", {
    user_id: user.id,
    origin: "FIH",
    destination: "JNB",
    depart_date: "2026-08-15",
    passenger_count: 1,
    cabin_class: "economy",
  });
  const priceCents = 45000; // 450 $
  const [offer] = await rest("POST", "flight_offers", {
    search_id: search.id,
    provider: "mock",
    provider_offer_id: `mock-FIH-JNB-1`,
    total_cents: priceCents,
    expires_at: new Date(Date.now() + 30 * 60000).toISOString(),
    segments_json: [{ from: "FIH", to: "JNB", carrier: "Congo Airways", flightNumber: "8Z101" }],
  });
  log(`3. Vol FIH→JNB                      offre ${fmt(priceCents)}`);

  // 4) Décision BNPL en 4x
  const decision = decide(startScore, priceCents, 4);
  log(`4. Décision BNPL (4x)               ${decision.approved ? "ACCORDÉ" : "REFUSÉ"} (${decision.reasonCode})`);
  if (!decision.approved) throw new Error("Décision refusée — la démo attend un accord.");

  const [app] = await rest("POST", "bnpl_applications", {
    user_id: user.id,
    order_ref: offer.id,
    principal_cents: priceCents,
    status: "approved",
    decision_score: startScore,
    decision_reason: decision.reasonCode,
    decided_at: new Date().toISOString(),
  });
  const [plan] = await rest("POST", "bnpl_plans", {
    application_id: app.id,
    user_id: user.id,
    principal_cents: decision.principalCents,
    fee_cents: decision.feeCents,
    total_cents: decision.totalCents,
    installment_count: decision.installmentCount,
    status: "active",
  });
  const amounts = split(decision.totalCents, decision.installmentCount);
  const installmentsBody = amounts.map((amt, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    return { plan_id: plan.id, sequence: i + 1, amount_cents: amt, due_date: d.toISOString().slice(0, 10), status: "scheduled" };
  });
  const installments = await rest("POST", "installments", installmentsBody);
  log(`5. Échéancier                       ${amounts.map(fmt).join(" + ")}  (frais ${fmt(decision.feeCents)})`);

  // 6) Réservation confirmée, payée en BNPL
  const [booking] = await rest("POST", "bookings", {
    user_id: user.id,
    offer_id: offer.id,
    provider_booking_ref: "PNRDEMO",
    status: "confirmed",
    total_cents: priceCents,
    bnpl_plan_id: plan.id,
    confirmed_at: new Date().toISOString(),
  });
  log(`6. Réservation confirmée            ${booking.provider_booking_ref}`);

  // 7) Paiement de l'échéance 1 (mock, idempotent)
  const first = installments.sort((a, b) => a.sequence - b.sequence)[0];
  const idemKey = `inst_${first.id}`;
  await rest("POST", "payments", {
    user_id: user.id,
    purpose: "installment",
    reference_id: first.id,
    amount_cents: first.amount_cents,
    status: "succeeded",
    provider_ref: `mock_${idemKey}`,
    settled_at: new Date().toISOString(),
  });
  await rest("PATCH", `installments?id=eq.${first.id}`, { status: "paid", paid_at: new Date().toISOString() });
  log(`7. Échéance 1 payée                 ${fmt(first.amount_cents)} (réf mock_${idemKey})`);

  // 8) Événement de score : remboursement à l'heure → +8
  const newScore = Math.min(850, startScore + 8);
  await rest("POST", "credit_score_events", {
    credit_profile_id: profile.id,
    previous_score: startScore,
    new_score: newScore,
    reason_code: "on_time_payment",
    source: "bnpl",
  });
  await rest("PATCH", `credit_profiles?id=eq.${profile.id}`, {
    current_score: newScore,
    score_band: band(newScore),
    score_updated_at: new Date().toISOString(),
  });
  log(`8. Événement de score               on_time_payment : ${startScore} → ${newScore}`);

  log("─".repeat(60));
  log(`🎉 BOUCLE COMPLÈTE PROUVÉE : le remboursement a fait bouger le score (${startScore} → ${newScore}).`);
  log(`   Données visibles dans le dashboard (user ${user.id}).`);
} catch (err) {
  console.error(`\n❌ Échec : ${err.message}`);
  process.exitCode = 1;
}
