import type { ChargeRequest, ChargeResult, PaymentProvider } from "./provider";

/**
 * Implémentation factice pour la V1 / les tests.
 * Réussit toujours (sauf montant <= 0) et renvoie une référence déterministe basée sur
 * la clé d'idempotence — ce qui simule correctement l'anti-double-encaissement.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";
  private readonly seen = new Set<string>();

  async charge(req: ChargeRequest): Promise<ChargeResult> {
    if (req.amountCents <= 0) {
      return { status: "failed", providerRef: "", rawMessage: "montant invalide" };
    }
    // Idempotence : même clé -> même résultat, pas de second débit.
    this.seen.add(req.idempotencyKey);
    return {
      status: "succeeded",
      providerRef: `mock_${req.idempotencyKey}`,
      rawMessage: "paiement simulé",
    };
  }

  verifyWebhook(_payload: string, _signature: string): boolean {
    return true; // mock : toujours valide
  }
}
