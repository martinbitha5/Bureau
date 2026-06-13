/**
 * Helpers d'argent — RÈGLE D'OR (docs/DATA_DICTIONARY.md §9, docs/ERROR_LOG.md [money]) :
 * l'argent est TOUJOURS un entier en cents. Jamais de float pour stocker ou calculer.
 * Le float n'apparaît qu'à l'instant de l'affichage.
 */

export type Cents = number; // entier
export type Currency = "USD";

/** Convertit un montant saisi en USD (ex: 49.99) en cents entiers (4999). */
export function usdToCents(amountUsd: number): Cents {
  return Math.round(amountUsd * 100);
}

/** Formate des cents en chaîne lisible. Ex: 4999 -> "49.99 $". */
export function formatCents(cents: Cents, currency: Currency = "USD"): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = (abs % 100).toString().padStart(2, "0");
  const symbol = currency === "USD" ? "$" : currency;
  return `${sign}${whole}.${frac} ${symbol}`;
}

/**
 * Répartit un total en `count` échéances entières, sans perdre un seul cent.
 * Le reste de la division est ajouté à la PREMIÈRE échéance.
 * Ex: répartir 10000 en 3 -> [3334, 3333, 3333] (somme = 10000).
 */
export function splitIntoInstallments(totalCents: Cents, count: number): Cents[] {
  if (!Number.isInteger(totalCents)) {
    throw new Error("totalCents doit être un entier (cents).");
  }
  if (count <= 0) {
    throw new Error("count doit être > 0.");
  }
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, i) => (i === 0 ? base + remainder : base));
}

/** Garde-fou : vérifie qu'une somme d'échéances égale bien le total. */
export function assertSumEquals(parts: Cents[], expectedTotal: Cents): void {
  const sum = parts.reduce((a, b) => a + b, 0);
  if (sum !== expectedTotal) {
    throw new Error(`Somme des échéances (${sum}) != total attendu (${expectedTotal}).`);
  }
}
