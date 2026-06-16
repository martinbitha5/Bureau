import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { formatCents } from "@sensei/utils";
import { supabase } from "../supabase";
import { AppContainer, IconArrowRight, IconCheck, IconInfo, Spinner } from "../components";

// Page de retour du terminal virtuel (vente par téléphone/en agence, sans site
// marchand à rediriger vers). `checkout-confirm` ajoute lui-même `?checkout_token=...`
// à `return_url` — ce paramètre n'est pas `token` (réservé à /checkout).

export const Route = createFileRoute("/checkout_/merci")({
  validateSearch: (search: Record<string, unknown>) => ({
    checkoutToken: (search["checkout_token"] as string) ?? "",
  }),
  component: CheckoutMerciPage,
});

interface ConfirmedSession {
  amount_cents: number;
  order_ref: string;
  status: "pending" | "authorized" | "expired" | "cancelled";
  metadata_json: { merchantName?: string };
}

function CheckoutMerciPage() {
  const { checkoutToken } = Route.useSearch();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["checkout_session_merci", checkoutToken],
    queryFn: async (): Promise<ConfirmedSession> => {
      const { data, error } = await supabase
        .from("checkout_sessions")
        .select("amount_cents, order_ref, status, metadata_json")
        .eq("token", checkoutToken)
        .single();
      if (error) throw error;
      return data as ConfirmedSession;
    },
    enabled: !!checkoutToken,
  });

  if (!checkoutToken || error || (session && session.status !== "authorized")) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sensei-paper to-white py-10 px-4 flex items-center justify-center">
        <AppContainer>
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-sensei-danger/10 text-sensei-danger flex items-center justify-center mx-auto mb-5">
              <IconInfo className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-sensei-ink mb-2">Lien invalide</h1>
            <p className="text-sensei-muted text-sm mb-6">
              Cette confirmation de paiement n'existe pas ou a déjà été traitée.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-3 bg-sensei-bright text-white font-bold rounded-xl hover:bg-sensei-blue transition-all text-sm"
            >
              Retour à l'accueil <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </AppContainer>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-6 h-6 text-sensei-bright animate-spin" />
      </div>
    );
  }

  const merchantName = session?.metadata_json.merchantName ?? "le marchand";

  return (
    <div className="min-h-screen bg-gradient-to-b from-sensei-paper to-white py-10 px-4 flex items-center justify-center">
      <AppContainer>
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-sensei-trust/15 text-sensei-trust flex items-center justify-center mx-auto mb-6">
            <IconCheck className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-sensei-ink mb-2">Financement confirmé</h1>
          <p className="text-sensei-muted mb-1">
            {formatCents(session!.amount_cents)} financés chez {merchantName}.
          </p>
          <p className="text-sm text-sensei-muted">Commande {session!.order_ref}</p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sensei-bright hover:underline"
            >
              Voir mon tableau de bord <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </AppContainer>
    </div>
  );
}
