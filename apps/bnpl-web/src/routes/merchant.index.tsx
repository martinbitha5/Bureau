import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  merchantProfileOptions,
  merchantSessionsOptions,
  merchantPayoutsOptions,
  type MerchantCheckoutSession,
  type MerchantProfile,
} from "@sensei/api-client";
import { formatCents } from "@sensei/utils";
import { useAuth } from "../auth";
import { supabase } from "../supabase";
import {
  AppContainer,
  Badge,
  Card,
  cx,
  EmptyState,
  IconCard,
  IconCheck,
  IconReceipt,
  IconTrend,
  IconWallet,
  Money,
  PageHeader,
  Spinner,
  StatCard,
} from "../components";

export const Route = createFileRoute("/merchant/")({
  component: MerchantDashboard,
});

const STATUS_TONE: Record<string, "bright" | "trust" | "warn" | "muted" | "danger"> = {
  pending: "warn",
  authorized: "bright",
  expired: "muted",
  cancelled: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  authorized: "Autorisée",
  expired: "Expirée",
  cancelled: "Annulée",
};

function MerchantDashboard() {
  const { appUser } = useAuth();
  const userId = appUser?.appUserId ?? "";

  const { data: merchant } = useQuery({
    ...merchantProfileOptions(supabase, userId),
    enabled: !!userId,
  });

  const merchantId = merchant?.id ?? "";
  const { data: sessions = [], isLoading } = useQuery({
    ...merchantSessionsOptions(supabase, merchantId),
    enabled: !!merchantId,
  });
  const { data: payouts = [] } = useQuery({
    ...merchantPayoutsOptions(supabase, merchantId),
    enabled: !!merchantId,
  });

  // KPIs
  const total = sessions.length;
  const authorized = sessions.filter((s) => s.status === "authorized").length;
  const approvalRate = total > 0 ? Math.round((authorized / total) * 100) : 0;
  const totalFinanced = sessions
    .filter((s) => s.status === "authorized")
    .reduce((sum, s) => sum + s.amount_cents, 0);

  const succeededPayouts = payouts.filter((p) => p.status === "succeeded");
  const netPaid = succeededPayouts.reduce(
    (sum, p) => sum + (p.type === "reversal" ? -p.net_amount_cents : p.net_amount_cents),
    0,
  );
  const commissionEarned = succeededPayouts.reduce(
    (sum, p) => sum + (p.type === "reversal" ? -p.commission_cents : p.commission_cents),
    0,
  );

  return (
    <AppContainer>
      <PageHeader
        title="Vue d'ensemble"
        subtitle={`Bienvenue, ${merchant?.name ?? "…"}`}
      />

      {merchant && <OnboardingChecklist merchant={merchant} sessions={sessions} />}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <StatCard
          label="Sessions totales"
          value={total}
          icon={<IconReceipt className="w-4 h-4" />}
        />
        <StatCard
          label="Taux d'approbation"
          value={`${approvalRate} %`}
          tone="bright"
          icon={<IconTrend className="w-4 h-4" />}
        />
        <StatCard
          label="Total financé"
          value={<Money cents={totalFinanced} />}
          tone="trust"
          icon={<IconWallet className="w-4 h-4" />}
          hint="sessions autorisées"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard
          label="Net versé"
          value={<Money cents={netPaid} />}
          tone="trust"
          icon={<IconWallet className="w-4 h-4" />}
          hint="reçu par vos comptes de règlement"
        />
        <StatCard
          label="Commission Sensei"
          value={<Money cents={commissionEarned} />}
          icon={<IconCard className="w-4 h-4" />}
          hint="prélevée sur vos ventes capturées"
        />
      </div>

      {/* Sessions récentes */}
      <Card>
        <div className="px-5 py-4 border-b border-sensei-line">
          <p className="text-sm font-bold text-sensei-ink">Sessions récentes</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-14">
            <Spinner className="w-5 h-5 text-sensei-bright animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={<IconReceipt className="w-5 h-5" />}
            title="Aucune session"
            body="Vos premières sessions de paiement apparaîtront ici."
          />
        ) : (
          <div className="divide-y divide-sensei-line">
            {sessions.slice(0, 10).map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3.5 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-sensei-ink truncate">
                    {s.order_ref || s.token.slice(0, 12) + "…"}
                  </p>
                  <p className="text-xs text-sensei-muted mt-0.5">
                    {new Date(s.created_at).toLocaleString("fr-CD", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-sensei-ink tabular-nums">
                    {formatCents(s.amount_cents)}
                  </span>
                  <Badge tone={STATUS_TONE[s.status] ?? "muted"}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AppContainer>
  );
}

// ── Checklist d'accueil ───────────────────────────────────────────────────

function OnboardingChecklist({
  merchant,
  sessions,
}: {
  merchant: MerchantProfile;
  sessions: MerchantCheckoutSession[];
}) {
  const hasSettlementAccount = !!merchant.settlement_account;
  const hasFirstSale = sessions.some((s) => s.status === "authorized");

  const items: { label: string; done: boolean; hint?: ReactNode }[] = [
    { label: "Compte marchand créé", done: true },
    {
      label: "Compte de règlement configuré",
      done: hasSettlementAccount,
      hint: !hasSettlementAccount ? "Contactez le support Sensei pour le configurer." : undefined,
    },
    {
      label: "Première vente confirmée",
      done: hasFirstSale,
      hint: !hasFirstSale ? (
        <Link to="/merchant/terminal" className="font-semibold text-sensei-bright hover:underline">
          Créer une vente avec le terminal virtuel
        </Link>
      ) : undefined,
    },
    {
      label: "Intégrer Sensei Pay à votre site",
      done: false,
      hint: (
        <Link to="/developpeurs" className="font-semibold text-sensei-bright hover:underline">
          Voir la documentation
        </Link>
      ),
    },
  ];

  return (
    <Card className="p-6 mb-6">
      <p className="text-sm font-bold text-sensei-ink mb-4">Premiers pas</p>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <div
              className={cx(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                item.done
                  ? "bg-sensei-trust/15 text-sensei-trust"
                  : "bg-sensei-paper border border-sensei-line",
              )}
            >
              {item.done && <IconCheck className="w-3 h-3" />}
            </div>
            <div>
              <p className={cx("text-sm", item.done ? "text-sensei-ink font-medium" : "text-sensei-text")}>
                {item.label}
              </p>
              {item.hint && <p className="text-xs text-sensei-muted mt-0.5">{item.hint}</p>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
