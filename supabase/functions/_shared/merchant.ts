// Module partagé par toutes les Edge Functions de l'intégrateur marchand.
// Contient : CORS, helpers JSON, client admin, vérification des clés API.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-sensei-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type MerchantRow = {
  id: string;
  name: string;
  is_active: boolean;
  webhook_url: string | null;
  webhook_secret_hash: string | null;
  commission_bps: number;
  settlement_account: string | null;
};

const MERCHANT_SELECT =
  "id, name, is_active, webhook_url, webhook_secret_hash, commission_bps, settlement_account";

export async function findMerchantByPublicKey(
  admin: ReturnType<typeof adminClient>,
  key: string,
): Promise<MerchantRow | null> {
  const { data } = await admin
    .from("merchants")
    .select(MERCHANT_SELECT)
    .eq("api_key_public", key)
    .single();
  if (!data || !data.is_active) return null;
  return data as MerchantRow;
}

export async function findMerchantBySecretKey(
  admin: ReturnType<typeof adminClient>,
  key: string,
): Promise<MerchantRow | null> {
  const hash = await sha256Hex(key);
  const { data } = await admin
    .from("merchants")
    .select(MERCHANT_SELECT)
    .eq("api_key_secret_hash", hash)
    .single();
  if (!data || !data.is_active) return null;
  return data as MerchantRow;
}

/** Commission (entier, arrondi au plus proche) et net à partir d'un brut et d'un taux en bps. */
export function computeCommission(
  grossCents: number,
  bps: number,
): { commissionCents: number; netCents: number } {
  const commissionCents = Math.round((grossCents * bps) / 10000);
  return { commissionCents, netCents: grossCents - commissionCents };
}
