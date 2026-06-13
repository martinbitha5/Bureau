// Applique toutes les migrations supabase/migrations/*.sql à la base cible, dans l'ordre.
// Connexion via variables explicites (évite les soucis d'encodage de mot de passe dans une URI) :
//   PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
// Usage : node tools/apply-migrations.mjs
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, "..", "supabase", "migrations");

if (!process.env.PGPASSWORD) {
  console.error("❌ PGPASSWORD manquant.");
  process.exit(1);
}

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new pg.Client({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE ?? "postgres",
  ssl: { rejectUnauthorized: false }, // Supabase exige TLS
});

try {
  await client.connect();
  console.log(`✅ Connecté à ${process.env.PGHOST}. ${files.length} migration(s).\n`);
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    process.stdout.write(`→ ${file} ... `);
    await client.query(sql);
    console.log("OK");
  }
  console.log("\n🎉 Migrations appliquées.");
} catch (err) {
  console.error(`\n❌ Échec : ${err.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
