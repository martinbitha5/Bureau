import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, type FormEvent } from "react";
import { merchantProfileOptions } from "@sensei/api-client";
import { useAuth } from "../auth";
import { supabase } from "../supabase";
import {
  IconArrowRight,
  IconCalendar,
  IconCard,
  IconGauge,
  IconPhone,
  IconReceipt,
  IconShield,
  IconWallet,
  Spinner,
  cx,
} from "../components";

export const Route = createFileRoute("/merchant")({
  component: MerchantLayout,
});

// ── Composants de navigation ──────────────────────────────────────────────

const NAV_ITEMS = [
  { to: "/merchant", label: "Vue d'ensemble", Icon: IconGauge, exact: true },
  { to: "/merchant/terminal", label: "Terminal virtuel", Icon: IconPhone, exact: false },
  { to: "/merchant/transactions", label: "Transactions", Icon: IconReceipt, exact: false },
  { to: "/merchant/payouts", label: "Versements", Icon: IconWallet, exact: false },
  { to: "/merchant/api-keys", label: "Clés API", Icon: IconCard, exact: false },
  { to: "/merchant/webhooks", label: "Webhooks", Icon: IconCalendar, exact: false },
] as const;

function Sidebar({ merchantName }: { merchantName: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col bg-sensei-ink text-white min-h-screen py-8 px-5">
      {/* Logo */}
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-sensei-bright flex items-center justify-center flex-shrink-0">
            <IconShield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-white/40">Sensei Pay</p>
            <p className="text-sm font-bold text-white leading-tight truncate max-w-[140px]">
              {merchantName}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ to, label, Icon, exact }) => {
          const active = exact
            ? pathname === to || pathname === `${to}/`
            : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cx(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80",
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Retour vers l'app acheteur */}
      <Link
        to="/"
        className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors mt-4"
      >
        <IconArrowRight className="w-3.5 h-3.5 rotate-180" />
        Retour à l'espace acheteur
      </Link>
    </aside>
  );
}

// ── Layout principal ──────────────────────────────────────────────────────

function MerchantLayout() {
  const { session, appUser, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const userId = appUser?.appUserId ?? "";
  const { data: merchant, isLoading: merchantLoading } = useQuery({
    ...merchantProfileOptions(supabase, userId),
    enabled: !!userId && role === "merchant",
  });

  // Redirections
  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    if (role !== "merchant") {
      navigate({ to: "/" });
    }
  }, [authLoading, session, role, navigate]);

  const isLoading = authLoading || merchantLoading;

  if (isLoading || !session || role !== "merchant") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-6 h-6 text-sensei-bright animate-spin" />
      </div>
    );
  }

  // Pas encore de compte marchand → onboarding
  if (!merchant) {
    return <MerchantOnboarding userId={userId} />;
  }

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <Sidebar merchantName={merchant.name} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

// ── Onboarding (première connexion marchand) ──────────────────────────────

function MerchantOnboarding({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const profileQuery = useQuery({ ...merchantProfileOptions(supabase, userId) });

  async function handleSetup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string).trim();
    const websiteUrl = (form.get("websiteUrl") as string).trim();
    const settlementAccount = (form.get("settlementAccount") as string).trim();

    const { data, error } = await supabase.functions.invoke("merchant-setup", {
      body: { action: "setup", name, websiteUrl: websiteUrl || null, settlementAccount },
    });

    if (error || !data?.keys) {
      alert("Erreur lors de la création du compte marchand. Réessayez.");
      return;
    }

    // Afficher les clés UNE SEULE FOIS
    const { publicKey, secretKey, webhookSecret } = data.keys as {
      publicKey: string;
      secretKey: string;
      webhookSecret: string;
    };

    const msg = [
      "✅ Compte marchand créé !",
      "",
      "Sauvegardez ces clés maintenant — elles ne seront plus affichées :",
      "",
      `Clé publique : ${publicKey}`,
      `Clé secrète  : ${secretKey}`,
      `Secret webhook : ${webhookSecret}`,
    ].join("\n");

    alert(msg);
    profileQuery.refetch();
    navigate({ to: "/merchant" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sensei-paper to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-sensei-bright/10 text-sensei-bright flex items-center justify-center mx-auto mb-4">
            <IconShield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-sensei-ink">Configurer votre compte marchand</h1>
          <p className="text-sensei-muted text-sm mt-2">
            Quelques informations pour activer Sensei Pay sur votre site.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-sensei-line shadow-sm p-8">
          <form onSubmit={handleSetup} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-sensei-text">
                Nom de l'entreprise <span className="text-sensei-danger">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Ex : Kinshasa Electronics"
                className="w-full border border-sensei-line rounded-xl px-4 py-3 text-sm text-sensei-text bg-sensei-paper placeholder:text-sensei-muted/50 focus:ring-2 focus:ring-sensei-bright/30 focus:border-sensei-bright transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-sensei-text">
                Site web{" "}
                <span className="text-sensei-muted font-normal text-xs">(facultatif)</span>
              </label>
              <input
                name="websiteUrl"
                type="url"
                placeholder="https://monsite.cd"
                className="w-full border border-sensei-line rounded-xl px-4 py-3 text-sm text-sensei-text bg-sensei-paper placeholder:text-sensei-muted/50 focus:ring-2 focus:ring-sensei-bright/30 focus:border-sensei-bright transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-sensei-text">
                Compte de règlement (mobile money) <span className="text-sensei-danger">*</span>
              </label>
              <input
                name="settlementAccount"
                type="text"
                required
                placeholder="Ex : +243 81 234 5678 (Orange Money)"
                className="w-full border border-sensei-line rounded-xl px-4 py-3 text-sm text-sensei-text bg-sensei-paper placeholder:text-sensei-muted/50 focus:ring-2 focus:ring-sensei-bright/30 focus:border-sensei-bright transition-all"
              />
              <p className="text-xs text-sensei-muted">
                C'est le compte sur lequel vous recevrez le montant net de chaque vente (après
                commission), au comptant et en une fois.
              </p>
            </div>

            <div className="bg-sensei-warn/8 border border-sensei-warn/20 rounded-xl px-4 py-3 text-xs text-sensei-muted">
              Vos clés API seront affichées <strong>une seule fois</strong> après la création.
              Sauvegardez-les immédiatement.
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-sensei-bright text-white font-bold rounded-xl hover:bg-sensei-blue transition-all text-sm"
            >
              Créer mon compte marchand
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
