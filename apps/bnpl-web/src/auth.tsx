import {
  type AppUserContext,
  type EmailSignUpInput,
  getAppUserContext,
  signInWithEmail,
  signOut as authSignOut,
  signUpWithEmail,
} from "@sensei/auth";
import type { Session } from "@supabase/supabase-js";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

interface AuthValue {
  session: Session | null;
  appUser: AppUserContext | null;
  /** Rôle du compte connecté, lu dans la metadata Supabase. */
  role: "consumer" | "merchant";
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (input: EmailSignUpInput) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<AppUserContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setAppUser(null);
      return;
    }
    getAppUserContext(supabase).then(setAppUser);
  }, [session]);

  const role = session?.user?.user_metadata?.role === "merchant" ? "merchant" : "consumer";

  const value: AuthValue = {
    session,
    appUser,
    role,
    loading,
    signIn: async (email, password) => {
      const { error } = await signInWithEmail(supabase, email, password);
      return { error: error?.message ?? null };
    },
    signUp: async (input) => {
      const { data, error } = await signUpWithEmail(supabase, input);
      return { error: error?.message ?? null, needsConfirmation: !!data.user && !data.session };
    },
    signOut: async () => {
      await authSignOut(supabase);
      setAppUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
