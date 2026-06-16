import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "../auth";
import { Spinner } from "./icons";

/**
 * Garde de page connectée. Redirige vers /login si aucune session.
 * Affiche un spinner pendant la résolution de session.
 * Les pages enfants peuvent supposer qu'une session existe.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-6 h-6 text-sensei-bright animate-spin" />
      </div>
    );
  }

  if (!session) return null; // redirection en cours

  return <>{children}</>;
}
