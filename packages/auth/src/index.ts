import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Logique d'auth Sensei. Compte unique pour tout l'écosystème (credit / bnpl / flights).
 * - V1 active : e-mail + mot de passe (fonctionne sans fournisseur externe).
 * - Prêt : OTP téléphone (à activer dès qu'un fournisseur SMS est branché dans Supabase).
 * Le profil applicatif (`users` + `credit_profiles`) est créé automatiquement par le trigger
 * `handle_new_user` (migration 0003).
 */

// ── E-mail + mot de passe (V1) ───────────────────────────────────────────

/** Rôle porté dans la metadata du compte. `consumer` = acheteur ; `merchant` = marchand. */
export type AccountRole = "consumer" | "merchant";

export interface EmailSignUpInput {
  email: string;
  password: string;
  phone: string; // mobile-first : collecté dès l'inscription
  fullName: string;
  /** Rôle du compte. Défaut `consumer` (acheteur). */
  role?: AccountRole;
  /** Code pays ISO-3166 alpha-2. RDC = `CD` (seul pays V1). */
  country?: string;
  /** Profil marchand — uniquement si `role === "merchant"`. */
  businessName?: string;
  businessSector?: string;
}

/** Inscription. Le phone et le nom sont passés en metadata → lus par le trigger de bootstrap. */
export async function signUpWithEmail(client: SupabaseClient, input: EmailSignUpInput) {
  const data: Record<string, unknown> = {
    phone: input.phone,
    full_name: input.fullName,
    role: input.role ?? "consumer",
    country: input.country ?? "CD",
  };
  if (input.role === "merchant") {
    if (input.businessName) data.business_name = input.businessName;
    if (input.businessSector) data.business_sector = input.businessSector;
  }
  return client.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data },
  });
}

export async function signInWithEmail(client: SupabaseClient, email: string, password: string) {
  return client.auth.signInWithPassword({ email, password });
}

// ── OTP téléphone (prêt, nécessite un fournisseur SMS côté Supabase) ───────
export async function startPhoneLogin(client: SupabaseClient, phone: string) {
  return client.auth.signInWithOtp({ phone });
}
export async function verifyPhoneOtp(client: SupabaseClient, phone: string, token: string) {
  return client.auth.verifyOtp({ phone, token, type: "sms" });
}

// ── Session & contexte ─────────────────────────────────────────────────────
export async function signOut(client: SupabaseClient) {
  return client.auth.signOut();
}

export async function getSession(client: SupabaseClient) {
  const { data } = await client.auth.getSession();
  return data.session;
}

export interface AppUserContext {
  appUserId: string; // users.id
  fullName: string;
  score: number;
}

/**
 * Récupère l'identité applicative + le score courant de l'utilisateur connecté.
 * Jointure users → credit_profiles, sous RLS (l'utilisateur ne lit que lui-même).
 */
export async function getAppUserContext(client: SupabaseClient): Promise<AppUserContext | null> {
  const { data: userRow, error: userErr } = await client
    .from("users")
    .select("id, full_name")
    .single();
  if (userErr || !userRow) return null;

  const { data: profile, error: profErr } = await client
    .from("credit_profiles")
    .select("current_score")
    .eq("user_id", userRow.id)
    .single();
  if (profErr || !profile) return null;

  return { appUserId: userRow.id, fullName: userRow.full_name, score: profile.current_score };
}
