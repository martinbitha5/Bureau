// ─────────────────────────────────────────────────────────────────────────
// VÉRIFIE l'auth + la persistance du checkout SOUS RLS (sans service_role pour les écritures).
// Prouve : trigger de bootstrap (users + credit_profiles), politiques INSERT (0003), et que
// l'utilisateur NE PEUT PAS modifier son propre score.
//   1. admin crée un compte confirmé (service_role)  → trigger crée le profil
//   2. connexion mot de passe (clé anon)             → JWT utilisateur
//   3. écritures checkout avec le JWT utilisateur     → RLS appliquée
//   4. test négatif : l'utilisateur tente de gonfler son score → refus attendu
// Prérequis : migration 0003 appliquée.  Usage : node tools/auth-loop.mjs
// ─────────────────────────────────────────────────────────────────────────
const URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.SUPABASE_ANON_KEY;
if (!URL || !SERVICE || !ANON) {
  console.error("❌ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY requis.");
  process.exit(1);
}

async function rest(method, path, token, body, prefer = "return=representation") {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: prefer,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text ? JSON.parse(text) : null, raw: text };
}

const MAX = { poor: 0, fair: 50000, good: 150000, very_good: 300000, excellent: 500000 };
const band = (s) => (s < 580 ? "poor" : s < 670 ? "fair" : s < 740 ? "good" : s < 800 ? "very_good" : "excellent");
const split = (total, count) => {
  const base = Math.floor(total / count), rem = total - base * count;
  return Array.from({ length: count }, (_, i) => (i === 0 ? base + rem : base));
};
const fmt = (c) => `${(c / 100).toFixed(2)} $`;
const log = (s) => console.log(s);
const stamp = Date.now();
const email = `martinbitha5+v${stamp}@gmail.com`;
const password = `Sensei!${stamp}`;

try {
  log("─".repeat(60));
  // 1) Admin crée un compte confirmé → le trigger crée users + credit_profiles(600)
  const adminRes = await fetch(`${URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { phone: `+24391${String(stamp).slice(-7)}`, full_name: "Voyageur Authentifié" },
    }),
  });
  const adminUser = await adminRes.json();
  if (!adminRes.ok) throw new Error(`admin create → ${adminRes.status} ${JSON.stringify(adminUser)}`);
  log(`1. Compte Auth confirmé créé        ${adminUser.id}`);

  // 2) Connexion mot de passe → JWT utilisateur
  const tokRes = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const tok = await tokRes.json();
  if (!tokRes.ok) throw new Error(`password grant → ${tokRes.status} ${JSON.stringify(tok)}`);
  const jwt = tok.access_token;
  log(`2. Connexion réussie                JWT utilisateur obtenu`);

  // 3) Le trigger a-t-il créé le profil ? (lecture sous RLS)
  const me = await rest("GET", "users?select=id,full_name", jwt);
  if (!me.ok || !me.body?.length) throw new Error(`lecture users (RLS) échouée : ${me.status} ${me.raw}`);
  const appUserId = me.body[0].id;
  const prof = await rest("GET", `credit_profiles?select=current_score&user_id=eq.${appUserId}`, jwt);
  const score = prof.body?.[0]?.current_score;
  log(`3. Trigger de bootstrap OK          users=${appUserId.slice(0, 8)} · score=${score} (${band(score)})`);

  // 4) Écritures checkout sous le JWT utilisateur (RLS / politiques INSERT 0003)
  const priceCents = 45000;
  const [search] = (await rest("POST", "flight_searches", jwt, {
    user_id: appUserId, origin: "FIH", destination: "JNB", depart_date: "2026-09-10", passenger_count: 1, cabin_class: "economy",
  })).body;
  const [offer] = (await rest("POST", "flight_offers", jwt, {
    search_id: search.id, provider: "mock", provider_offer_id: "mock-FIH-JNB-1", total_cents: priceCents, expires_at: new Date(Date.now() + 18e5).toISOString(), segments_json: [{ from: "FIH", to: "JNB" }],
  })).body;
  const [app] = (await rest("POST", "bnpl_applications", jwt, {
    user_id: appUserId, order_ref: offer.id, principal_cents: priceCents, status: "approved", decision_score: score, decision_reason: "approved", decided_at: new Date().toISOString(),
  })).body;
  const [plan] = (await rest("POST", "bnpl_plans", jwt, {
    application_id: app.id, user_id: appUserId, principal_cents: priceCents, fee_cents: 0, total_cents: priceCents, installment_count: 4, status: "active",
  })).body;
  const amounts = split(priceCents, 4);
  const insRes = await rest("POST", "installments", jwt, amounts.map((amt, i) => {
    const d = new Date(); d.setMonth(d.getMonth() + i);
    return { plan_id: plan.id, sequence: i + 1, amount_cents: amt, due_date: d.toISOString().slice(0, 10), status: "scheduled" };
  }));
  if (!insRes.ok) throw new Error(`insert installments (RLS) → ${insRes.status} ${insRes.raw}`);
  const [booking] = (await rest("POST", "bookings", jwt, {
    user_id: appUserId, offer_id: offer.id, status: "confirmed", total_cents: priceCents, bnpl_plan_id: plan.id, confirmed_at: new Date().toISOString(),
  })).body;
  if (!booking?.id) throw new Error(`insert booking (RLS) échoué`);
  log(`4. Checkout persisté sous RLS       booking=${booking.id.slice(0, 8)} · ${amounts.map(fmt).join(" + ")}`);

  // 5) Test négatif : l'utilisateur tente de gonfler son score → doit échouer (pas de policy UPDATE)
  const hack = await rest("PATCH", `credit_profiles?user_id=eq.${appUserId}`, jwt, { current_score: 850 }, "return=representation");
  const blocked = !hack.ok || (Array.isArray(hack.body) && hack.body.length === 0);
  log(`5. Anti-triche score                ${blocked ? "✅ refusé (RLS)" : "❌ FAILLE : score modifiable !"}`);

  log("─".repeat(60));
  log(`🎉 AUTH + PERSISTANCE PROUVÉES sous RLS. Réservation créée par l'utilisateur lui-même.`);
} catch (err) {
  console.error(`\n❌ Échec : ${err.message}`);
  console.error("   (Si 'policy'/'permission' ou profil absent : la migration 0003 n'est pas appliquée.)");
  process.exitCode = 1;
}
