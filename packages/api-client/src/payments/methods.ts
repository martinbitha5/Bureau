import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Moyens de paiement enregistrés (mobile money en V1, façon Affirm adaptée RDC).
 * RLS : politique `payment_methods_owner` (for all) — l'utilisateur gère uniquement les siens.
 * (docs/CLAUDE.md §3 : tout accès Supabase passe par ce package.)
 */

export type MobileMoneyProvider = "mpesa" | "orange_money" | "airtel_money";

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: "mobile_money" | "card" | "bnpl";
  provider: string;
  masked_identifier: string;
  is_default: boolean;
  created_at: string;
}

import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "../keys";

/** Liste des moyens de paiement de l'utilisateur (le défaut en premier). */
export function paymentMethodsOptions(supabase: SupabaseClient, userId: string) {
  return queryOptions({
    queryKey: queryKeys.paymentMethods(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("id, user_id, type, provider, masked_identifier, is_default, created_at")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PaymentMethod[];
    },
  });
}

export interface AddPaymentMethodInput {
  userId: string;
  provider: MobileMoneyProvider;
  /** Numéro mobile money en clair (ex : +243812345678). Stocké masqué. */
  phone: string;
  makeDefault?: boolean;
}

/** Masque un numéro mobile money : conserve l'indicatif et les 3 derniers chiffres. */
export function maskMobileNumber(phone: string): string {
  const digits = phone.replace(/\s+/g, "");
  if (digits.length <= 6) return digits;
  const head = digits.slice(0, 4);
  const tail = digits.slice(-3);
  return `${head}••••${tail}`;
}

/** Ajoute un moyen de paiement mobile money. Devient le défaut si demandé ou si c'est le 1er. */
export async function addPaymentMethod(
  supabase: SupabaseClient,
  input: AddPaymentMethodInput,
): Promise<PaymentMethod> {
  const { count } = await supabase
    .from("payment_methods")
    .select("id", { count: "exact", head: true })
    .eq("user_id", input.userId);

  const makeDefault = input.makeDefault ?? (count ?? 0) === 0;

  if (makeDefault) {
    // Un seul défaut à la fois.
    await supabase
      .from("payment_methods")
      .update({ is_default: false })
      .eq("user_id", input.userId);
  }

  const { data, error } = await supabase
    .from("payment_methods")
    .insert({
      user_id: input.userId,
      type: "mobile_money",
      provider: input.provider,
      masked_identifier: maskMobileNumber(input.phone),
      is_default: makeDefault,
    })
    .select("id, user_id, type, provider, masked_identifier, is_default, created_at")
    .single();
  if (error) throw error;
  return data as PaymentMethod;
}

/** Définit un moyen de paiement comme défaut (et retire le défaut des autres). */
export async function setDefaultPaymentMethod(
  supabase: SupabaseClient,
  userId: string,
  methodId: string,
): Promise<void> {
  const { error: clearErr } = await supabase
    .from("payment_methods")
    .update({ is_default: false })
    .eq("user_id", userId);
  if (clearErr) throw clearErr;

  const { error } = await supabase
    .from("payment_methods")
    .update({ is_default: true })
    .eq("id", methodId)
    .eq("user_id", userId);
  if (error) throw error;
}

/** Supprime un moyen de paiement. */
export async function removePaymentMethod(
  supabase: SupabaseClient,
  methodId: string,
): Promise<void> {
  const { error } = await supabase.from("payment_methods").delete().eq("id", methodId);
  if (error) throw error;
}
