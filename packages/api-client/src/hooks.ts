import { queryOptions } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { queryKeys } from "./keys";
import { type FlightSearchParams, MockFlightProvider } from "./flights/provider";

/**
 * Hooks / options TanStack Query. La SEULE porte d'entrée vers les données côté apps.
 * Aucun composant ne doit appeler Supabase ou un provider directement (docs/CLAUDE.md §3).
 */

const flightProvider = new MockFlightProvider();

/** Options de requête pour une recherche de vols. */
export function flightSearchOptions(params: FlightSearchParams) {
  return queryOptions({
    queryKey: queryKeys.flightSearch(params as unknown as Record<string, unknown>),
    queryFn: () => flightProvider.search(params),
    staleTime: 5 * 60_000, // une offre vit ~30 min côté provider
  });
}

/** Options de requête pour le profil de crédit d'un utilisateur. */
export function creditProfileOptions(supabase: SupabaseClient, userId: string) {
  return queryOptions({
    queryKey: queryKeys.creditProfile(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

/** Options de requête pour les plans BNPL d'un utilisateur. */
export function bnplPlansOptions(supabase: SupabaseClient, userId: string) {
  return queryOptions({
    queryKey: queryKeys.bnplPlans(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bnpl_plans")
        .select("*, installments(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
