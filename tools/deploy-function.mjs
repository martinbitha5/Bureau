// Déploie une Edge Function via l'API de gestion Supabase (sans CLI/Docker).
// Usage : SUPABASE_ACCESS_TOKEN=sbp_... node tools/deploy-function.mjs bnpl-decision
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PAT = process.env.SUPABASE_ACCESS_TOKEN;
const REF = process.env.SUPABASE_PROJECT_REF ?? "phqdzsqoyifxwogrkdqc";
const slug = process.argv[2] ?? "bnpl-decision";
if (!PAT) {
  console.error("❌ SUPABASE_ACCESS_TOKEN requis.");
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(here, "..", "supabase", "functions", slug, "index.ts"), "utf8");
const API = "https://api.supabase.com";
const auth = { Authorization: `Bearer ${PAT}` };

try {
  // Auth check + liste
  const list = await fetch(`${API}/v1/projects/${REF}/functions`, { headers: auth });
  if (!list.ok) throw new Error(`liste functions → ${list.status} ${await list.text()}`);
  console.log(`✅ Accès API OK. Fonctions existantes : ${(await list.json()).map((f) => f.slug).join(", ") || "(aucune)"}`);

  // Déploiement multipart (l'API bundle côté serveur)
  const fd = new FormData();
  fd.append(
    "metadata",
    JSON.stringify({ name: slug, entrypoint_path: "index.ts", verify_jwt: false }),
  );
  fd.append("file", new Blob([code], { type: "application/typescript" }), "index.ts");

  const res = await fetch(`${API}/v1/projects/${REF}/functions/deploy?slug=${slug}`, {
    method: "POST",
    headers: auth,
    body: fd,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`deploy → ${res.status} ${text}`);
  const out = JSON.parse(text);
  console.log(`🎉 Déployée : ${out.slug} · version ${out.version ?? "?"} · statut ${out.status ?? "?"}`);
  console.log(`   URL : ${process.env.SUPABASE_URL ?? `https://${REF}.supabase.co`}/functions/v1/${slug}`);
} catch (err) {
  console.error(`\n❌ Échec : ${err.message}`);
  process.exitCode = 1;
}
