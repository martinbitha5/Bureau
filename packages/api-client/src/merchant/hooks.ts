import { queryOptions } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Hooks TanStack Query pour le portail marchand.
 * Les marchands lisent uniquement leurs propres données grâce à la RLS
 * (migration 0005 : app_merchant_id() + politiques merchant_*_select).
 */

export interface MerchantProfile {
  id: string;
  name: string;
  api_key_public: string | null;
  website_url: string | null;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  commission_bps: number;
  settlement_account: string | null;
}

export interface MerchantPayout {
  id: string;
  type: "payout" | "reversal";
  status: "pending" | "succeeded" | "failed";
  capture_transaction_id: string;
  refund_transaction_id: string | null;
  source_payout_id: string | null;
  commission_bps_snapshot: number;
  gross_amount_cents: number;
  commission_cents: number;
  net_amount_cents: number;
  currency: string;
  settlement_account: string | null;
  created_at: string;
  settled_at: string | null;
}

export interface MerchantCheckoutSession {
  id: string;
  token: string;
  amount_cents: number;
  currency: string;
  order_ref: string;
  status: "pending" | "authorized" | "expired" | "cancelled";
  metadata_json: {
    merchantName?: string;
    items?: unknown[];
    source?: "virtual_terminal";
    customerNote?: string | null;
  };
  expires_at: string;
  created_at: string;
}

export interface MerchantWebhookEvent {
  id: string;
  event_type: string;
  status: "pending" | "delivered" | "failed";
  attempts: number;
  last_attempt_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

/** Profil marchand lié à l'utilisateur connecté (null si pas encore créé). */
export function merchantProfileOptions(supabase: SupabaseClient, userId: string) {
  return queryOptions({
    queryKey: ["merchant", "profile", userId],
    queryFn: async (): Promise<MerchantProfile | null> => {
      const { data } = await supabase
        .from("merchants")
        .select(
          "id, name, api_key_public, website_url, webhook_url, is_active, created_at, updated_at, commission_bps, settlement_account",
        )
        .eq("user_id", userId)
        .maybeSingle();
      return (data as MerchantProfile | null) ?? null;
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

/** Sessions de checkout du marchand (max 200, tri anti-chronologique). */
export function merchantSessionsOptions(supabase: SupabaseClient, merchantId: string) {
  return queryOptions({
    queryKey: ["merchant", "sessions", merchantId],
    queryFn: async (): Promise<MerchantCheckoutSession[]> => {
      const { data, error } = await supabase
        .from("checkout_sessions")
        .select(
          "id, token, amount_cents, currency, order_ref, status, metadata_json, expires_at, created_at",
        )
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as MerchantCheckoutSession[];
    },
    enabled: !!merchantId,
  });
}

/** Versements (et reprises) du marchand — 200 derniers, tri anti-chronologique. */
export function merchantPayoutsOptions(supabase: SupabaseClient, merchantId: string) {
  return queryOptions({
    queryKey: ["merchant", "payouts", merchantId],
    queryFn: async (): Promise<MerchantPayout[]> => {
      const { data, error } = await supabase
        .from("merchant_payouts")
        .select(
          "id, type, status, capture_transaction_id, refund_transaction_id, source_payout_id, commission_bps_snapshot, gross_amount_cents, commission_cents, net_amount_cents, currency, settlement_account, created_at, settled_at",
        )
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as MerchantPayout[];
    },
    enabled: !!merchantId,
  });
}

/** Log des webhook events du marchand (50 derniers). */
export function merchantWebhookEventsOptions(supabase: SupabaseClient, merchantId: string) {
  return queryOptions({
    queryKey: ["merchant", "webhooks", merchantId],
    queryFn: async (): Promise<MerchantWebhookEvent[]> => {
      const { data, error } = await supabase
        .from("webhook_events")
        .select(
          "id, event_type, status, attempts, last_attempt_at, delivered_at, created_at",
        )
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as MerchantWebhookEvent[];
    },
    enabled: !!merchantId,
  });
}
