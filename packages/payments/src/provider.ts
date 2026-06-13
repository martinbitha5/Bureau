/**
 * Abstraction des moyens de paiement (docs/INTEGRATIONS.md §3-4, docs/CLAUDE.md §3).
 *
 * Le RESTE de l'écosystème ne connaît QUE cette interface. Le jour où l'on signe avec
 * Flutterwave / un opérateur mobile money, on implémente `PaymentProvider` sans toucher
 * au code appelant. La V1 tourne avec `MockPaymentProvider`.
 */

export interface ChargeRequest {
  /** Montant en cents (jamais de float). */
  amountCents: number;
  currency: "USD";
  /** Réf. métier de l'objet payé (installments.id, bookings.id…). */
  referenceId: string;
  /** Clé d'idempotence — empêche le double encaissement (docs/ERROR_LOG.md [payments]). */
  idempotencyKey: string;
  method: "mobile_money" | "card";
  /** Identifiant côté usager (n° mobile money, token carte…). */
  instrument: string;
}

export interface ChargeResult {
  status: "succeeded" | "pending" | "failed";
  /** Référence du prestataire, stockée dans payments.provider_ref. */
  providerRef: string;
  rawMessage?: string;
}

export interface PaymentProvider {
  readonly name: string;
  charge(req: ChargeRequest): Promise<ChargeResult>;
  /** Vérifie la signature d'un webhook entrant. */
  verifyWebhook(payload: string, signature: string): boolean;
}
