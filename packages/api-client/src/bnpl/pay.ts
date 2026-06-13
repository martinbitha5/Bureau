import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Paie une échéance via l'Edge Function `pay-installment` (service_role côté serveur).
 * Le client NE touche jamais au score : la fonction vérifie la propriété, encaisse (mock V1)
 * et applique l'événement de score. Voir supabase/functions/pay-installment.
 */
export interface PayInstallmentResult {
  paid?: boolean;
  alreadyPaid?: boolean;
  reason?: "on_time_payment" | "late_payment";
  newScore?: number;
  planCompleted?: boolean;
  error?: string;
}

export async function payInstallment(
  supabase: SupabaseClient,
  installmentId: string,
): Promise<PayInstallmentResult> {
  const { data, error } = await supabase.functions.invoke("pay-installment", {
    body: { installmentId },
  });
  if (error) throw error;
  return data as PayInstallmentResult;
}
