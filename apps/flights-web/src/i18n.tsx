import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

/**
 * i18n minimal (docs/BRAND_BRIEF.md : aucun texte en dur). FR base + EN.
 * Lingala/Swahili : clés prêtes, traductions à compléter (cf. FEATURE_BACKLOG).
 */
export type Lang = "fr" | "en";

const dict: Record<Lang, Record<string, string>> = {
  fr: {
    "brand.name": "Sensei Flights",
    "brand.tagline": "Voyagez maintenant, payez à votre rythme.",
    "nav.search": "Rechercher",
    "search.title": "Où allez-vous ?",
    "search.subtitle": "Réservez votre vol et payez en plusieurs fois, sans frais cachés.",
    "search.origin": "Départ",
    "search.destination": "Arrivée",
    "search.date": "Date de départ",
    "search.passengers": "Voyageurs",
    "search.cabin": "Classe",
    "search.cta": "Rechercher des vols",
    "cabin.economy": "Économique",
    "cabin.premium": "Premium",
    "cabin.business": "Affaires",
    "results.title": "Vols disponibles",
    "results.route": "Trajet",
    "results.loading": "Recherche des meilleures offres…",
    "results.empty": "Aucune offre. Lancez une recherche.",
    "results.nonstop": "Direct",
    "results.choose": "Choisir",
    "results.back": "Modifier la recherche",
    "checkout.title": "Paiement",
    "checkout.summary": "Récapitulatif",
    "checkout.method": "Comment souhaitez-vous payer ?",
    "checkout.mobileMoney": "Mobile Money",
    "checkout.mobileMoneyHint": "Payez la totalité maintenant.",
    "checkout.bnpl": "Payer en plusieurs fois",
    "checkout.bnplHint": "Échelonnez avec Sensei, sans frais.",
    "checkout.installments": "Nombre d'échéances",
    "checkout.score": "Votre score Sensei",
    "checkout.scoreHint": "Simulé pour la démo (le score réel viendra de votre profil de crédit).",
    "checkout.schedule": "Votre échéancier",
    "checkout.noFees": "Aucun frais. Le total reste identique au prix du billet.",
    "checkout.dueNow": "Dû aujourd'hui",
    "checkout.due": "Échéance",
    "checkout.total": "Total à payer",
    "checkout.confirm": "Confirmer la réservation",
    "checkout.declined": "Financement non disponible pour ce montant avec votre score.",
    "checkout.confirmed": "Réservation confirmée ✓",
    "checkout.payFull": "Payer {amount} maintenant",
    "checkout.scoreReal": "Votre score réel, issu de votre profil de crédit Sensei.",
    "common.passenger": "voyageur",
    "common.passengers": "voyageurs",
    "auth.login": "Se connecter",
    "auth.logout": "Se déconnecter",
    "auth.signup": "Créer un compte",
    "auth.account": "Mon compte",
    "auth.subtitle": "Un seul compte pour tout l'écosystème Sensei.",
    "auth.fullName": "Nom complet",
    "auth.phone": "Téléphone",
    "auth.email": "E-mail",
    "auth.password": "Mot de passe",
    "auth.toSignup": "Pas de compte ? Créez-en un",
    "auth.toLogin": "Déjà un compte ? Connectez-vous",
    "auth.checkEmail": "Vérifiez votre e-mail pour confirmer votre compte.",
    "auth.loginToBook": "Se connecter pour réserver",
  },
  en: {
    "brand.name": "Sensei Flights",
    "brand.tagline": "Travel now, pay at your pace.",
    "nav.search": "Search",
    "search.title": "Where to?",
    "search.subtitle": "Book your flight and split the payment — no hidden fees.",
    "search.origin": "From",
    "search.destination": "To",
    "search.date": "Departure date",
    "search.passengers": "Passengers",
    "search.cabin": "Cabin",
    "search.cta": "Search flights",
    "cabin.economy": "Economy",
    "cabin.premium": "Premium",
    "cabin.business": "Business",
    "results.title": "Available flights",
    "results.route": "Route",
    "results.loading": "Finding the best offers…",
    "results.empty": "No offers. Start a search.",
    "results.nonstop": "Nonstop",
    "results.choose": "Select",
    "results.back": "Edit search",
    "checkout.title": "Checkout",
    "checkout.summary": "Summary",
    "checkout.method": "How would you like to pay?",
    "checkout.mobileMoney": "Mobile Money",
    "checkout.mobileMoneyHint": "Pay the full amount now.",
    "checkout.bnpl": "Pay over time",
    "checkout.bnplHint": "Split it with Sensei, no fees.",
    "checkout.installments": "Number of installments",
    "checkout.score": "Your Sensei score",
    "checkout.scoreHint": "Simulated for the demo (real score will come from your credit profile).",
    "checkout.schedule": "Your schedule",
    "checkout.noFees": "No fees. The total equals the ticket price.",
    "checkout.dueNow": "Due today",
    "checkout.due": "Installment",
    "checkout.total": "Total to pay",
    "checkout.confirm": "Confirm booking",
    "checkout.declined": "Financing unavailable for this amount with your score.",
    "checkout.confirmed": "Booking confirmed ✓",
    "checkout.payFull": "Pay {amount} now",
    "checkout.scoreReal": "Your real score, from your Sensei credit profile.",
    "common.passenger": "passenger",
    "common.passengers": "passengers",
    "auth.login": "Sign in",
    "auth.logout": "Sign out",
    "auth.signup": "Create account",
    "auth.account": "My account",
    "auth.subtitle": "One account for the whole Sensei ecosystem.",
    "auth.fullName": "Full name",
    "auth.phone": "Phone",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.toSignup": "No account? Create one",
    "auth.toLogin": "Already have an account? Sign in",
    "auth.checkEmail": "Check your email to confirm your account.",
    "auth.loginToBook": "Sign in to book",
  },
};

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");
  const value = useMemo<I18nValue>(() => {
    const t = (key: string, vars?: Record<string, string>) => {
      let s = dict[lang][key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
      return s;
    };
    return { lang, setLang, t };
  }, [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n doit être utilisé dans <I18nProvider>");
  return ctx;
}
