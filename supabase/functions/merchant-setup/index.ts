// Edge Function `merchant-setup`
// Gère le cycle de vie du compte marchand : création, génération de clés API,
// mise à jour du webhook. Appelée avec le JWT du marchand (authentifié).
//
// Actions :
//   get              → profil courant (sans secret)
//   setup            → crée la ligne merchants + génère toutes les clés (UNE FOIS)
//   regenerate_secret → génère une nouvelle clé secrète (UNE FOIS)
//   update_webhook   → met à jour webhook_url + génère un nouveau signing secret

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { adminClient, corsHeaders, json, sha256Hex } from "../_shared/merchant.ts";

function randomHex(bytes: number): string {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generatePublicKey(): string {
  return `pk_live_${randomHex(24)}`;
}
function generateSecretKey(): string {
  return `sk_live_${randomHex(24)}`;
}
function generateWebhookSecret(): string {
  return `whsec_${randomHex(32)}`;
}

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

  // Profil applicatif
  const { data: appUser } = await admin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();
  if (!appUser) return json({ error: "profile_not_found" }, 404);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* pas de body */ }

  const action = (body["action"] as string) ?? "get";

  // ── GET ──────────────────────────────────────────────────────────────────

  if (action === "get") {
    const { data: merchant } = await admin
      .from("merchants")
      .select(
        "id, name, api_key_public, website_url, webhook_url, is_active, created_at, updated_at, commission_bps, settlement_account",
      )
      .eq("user_id", appUser.id)
      .maybeSingle();
    return json({ merchant: merchant ?? null });
  }

  // ── SETUP (création initiale) ─────────────────────────────────────────────

  if (action === "setup") {
    // Vérifier qu'il n'existe pas déjà une ligne
    const { data: existing } = await admin
      .from("merchants")
      .select("id, name, api_key_public, is_active")
      .eq("user_id", appUser.id)
      .maybeSingle();

    if (existing) {
      return json({ error: "merchant_already_setup", merchant: existing }, 409);
    }

    const name = (body["name"] as string)?.trim();
    if (!name) return json({ error: "name_required" }, 400);
    const websiteUrl = (body["websiteUrl"] as string) ?? null;
    const settlementAccount = (body["settlementAccount"] as string)?.trim();
    if (!settlementAccount) return json({ error: "settlement_account_required" }, 400);

    const publicKey = generatePublicKey();
    const secretKey = generateSecretKey();
    const webhookSecret = generateWebhookSecret();

    const secretHash = await sha256Hex(secretKey);

    const { data: merchant, error: createErr } = await admin
      .from("merchants")
      .insert({
        user_id: appUser.id,
        name,
        website_url: websiteUrl,
        settlement_account: settlementAccount,
        api_key_public: publicKey,
        api_key_secret_hash: secretHash,
        webhook_secret_hash: webhookSecret, // stocké en clair — sert de clé HMAC pour signer
        is_active: true,
      })
      .select("id, name, api_key_public, website_url, settlement_account, commission_bps, is_active, created_at")
      .single();

    if (createErr || !merchant) {
      console.error("merchant insert error:", createErr);
      return json({ error: "setup_failed" }, 500);
    }

    // Retourner les clés UNE SEULE FOIS — elles ne seront plus jamais renvoyées en clair
    return json({
      merchant,
      keys: {
        publicKey,
        secretKey,         // à stocker côté marchand — AFFICHÉ UNE FOIS
        webhookSecret,     // pour vérifier nos signatures — AFFICHÉ UNE FOIS
      },
    }, 201);
  }

  // ── REGENERATE_SECRET ────────────────────────────────────────────────────

  if (action === "regenerate_secret") {
    const { data: merchant } = await admin
      .from("merchants")
      .select("id")
      .eq("user_id", appUser.id)
      .single();
    if (!merchant) return json({ error: "merchant_not_found" }, 404);

    const secretKey = generateSecretKey();
    const secretHash = await sha256Hex(secretKey);

    await admin
      .from("merchants")
      .update({ api_key_secret_hash: secretHash })
      .eq("id", merchant.id);

    return json({ secretKey }); // UNE SEULE FOIS
  }

  // ── UPDATE_WEBHOOK ────────────────────────────────────────────────────────

  if (action === "update_webhook") {
    const webhookUrl = (body["webhookUrl"] as string)?.trim() ?? null;

    const { data: merchant } = await admin
      .from("merchants")
      .select("id")
      .eq("user_id", appUser.id)
      .single();
    if (!merchant) return json({ error: "merchant_not_found" }, 404);

    const newWebhookSecret = generateWebhookSecret();
    await admin
      .from("merchants")
      .update({ webhook_url: webhookUrl, webhook_secret_hash: newWebhookSecret })
      .eq("id", merchant.id);

    return json({ webhookSecret: newWebhookSecret }); // retourné UNE FOIS pour configuration
  }

  return json({ error: "unknown_action" }, 400);
});
