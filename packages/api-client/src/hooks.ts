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

/** Historique des événements de score de l'utilisateur (RLS : limité à son profil). */
export function creditScoreEventsOptions(supabase: SupabaseClient, userId: string) {
  return queryOptions({
    queryKey: queryKeys.creditScoreEvents(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_score_events")
        .select("id, previous_score, new_score, reason_code, source, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** Réservations de vol de l'utilisateur (statut de paiement). RLS : l'utilisateur ne lit que les siennes. */
export function bookingsOptions(supabase: SupabaseClient, userId: string) {
  return queryOptions({
    queryKey: queryKeys.bookings(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, provider_booking_ref, status, total_cents, currency, created_at, confirmed_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** Lignes du rapport de crédit (engagements déclarés). RLS : limité au profil de l'utilisateur. */
export function creditReportLinesOptions(supabase: SupabaseClient, userId: string) {
  return queryOptions({
    queryKey: queryKeys.creditReportLines(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_report_lines")
        .select("id, category, description, amount_cents, currency, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** Consentements de partage de données de l'utilisateur (qui peut voir le score). */
export function consentsOptions(supabase: SupabaseClient, userId: string) {
  return queryOptions({
    queryKey: queryKeys.consents(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consents")
        .select("id, scope, granted_to_type, granted_to_id, is_active, granted_at, revoked_at")
        .eq("user_id", userId)
        .order("granted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** Pièces d'identité de l'utilisateur (statut KYC). RLS : l'utilisateur ne lit que les siennes. */
export function identitiesOptions(supabase: SupabaseClient, userId: string) {
  return queryOptions({
    queryKey: queryKeys.identities(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("identities")
        .select("id, id_type, id_number, verified_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
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

/** Un plan BNPL unique (avec ses échéances). RLS : limité au propriétaire. */
export function bnplPlanOptions(supabase: SupabaseClient, planId: string) {
  return queryOptions({
    queryKey: queryKeys.bnplPlan(planId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bnpl_plans")
        .select("*, installments(*)")
        .eq("id", planId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

/** Historique des paiements de l'utilisateur (échéances réglées, règlements). */
export function paymentsHistoryOptions(supabase: SupabaseClient, userId: string) {
  return queryOptions({
    queryKey: queryKeys.paymentsHistory(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("id, purpose, reference_id, amount_cents, currency, status, created_at, settled_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
