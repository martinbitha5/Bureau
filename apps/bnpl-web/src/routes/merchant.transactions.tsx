import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { merchantProfileOptions, merchantSessionsOptions } from "@sensei/api-client";
import type { MerchantCheckoutSession } from "@sensei/api-client";
import { formatCents } from "@sensei/utils";
import { useAuth } from "../auth";
import { supabase } from "../supabase";
import {
  AppContainer,
  Badge,
  Card,
  EmptyState,
  IconReceipt,
  PageHeader,
  Spinner,
  cx,
} from "../components";

export const Route = createFileRoute("/merchant/transactions")({
  component: TransactionsPage,
});

type StatusFilter = "all" | "pending" | "authorized" | "expired" | "cancelled";

const TONE: Record<string, "bright" | "trust" | "warn" | "muted" | "danger"> = {
  pending: "warn",
  authorized: "bright",
  expired: "muted",
  cancelled: "danger",
};

const LABEL: Record<string, string> = {
  pending: "En attente",
  authorized: "Autorisée",
  expired: "Expirée",
  cancelled: "Annulée",
};

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "authorized", label: "Autorisées" },
  { key: "expired", label: "Expirées" },
  { key: "cancelled", label: "Annulées" },
];

function SessionRow({ s }: { s: MerchantCheckoutSession }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-sensei-paper/60 cursor-pointer transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="px-5 py-3.5 text-sm font-mono text-sensei-muted truncate max-w-[140px]">
          {s.token.slice(0, 12)}…
        </td>
        <td className="px-4 py-3.5 text-sm text-sensei-text truncate max-w-[160px]">
          {s.order_ref || "—"}
        </td>
        <td className="px-4 py-3.5 text-sm font-bold text-sensei-ink tabular-nums text-right">
          {formatCents(s.amount_cents)}
        </td>
        <td className="px-4 py-3.5">
          <Badge tone={TONE[s.status] ?? "muted"}>{LABEL[s.status] ?? s.status}</Badge>
        </td>
        <td className="px-5 py-3.5 text-xs text-sensei-muted whitespace-nowrap">
          {new Date(s.created_at).toLocaleString("fr-CD", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </td>
      </tr>
      {open && (
        <tr className="bg-sensei-paper/40">
          <td colSpan={5} className="px-5 py-3 text-xs font-mono text-sensei-muted">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              <span className="font-semibold text-sensei-text">ID session</span>
              <span>{s.id}</span>
              <span className="font-semibold text-sensei-text">Token complet</span>
              <span className="break-all">{s.token}</span>
              <span className="font-semibold text-sensei-text">Expire le</span>
              <span>
                {new Date(s.expires_at).toLocaleString("fr-CD")}
              </span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function TransactionsPage() {
  const { appUser } = useAuth();
  const userId = appUser?.appUserId ?? "";
  const [filter, setFilter] = useState<StatusFilter>("all");

  const { data: merchant } = useQuery({
    ...merchantProfileOptions(supabase, userId),
    enabled: !!userId,
  });

  const merchantId = merchant?.id ?? "";
  const { data: sessions = [], isLoading } = useQuery({
    ...merchantSessionsOptions(supabase, merchantId),
    enabled: !!merchantId,
  });

  const filtered =
    filter === "all" ? sessions : sessions.filter((s) => s.status === filter);

  return (
    <AppContainer className="max-w-5xl">
      <PageHeader
        title="Transactions"
        subtitle={`${sessions.length} session${sessions.length !== 1 ? "s" : ""} au total`}
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
            icon={<IconReceipt className="w-5 h-5" />}
            title="Aucune transaction"
            body={
              filter === "all"
                ? "Vos premières sessions de paiement apparaîtront ici."
                : `Aucune session avec le statut « ${LABEL[filter]} ».`
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-sensei-line bg-sensei-paper/50">
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                    Token
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                    Commande
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-sensei-muted text-right">
                    Montant
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
                {filtered.map((s) => (
                  <SessionRow key={s.id} s={s} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {filtered.length > 0 && (
        <p className="text-xs text-sensei-muted text-center mt-4">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          {filter !== "all" ? ` (filtre : ${LABEL[filter]})` : ""}
          {" · "}200 maximum
        </p>
      )}
    </AppContainer>
  );
}
