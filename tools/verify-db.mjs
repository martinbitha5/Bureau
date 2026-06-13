// Vérifie l'état de la base cloud via PostgREST (service_role = bypass RLS).
// Usage : node tools/verify-db.mjs
const URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.SUPABASE_ANON_KEY;

const TABLES = [
  "users", "identities", "consents", "lenders", "merchants",
  "credit_profiles", "credit_score_events", "credit_report_lines",
  "credit_inquiries", "disputes", "bnpl_applications", "bnpl_plans",
  "installments", "payment_methods", "payments", "flight_searches",
  "flight_offers", "bookings", "passengers", "audit_logs",
];

async function head(table, key) {
  const res = await fetch(`${URL}/rest/v1/${table}?select=*&limit=0`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return res.status;
}

let ok = 0, missing = 0;
console.log("=== Existence des tables (service_role) ===");
for (const t of TABLES) {
  const status = await head(t, SERVICE);
  const exists = status === 200;
  if (exists) ok++; else missing++;
  console.log(`${exists ? "✅" : "❌"} ${t.padEnd(22)} HTTP ${status}`);
}
console.log(`\n${ok}/${TABLES.length} tables présentes` + (missing ? ` — ${missing} MANQUANTE(S)` : ""));

console.log("\n=== Contrôle RLS (clé anon, non authentifiée) ===");
// Sans utilisateur connecté, les policies exigent app_user_id() => doit renvoyer [].
for (const t of ["users", "lenders", "audit_logs"]) {
  const res = await fetch(`${URL}/rest/v1/${t}?select=*&limit=5`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  });
  const body = await res.text();
  const blocked = body.trim() === "[]" || res.status === 401 || res.status === 403;
  console.log(`${blocked ? "✅" : "⚠️ "} ${t.padEnd(12)} anon → HTTP ${res.status} ${body.slice(0, 60)}`);
}
