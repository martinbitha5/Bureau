import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

export type Lang = "fr" | "en";

const dict: Record<Lang, Record<string, string>> = {
  fr: {
    "brand.name": "Sensei Pay",
    "brand.tagline": "Payez en plusieurs fois, sans frais cachés.",
    "auth.login": "Se connecter",
    "auth.logout": "Se déconnecter",
    "auth.account": "Mon compte",
    "auth.subtitle": "Un seul compte pour tout l'écosystème Sensei.",
    "auth.email": "E-mail",
    "auth.password": "Mot de passe",
    "auth.required": "Connectez-vous pour gérer vos paiements.",
    "pay.title": "Mes paiements",
    "pay.score": "Votre score Sensei",
    "pay.loading": "Chargement…",
    "pay.empty": "Aucun plan de paiement. Réservez un vol en BNPL pour commencer.",
    "pay.total": "Total",
    "pay.installment": "Échéance",
    "pay.due": "échéance",
    "pay.dueOn": "à payer le",
    "pay.pay": "Payer",
    "pay.paying": "Paiement…",
    "pay.paid": "Payée",
    "pay.scoreNow": "Score :",
    "plan.status.active": "En cours",
    "plan.status.completed": "Soldé",
    "plan.status.defaulted": "En défaut",
    "plan.status.cancelled": "Annulé",
    "toast.scoreUp": "Paiement reçu. Votre score : {score}",
  },
  en: {
    "brand.name": "Sensei Pay",
    "brand.tagline": "Pay over time, no hidden fees.",
    "auth.login": "Sign in",
    "auth.logout": "Sign out",
    "auth.account": "My account",
    "auth.subtitle": "One account for the whole Sensei ecosystem.",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.required": "Sign in to manage your payments.",
    "pay.title": "My payments",
    "pay.score": "Your Sensei score",
    "pay.loading": "Loading…",
    "pay.empty": "No payment plan yet. Book a flight with BNPL to start.",
    "pay.total": "Total",
    "pay.installment": "Installment",
    "pay.due": "installment",
    "pay.dueOn": "due on",
    "pay.pay": "Pay",
    "pay.paying": "Paying…",
    "pay.paid": "Paid",
    "pay.scoreNow": "Score:",
    "plan.status.active": "Active",
    "plan.status.completed": "Completed",
    "plan.status.defaulted": "Defaulted",
    "plan.status.cancelled": "Cancelled",
    "toast.scoreUp": "Payment received. Your score: {score}",
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
  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => {
        let s = dict[lang][key] ?? key;
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
        return s;
      },
    }),
    [lang],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n doit être utilisé dans <I18nProvider>");
  return ctx;
}
