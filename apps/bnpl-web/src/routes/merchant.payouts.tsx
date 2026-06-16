import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { merchantProfileOptions, merchantPayoutsOptions } from "@sensei/api-client";
import type { MerchantPayout } from "@sensei/api-client";
import { formatCents } from "@sensei/utils";
import { useAuth } from "../auth";
import { supabase } from "../supabase";
import {
  AppContainer,
  Badge,
  Card,
  EmptyState,
  IconWallet,
  PageHeader,
  Spinner,
  cx,
} from "../components";

export const Route = createFileRoute("/merchant/payouts")({
  component: PayoutsPage,
});

type StatusFilter = "all" | "pending" | "succeeded" | "failed";

const STATUS_TONE: Record<string, "bright" | "trust" | "warn" | "muted" | "danger"> = {
  pending: "warn",
  succeeded: "trust",
  failed: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente de compte",
  succeeded: "Réglé",
  failed: "Échoué",
};

const TYPE_LABEL: Record<string, string> = {
  payout: "Versement",
  reversal: "Reprise",
};

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "pending", label: "En attente" },
  { key: "succeeded", label: "Réglés" },
  { key: "failed", label: "Échoués" },
];

function PayoutRow({ p }: { p: MerchantPayout }) {
  const [open, setOpen] = useState(false);
  const commissionPct = (p.commission_bps_snapshot / 100).toFixed(2);

  return (
    <>
      <tr
        className="hover:bg-sensei-paper/60 cursor-pointer transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="px-5 py-3.5">
          <Badge tone={p.type === "reversal" ? "warn" : "bright"}>{TYPE_LABEL[p.type]}</Badge>
        </td>
        <td className="px-4 py-3.5 text-sm text-sensei-text tabular-nums text-right">
          {formatCents(p.gross_amount_cents)}
        </td>
        <td className="px-4 py-3.5 text-sm text-sensei-muted tabular-nums text-right">
          {formatCents(p.commission_cents)}
          <span className="text-xs text-sensei-muted/70"> ({commissionPct} %)</span>
        </td>
        <td className="px-4 py-3.5 text-sm font-bold text-sensei-ink tabular-nums text-right">
          {formatCents(p.net_amount_cents)}
        </td>
        <td className="px-4 py-3.5">
          <Badge tone={STATUS_TONE[p.status] ?? "muted"}>{STATUS_LABEL[p.status] ?? p.status}</Badge>
        </td>
        <td className="px-5 py-3.5 text-xs text-sensei-muted whitespace-nowrap">
          {new Date(p.created_at).toLocaleString("fr-CD", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </td>
      </tr>
      {open && (
        <tr className="bg-sensei-paper/40">
          <td colSpan={6} className="px-5 py-3 text-xs font-mono text-sensei-muted">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              <span className="font-semibold text-sensei-text">ID versement</span>
              <span>{p.id}</span>
              <span className="font-semibold text-sensei-text">Transaction capturée</span>
              <span className="break-all">{p.capture_transaction_id}</span>
              {p.refund_transaction_id && (
                <>
                  <span className="font-semibold text-sensei-text">Remboursement lié</span>
                  <span className="break-all">{p.refund_transaction_id}</span>
                </>
              )}
              {p.settled_at && (
                <>
                  <span className="font-semibold text-sensei-text">Réglé le</span>
                  <span>{new Date(p.settled_at).toLocaleString("fr-CD")}</span>
                </>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function PayoutsPage() {
  const { appUser } = useAuth();
  const userId = appUser?.appUserId ?? "";
  const [filter, setFilter] = useState<StatusFilter>("all");

  const { data: merchant } = useQuery({
    ...merchantProfileOptions(supabase, userId),
    enabled: !!userId,
  });

  const merchantId = merchant?.id ?? "";
  const { data: payouts = [], isLoading } = useQuery({
    ...merchantPayoutsOptions(supabase, merchantId),
    enabled: !!merchantId,
  });

  const filtered = filter === "all" ? payouts : payouts.filter((p) => p.status === filter);

  return (
    <AppContainer className="max-w-5xl">
      <PageHeader
        title="Versements"
        subtitle="Suivi de l'argent qui vous a été réglé après chaque vente."
      />

      {/* Filtres */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cx(
              "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
              filter === key
                ? "bg-sensei-bright text-white"
                : "bg-white border border-sensei-line text-sensei-muted hover:border-sensei-bright/40",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-14">
            <Spinner className="w-5 h-5 text-sensei-bright animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<IconWallet className="w-5 h-5" />}
            title="Aucun versement"
            body={
              filter === "all"
                ? "Vos versements apparaîtront ici dès votre première vente capturée."
                : `Aucun versement avec le statut « ${STATUS_LABEL[filter]} ».`
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-sensei-line bg-sensei-paper/50">
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                    Type
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-sensei-muted text-right">
                    Brut
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-sensei-muted text-right">
                    Commission
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-sensei-muted text-right">
                    Net
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                    Statut
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sensei-line">
                {filtered.map((p) => (
                  <PayoutRow key={p.id} p={p} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {filtered.length > 0 && (
        <p className="text-xs text-sensei-muted text-center mt-4">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          {filter !== "all" ? ` (filtre : ${STATUS_LABEL[filter]})` : ""}
          {" · "}200 maximum
        </p>
      )}
    </AppContainer>
  );
}
