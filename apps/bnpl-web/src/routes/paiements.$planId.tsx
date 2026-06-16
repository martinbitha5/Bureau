import { bnplPlanOptions, payInstallment, queryKeys } from "@sensei/api-client";
import { formatCents } from "@sensei/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../auth";
import {
  AppContainer,
  Badge,
  Card,
  EmptyState,
  IconChevronRight,
  InfoNote,
  InstallmentSchedule,
  PageHeader,
  RequireAuth,
  Spinner,
  SuccessToast,
  cx,
} from "../components";
import { useI18n } from "../i18n";
import { supabase } from "../supabase";

export const Route = createFileRoute("/paiements/$planId")({
  component: () => (
    <RequireAuth>
      <PlanDetailPage />
    </RequireAuth>
  ),
});

// ── Local types ──────────────────────────────────────────────────────────────

interface Installment {
  id: string;
  sequence: number;
  amount_cents: number;
  due_date: string;
  status: string;
}

interface Plan {
  id: string;
  principal_cents: number;
  fee_cents: number;
  total_cents: number;
  installment_count: number;
  status: string;
  created_at: string;
  installments: Installment[];
}

// ── Status badge tone map (mirrors paiements.index.tsx) ─────────────────────

const PLAN_TONE: Record<string, "bright" | "trust" | "danger" | "muted"> = {
  active: "bright",
  completed: "trust",
  defaulted: "danger",
  cancelled: "muted",
};

// ── Page component ───────────────────────────────────────────────────────────

function PlanDetailPage() {
  const { t, lang } = useI18n();
  const { planId } = Route.useParams();
  const { appUser } = useAuth();
  const qc = useQueryClient();
  const userId = appUser?.appUserId ?? "";

  const [toast, setToast] = useState<string | null>(null);
  const [autopay, setAutopay] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────

  const { data, isLoading } = useQuery({
    ...bnplPlanOptions(supabase, planId),
    enabled: !!planId,
  });

  const plan = data as Plan | undefined;

  // ── Mutation ──────────────────────────────────────────────────────────────

  const mutation = useMutation({
    mutationFn: (installmentId: string) => payInstallment(supabase, installmentId),
    onSuccess: (res) => {
      if (res.newScore != null) {
        setToast(t("toast.scoreUp", { score: String(res.newScore) }));
      }
      qc.invalidateQueries({ queryKey: queryKeys.bnplPlan(planId) });
      qc.invalidateQueries({ queryKey: queryKeys.bnplPlans(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.creditProfile(userId) });
    },
  });

  // ── Derived values ────────────────────────────────────────────────────────

  const paidInstallments = plan?.installments.filter((i) => i.status === "paid") ?? [];
  const unpaidInstallments = plan?.installments.filter((i) => i.status !== "paid") ?? [];
  const paidCents = paidInstallments.reduce((acc, i) => acc + i.amount_cents, 0);
  const remainingCents = unpaidInstallments.reduce((acc, i) => acc + i.amount_cents, 0);
  const paidCount = paidInstallments.length;
  const totalCount = plan?.installment_count ?? 0;
  const progressPct = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppContainer>
      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/paiements"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sensei-bright hover:text-sensei-blue transition-colors"
        >
          <IconChevronRight className="w-4 h-4 rotate-180" />
          {t("pdetail.back")}
        </Link>
      </div>

      {/* Toast */}
      {toast && <SuccessToast>{toast}</SuccessToast>}

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="w-6 h-6 text-sensei-bright animate-spin" />
        </div>
      ) : !plan ? (
        <Card>
          <EmptyState title={t("pdetail.notFound")} />
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Page header */}
          <PageHeader
            title={t("pdetail.title")}
            action={
              <Badge tone={PLAN_TONE[plan.status] ?? "muted"}>
                {t(`plan.status.${plan.status}`)}
              </Badge>
            }
          />

          {/* Summary card */}
          <Card as="section">
            <div className="px-5 sm:px-6 py-4 border-b border-sensei-line">
              <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                {t("pdetail.summary")}
              </p>
            </div>

            <div className="divide-y divide-sensei-line/70">
              {/* Principal */}
              <SummaryRow
                label={t("pdetail.principal")}
                value={formatCents(plan.principal_cents)}
              />
              {/* Fees */}
              <SummaryRow
                label={t("pdetail.fees")}
                value={plan.fee_cents === 0 ? t("pdetail.noFees") : formatCents(plan.fee_cents)}
              />
              {/* Total — emphasized */}
              <SummaryRow
                label={t("pdetail.total")}
                value={formatCents(plan.total_cents)}
                emphasized
              />
              {/* Paid so far */}
              <SummaryRow
                label={t("pdetail.paidSoFar")}
                value={formatCents(paidCents)}
                tone="trust"
              />
              {/* Remaining */}
              <SummaryRow
                label={t("pdetail.remaining")}
                value={formatCents(remainingCents)}
                tone="bright"
              />
            </div>

            {/* Progress bar */}
            <div className="px-5 sm:px-6 py-4 bg-sensei-paper border-t border-sensei-line rounded-b-2xl">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-sensei-muted uppercase tracking-wider text-[11px]">
                  {t("pdetail.progress")}
                </span>
                <span className="tabular-nums font-semibold text-sensei-bright">
                  {progressPct}%
                </span>
              </div>
              <div className="h-2 bg-sensei-line rounded-full overflow-hidden">
                <div
                  className={cx(
                    "h-full rounded-full transition-all duration-500",
                    plan.status === "completed" ? "bg-sensei-trust" : "bg-sensei-bright",
                  )}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-sensei-muted mt-2 tabular-nums">
                {t("pay.settled", { paid: String(paidCount), total: String(totalCount) })}
              </p>
            </div>
          </Card>

          {/* Schedule card */}
          <Card as="section">
            <div className="px-5 sm:px-6 py-4 border-b border-sensei-line">
              <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                {t("pdetail.schedule")}
              </p>
            </div>
            <InstallmentSchedule
              installments={plan.installments}
              onPay={(id) => mutation.mutate(id)}
              payingId={mutation.variables ?? null}
              pending={mutation.isPending}
            />
          </Card>

          {/* Autopay card */}
          <Card as="section">
            <div className="px-5 sm:px-6 py-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sensei-ink text-[15px] mb-1">
                  {t("pdetail.autopay")}
                </p>
                <p className="text-sm text-sensei-muted leading-relaxed">
                  {t("pdetail.autopayDesc")}
                </p>
                <p
                  className={cx(
                    "text-xs font-bold mt-2 uppercase tracking-wider",
                    autopay ? "text-sensei-trust" : "text-sensei-muted",
                  )}
                >
                  {autopay ? t("pdetail.autopayOn") : t("pdetail.autopayOff")}
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={autopay}
                onClick={() => setAutopay((v) => !v)}
                className={cx(
                  "relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sensei-bright focus-visible:ring-offset-2",
                  autopay ? "bg-sensei-trust" : "bg-sensei-line",
                )}
              >
                <span
                  className={cx(
                    "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200",
                    autopay ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>
          </Card>

          {/* Transparency note */}
          <InfoNote>{t("pdetail.transparency")}</InfoNote>
        </div>
      )}
    </AppContainer>
  );
}

// ── Sub-component: summary row ───────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  emphasized,
  tone,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  tone?: "trust" | "bright";
}) {
  return (
    <div
      className={cx(
        "flex items-center justify-between px-5 sm:px-6 py-3.5 gap-4",
        emphasized && "bg-sensei-paper",
      )}
    >
      <span
        className={cx(
          "text-sm",
          emphasized ? "font-bold text-sensei-ink" : "text-sensei-muted",
        )}
      >
        {label}
      </span>
      <span
        className={cx(
          "tabular-nums font-bold text-right",
          emphasized
            ? "text-sensei-ink text-base"
            : tone === "trust"
            ? "text-sensei-trust text-sm"
            : tone === "bright"
            ? "text-sensei-bright text-sm"
            : "text-sensei-ink text-sm",
        )}
      >
        {value}
      </span>
    </div>
  );
}
