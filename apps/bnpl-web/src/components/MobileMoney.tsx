import type { MobileMoneyProvider } from "@sensei/api-client";
import { cx } from "./ui";

/**
 * Métadonnées des opérateurs mobile money RDC affichés dans Sensei Pay.
 * (Choix produit : M-Pesa, Orange Money, Airtel Money — cf. INTEGRATIONS.md §3.)
 * Les libellés viennent de l'i18n (`methods.provider.*`), ici seulement la couleur + l'initiale.
 */
export const MOBILE_MONEY_PROVIDERS: MobileMoneyProvider[] = ["mpesa", "orange_money", "airtel_money"];

export const PROVIDER_COLOR: Record<MobileMoneyProvider, string> = {
  mpesa: "#1E8E5A", // vert M-Pesa
  orange_money: "#F16E00", // orange
  airtel_money: "#E40000", // rouge Airtel
};

const PROVIDER_INITIAL: Record<MobileMoneyProvider, string> = {
  mpesa: "M",
  orange_money: "O",
  airtel_money: "A",
};

/** Avatar rond coloré d'un opérateur (initiale). Neutre et sobre. */
export function MobileMoneyAvatar({
  provider,
  size = 40,
}: {
  provider: MobileMoneyProvider | string;
  size?: number;
}) {
  const key = (MOBILE_MONEY_PROVIDERS as string[]).includes(provider)
    ? (provider as MobileMoneyProvider)
    : "mpesa";
  const color = PROVIDER_COLOR[key];
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl font-black text-white flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.42 }}
      aria-hidden
    >
      {PROVIDER_INITIAL[key]}
    </span>
  );
}

/** Petit logo + libellé en ligne (pour les listes de la landing/FAQ). */
export function MobileMoneyChip({
  provider,
  label,
  className,
}: {
  provider: MobileMoneyProvider;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 bg-white border border-sensei-line rounded-full pl-1.5 pr-3.5 py-1.5 text-sm font-semibold text-sensei-text",
        className,
      )}
    >
      <MobileMoneyAvatar provider={provider} size={24} />
      {label}
    </span>
  );
}
