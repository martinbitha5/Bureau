import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Logique d'auth Sensei (docs/FEATURE_BACKLOG.md V1 : téléphone + OTP).
 * Compte unique pour tout l'écosystème (credit / bnpl / flights).
 */

/** Démarre la connexion par téléphone : envoie un OTP SMS via Supabase Auth. */
export async function startPhoneLogin(client: SupabaseClient, phone: string) {
  return client.auth.signInWithOtp({ phone });
}

/** Vérifie le code OTP reçu par SMS. */
export async function verifyPhoneOtp(client: SupabaseClient, phone: string, token: string) {
  return client.auth.verifyOtp({ phone, token, type: "sms" });
}

export async function signOut(client: SupabaseClient) {
  return client.auth.signOut();
}

export async function getCurrentUser(client: SupabaseClient) {
  const { data } = await client.auth.getUser();
  return data.user;
}
