/**
 * SDK JavaScript Sensei — intégration marchands BNPL
 *
 * Usage (navigateur) :
 *   <script src="https://js.sensei.cd/v1/sensei.js"></script>
 *   <script>
 *     Sensei.init({ publicKey: 'pk_live_xxx', locale: 'fr' });
 *
 *     // Lancer le checkout (redirige l'acheteur vers la page de paiement Sensei)
 *     Sensei.checkout({
 *       amount: 15000,          // cents USD
 *       orderId: 'CMD-001',
 *       returnUrl: 'https://monsite.cd/confirmation',
 *       cancelUrl:  'https://monsite.cd/panier',
 *     });
 *
 *     // Widget promo "Dès X $/mois" sur les pages produit
 *     Sensei.renderPromo({ amount: 15000, selector: '#sensei-promo' });
 *   </script>
 */

// ── Configuration ─────────────────────────────────────────────────────────

const SENSEI_API_URL = "https://api.sensei.cd/functions/v1";
const SENSEI_CHECKOUT_URL = "https://pay.sensei.cd";

interface SenseiConfig {
  publicKey: string;
  locale?: "fr" | "en";
  /** Surcharge l'URL de l'API (utile pour le sandbox). */
  apiUrl?: string;
  /** Surcharge l'URL de la page checkout. */
  checkoutUrl?: string;
}

interface CheckoutParams {
  /** Montant en cents USD. Ex : 150 $ = 15000. */
  amount: number;
  currency?: string;
  orderId: string;
  items?: Array<{ name: string; quantity: number; unitPrice: number }>;
  /** URL de redirection après confirmation de l'acheteur. */
  returnUrl: string;
  /** URL de redirection si l'acheteur annule. */
  cancelUrl: string;
}

interface PromoParams {
  /** Montant en cents USD. */
  amount: number;
  /** Sélecteur CSS de l'élément conteneur. */
  selector: string;
  /** Options d'échéances à afficher (default: [3, 4]). */
  installmentOptions?: number[];
}

// ── Client ────────────────────────────────────────────────────────────────

let _config: Required<SenseiConfig> | null = null;

function ensureInit(): Required<SenseiConfig> {
  if (!_config) {
    throw new Error(
      "[Sensei] Appelez Sensei.init({ publicKey }) avant toute autre méthode.",
    );
  }
  return _config;
}

/**
 * Initialise le SDK avec la clé publique du marchand.
 * À appeler une fois, avant tout appel à checkout() ou renderPromo().
 */
export function init(cfg: SenseiConfig): void {
  _config = {
    publicKey: cfg.publicKey,
    locale: cfg.locale ?? "fr",
    apiUrl: cfg.apiUrl ?? SENSEI_API_URL,
    checkoutUrl: cfg.checkoutUrl ?? SENSEI_CHECKOUT_URL,
  };
}

/**
 * Lance le flux de checkout BNPL.
 * Appelle l'API Sensei pour créer une session, puis redirige l'acheteur
 * vers la page de paiement Sensei. Après confirmation, l'acheteur est
 * redirigé vers `returnUrl?checkout_token=TOKEN`.
 */
export async function checkout(params: CheckoutParams): Promise<void> {
  const cfg = ensureInit();

  if (!Number.isInteger(params.amount) || params.amount <= 0) {
    throw new Error("[Sensei] amount doit être un entier positif en cents.");
  }
  if (!params.orderId) throw new Error("[Sensei] orderId est requis.");
  if (!params.returnUrl || !params.cancelUrl) {
    throw new Error("[Sensei] returnUrl et cancelUrl sont requis.");
  }

  const res = await fetch(`${cfg.apiUrl}/merchant-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey: cfg.publicKey,
      amount: params.amount,
      currency: params.currency ?? "USD",
      orderId: params.orderId,
      items: params.items ?? [],
      returnUrl: params.returnUrl,
      cancelUrl: params.cancelUrl,
    }),
  });

  if (!res.ok) {
    let msg = "unknown";
    try {
      const err = await res.json() as { error?: string };
      msg = err.error ?? String(res.status);
    } catch { /* ignore */ }
    throw new Error(`[Sensei] Création de session échouée : ${msg}`);
  }

  const { checkoutUrl } = await res.json() as { checkoutUrl: string };
  if (typeof window !== "undefined") {
    window.location.href = checkoutUrl;
  }
}

/**
 * Injecte un widget "Dès X $/mois" dans un élément DOM.
 * Idéal pour les pages produit du marchand.
 *
 * @example
 * // HTML : <span id="sensei-promo"></span>
 * Sensei.renderPromo({ amount: 15000, selector: '#sensei-promo' });
 */
export function renderPromo(params: PromoParams): void {
  if (typeof document === "undefined") return;
  const cfg = ensureInit();

  const el = document.querySelector(params.selector);
  if (!el) return;

  const options = params.installmentOptions ?? [3, 4];
  const lowestInstallment = options[0] ?? 3;
  const perMonthCents = Math.ceil(params.amount / lowestInstallment);
  const perMonthUsd = (perMonthCents / 100).toFixed(2);

  const label =
    cfg.locale === "fr"
      ? `Dès <strong>${perMonthUsd} $</strong> / mois en ${lowestInstallment}× sans frais`
      : `From <strong>$${perMonthUsd}</strong> / month in ${lowestInstallment}× interest-free`;

  el.innerHTML = /* html */ `
    <span style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#1E63C4;font-weight:600;font-family:inherit;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      ${label} avec <span style="font-weight:800;">Sensei</span>
    </span>
  `;
}

// Export groupé pour le build IIFE (window.Sensei = { init, checkout, renderPromo })
export const Sensei = { init, checkout, renderPromo };
