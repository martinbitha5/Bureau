// Exécute un fichier SQL sur la base via l'API de gestion Supabase (HTTP).
// Usage : SUPABASE_PAT=... SUPABASE_REF=... node tools/mgmt-apply.mjs <fichier.sql>
import { readFileSync } from "node:fs";

const PAT = process.env.SUPABASE_PAT;
const REF = process.env.SUPABASE_REF;
const file = process.argv[2];
if (!PAT || !REF || !file) {
  console.error("❌ SUPABASE_PAT, SUPABASE_REF et un fichier SQL requis.");
  process.exit(1);
}

const query = readFileSync(file, "utf8");
const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});
const text = await res.text();
if (!res.ok) {
  console.error(`❌ ${res.status} : ${text}`);
  process.exit(1);
}
console.log(`✅ ${file} exécuté. Réponse : ${text || "(vide)"}`);
