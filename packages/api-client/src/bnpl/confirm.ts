import type { SupabaseClient } from "@supabase/supabase-js";
import { type BnplDecision, buildInstallments, decideBnpl } from "@sensei/payments";
import type { FlightOffer, FlightSearchParams } from "../flights/provider";

/**
 * Confirme une réservation payée en BNPL — persistance complète sous l'identité de
 * l'utilisateur (RLS, politiques INSERT de la migration 0003) :
 *   flight_search → flight_offer → bnpl_application → bnpl_plan → installments → booking.
 *
 * Le SCORE n'est pas modifié ici (réservé au serveur). Les PAIEMENTS d'échéances non plus :
 * ils passeront par le webhook/Edge Function (service_role).
 */
export interface ConfirmBnplBookingParams {
  userId: string; // users.id
  score: number; // lu depuis credit_profiles
  installmentCount: number;
  search: FlightSearchParams;
  offer: FlightOffer;
}

export interface ConfirmBnplBookingResult {
  decision: BnplDecision;
  bookingId?: string;
  planId?: string;
}

export async function confirmBnplBooking(
  supabase: SupabaseClient,
  params: ConfirmBnplBookingParams,
): Promise<ConfirmBnplBookingResult> {
  const decision = decideBnpl({
    score: params.score,
    principalCents: params.offer.totalCents,
    installmentCount: params.installmentCount,
  });
  if (!decision.approved) return { decision };

  // 1) Recherche + offre (persistées pour pouvoir réserver)
  const { data: search, error: searchErr } = await supabase
    .from("flight_searches")
    .insert({
      user_id: params.userId,
      origin: params.search.origin,
      destination: params.search.destination,
      depart_date: params.search.departDate,
      passenger_count: params.search.passengers,
      cabin_class: params.search.cabin,
    })
    .select("id")
    .single();
  if (searchErr) throw searchErr;

  const { data: offer, error: offerErr } = await supabase
    .from("flight_offers")
    .insert({
      search_id: search.id,
      provider: params.offer.provider,
      provider_offer_id: params.offer.providerOfferId,
      total_cents: params.offer.totalCents,
      expires_at: params.offer.expiresAt,
      segments_json: params.offer.segments,
    })
    .select("id")
    .single();
  if (offerErr) throw offerErr;

  // 2) Demande + plan + échéances
  const { data: app, error: appErr } = await supabase
    .from("bnpl_applications")
    .insert({
      user_id: params.userId,
      order_ref: offer.id,
      principal_cents: decision.principalCents,
      status: "approved",
      decision_score: params.score,
      decision_reason: decision.reasonCode,
      decided_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (appErr) throw appErr;

  const { data: plan, error: planErr } = await supabase
    .from("bnpl_plans")
    .insert({
      application_id: app.id,
      user_id: params.userId,
      principal_cents: decision.principalCents,
      fee_cents: decision.feeCents,
      total_cents: decision.totalCents,
      installment_count: decision.installmentCount,
      status: "active",
    })
    .select("id")
    .single();
  if (planErr) throw planErr;

  const planned = buildInstallments(decision.totalCents, decision.installmentCount, new Date());
  const { error: insErr } = await supabase.from("installments").insert(
    planned.map((p) => ({
      plan_id: plan.id,
      sequence: p.sequence,
      amount_cents: p.amountCents,
      due_date: p.dueDate,
      status: "scheduled",
    })),
  );
  if (insErr) throw insErr;

  // 3) Réservation confirmée, payée en BNPL
  const { data: booking, error: bookErr } = await supabase
    .from("bookings")
    .insert({
      user_id: params.userId,
      offer_id: offer.id,
      status: "confirmed",
      total_cents: params.offer.totalCents,
      bnpl_plan_id: plan.id,
      confirmed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (bookErr) throw bookErr;

  return { decision, bookingId: booking.id, planId: plan.id };
}
