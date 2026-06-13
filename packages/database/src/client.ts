import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Fabriques de clients Supabase.
 * Règle (docs/CLAUDE.md §3) : les apps ne créent JAMAIS un client elles-mêmes ni
 * n'appellent Supabase en direct — elles passent par @sensei/api-client.
 */

export interface SupabaseEnv {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

/** Client côté navigateur / mobile (clé anon + RLS). */
export function createBrowserClient(env: SupabaseEnv): SupabaseClient {
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

/**
 * Client privilégié (service_role) — SERVEUR / Edge Functions UNIQUEMENT.
 * Ne JAMAIS l'instancier côté client : il contourne la RLS.
 */
export function createServiceClient(env: SupabaseEnv): SupabaseClient {
  if (!env.serviceRoleKey) {
    throw new Error("serviceRoleKey requis pour createServiceClient (usage serveur seulement).");
  }
  return createClient(env.url, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
