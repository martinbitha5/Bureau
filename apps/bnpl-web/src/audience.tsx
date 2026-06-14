import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

/**
 * Audience courante du site, façon Affirm : « Acheteurs » vs « Marchands ».
 * Pilote le contenu de la landing et la cible des boutons « Se connecter / Créer un compte »
 * du header. Persistée localement pour rester stable entre les pages.
 */
export type Audience = "buyer" | "merchant";

const STORAGE_KEY = "sensei.audience";

interface AudienceValue {
  audience: Audience;
  setAudience: (a: Audience) => void;
}

const AudienceContext = createContext<AudienceValue | null>(null);

export function AudienceProvider({ children }: { children: ReactNode }) {
  const [audience, setAudience] = useState<Audience>(() => {
    if (typeof window === "undefined") return "buyer";
    return window.localStorage.getItem(STORAGE_KEY) === "merchant" ? "merchant" : "buyer";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, audience);
  }, [audience]);

  const value = useMemo<AudienceValue>(() => ({ audience, setAudience }), [audience]);
  return <AudienceContext.Provider value={value}>{children}</AudienceContext.Provider>;
}

export function useAudience(): AudienceValue {
  const ctx = useContext(AudienceContext);
  if (!ctx) throw new Error("useAudience doit être utilisé dans <AudienceProvider>");
  return ctx;
}
