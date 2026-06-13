import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

export type Lang = "fr" | "en";

const dict: Record<Lang, Record<string, string>> = {
  fr: {
    "brand.name": "Sensei Credit",
    "brand.tagline": "Vous saurez toujours où vous en êtes.",
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
    "auth.required": "Connectez-vous pour voir votre score.",
    "score.title": "Mon score Sensei",
    "score.updated": "Mis à jour le",
    "score.band.poor": "Faible",
    "score.band.fair": "Correct",
    "score.band.good": "Bon",
    "score.band.very_good": "Très bon",
    "score.band.excellent": "Excellent",
    "score.history": "Historique",
    "score.empty": "Aucun événement pour l'instant. Vos remboursements feront évoluer votre score.",
    "score.reason.on_time_payment": "Paiement à l'heure",
    "score.reason.late_payment": "Paiement en retard",
    "score.reason.bnpl_completed": "Financement soldé",
    "score.reason.bnpl_default": "Défaut de paiement",
    "score.reason.new_inquiry": "Nouvelle consultation",
    "score.loading": "Chargement de votre profil…",
  },
  en: {
    "brand.name": "Sensei Credit",
    "brand.tagline": "Always know where you stand.",
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
    "auth.required": "Sign in to see your score.",
    "score.title": "My Sensei score",
    "score.updated": "Updated on",
    "score.band.poor": "Poor",
    "score.band.fair": "Fair",
    "score.band.good": "Good",
    "score.band.very_good": "Very good",
    "score.band.excellent": "Excellent",
    "score.history": "History",
    "score.empty": "No events yet. Your repayments will move your score.",
    "score.reason.on_time_payment": "On-time payment",
    "score.reason.late_payment": "Late payment",
    "score.reason.bnpl_completed": "Plan completed",
    "score.reason.bnpl_default": "Default",
    "score.reason.new_inquiry": "New inquiry",
    "score.loading": "Loading your profile…",
  },
};

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}
const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");
  const value = useMemo<I18nValue>(
    () => ({ lang, setLang, t: (key) => dict[lang][key] ?? key }),
    [lang],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n doit être utilisé dans <I18nProvider>");
  return ctx;
}
