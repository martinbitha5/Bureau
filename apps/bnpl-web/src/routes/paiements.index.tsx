import { bnplPlansOptions, payInstallment, queryKeys } from "@sensei/api-client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../auth";
import {
  AppContainer,
  Badge,
  Card,
  EmptyState,
  IconArrowRight,
  IconChevronRight,
  IconWallet,
  InstallmentSchedule,
  Money,
  PageHeader,
  RequireAuth,
  Spinner,
  SuccessToast,
  cx,
} from "../components";
import { useI18n } from "../i18n";
import { supabase } from "../supabase";

export const Route = createFileRoute("/paiements/")({
  component: () => (
    <RequireAuth>
      <PaiementsPage />
    </RequireAuth>
  ),
});

interface Installment {
  id: string;
  sequence: number;
  amount_cents: number;
  due_date: string;
  status: string;
}
interface Plan {
  id: string;
  total_cents: number;
  installment_count: number;
  status: string;
  installments: Installment[];
}

const PLAN_TONE: Record<string, "bright" | "trust" | "danger" | "muted"> = {
  active: "bright",
  completed: "trust",
  defaulted: "danger",
  cancelled: "muted",
};

function PaiementsPage() {
  const { t } = useI18n();
  const { appUser } = useAuth();
  const qc = useQueryClient();
  const userId = appUser?.appUserId ?? "";
  const score = appUser?.score;
  const [toast, setToast] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ ...bnplPlansOptions(supabase, userId), enabled: !!userId });
  const plans = (data ?? []) as unknown as Plan[];

  const mutation = useMutation({
    mutationFn: (installmentId: string) => payInstallment(supabase, installmentId),
    onSuccess: (res) => {
      if (res.newScore != null) setToast(t("toast.scoreUp", { score: String(res.newScore) }));
      qc.invalidateQueries({ queryKey: queryKeys.bnplPlans(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.creditProfile(userId) });
    },
  });

  const paidCount = plans.reduce((acc, p) => acc + p.installments.filter((i) => i.status === "paid").length, 0);
  const totalCount = plans.reduce((acc, p) => acc + p.installments.length, 0);

  return (
    <AppContainer>
      <PageHeader
        title={t("pay.title")}
        subtitle={totalCount > 0 ? t("pay.settled", { paid: String(paidCount), total: String(totalCount) }) : t("pay.subtitle")}
        action={
          score != null ? (
            <div className="flex flex-col items-center bg-white border border-sensei-line rounded-2xl px-5 py-3 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted mb-0.5">
                {t("pay.scoreNow")}
              </span>
              <span className="text-2xl font-black text-sensei-bright tabular-nums">{score}</span>
              <span className="text-[10px] text-sensei-muted">/ 850</span>
            </div>
          ) : undefined
        }
      />

      {toast && <SuccessToast>{toast}</SuccessToast>}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="w-6 h-6 text-sensei-bright animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconWallet className="w-7 h-7" />}
            title={t("pay.empty")}
            body={t("pay.emptyBody")}
            action={
              <Link
                to="/eligibilite"
                className="inline-flex items-center gap-2 px-5 py-3 bg-sensei-bright text-white font-bold rounded-xl hover:bg-sensei-blue transition-all shadow-sm text-sm"
              >
                {t("dash.empty.cta")} <IconArrowRight className="w-4 h-4" />
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {plans.map((plan) => {
            const paid = plan.installments.filter((i) => i.status === "paid").length;
            const pct = Math.round((paid / plan.installments.length) * 100);
            return (
              <Card key={plan.id} className="overflow-hidden">
                <div className="px-5 sm:px-6 py-5 border-b border-sensei-line flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted mb-1">
                      {t("pay.title")}
                    </p>
                    <Money cents={plan.total_cents} className="text-xl font-black text-sensei-ink" />
                  </div>
                  <Badge tone={PLAN_TONE[plan.status] ?? "muted"}>{t(`plan.status.${plan.status}`)}</Badge>
                </div>

                <div className="px-5 sm:px-6 py-3 bg-sensei-paper border-b border-sensei-line">
                  <div className="flex items-center justify-between text-xs text-sensei-muted mb-2">
                    <span>{t("pay.settled", { paid: String(paid), total: String(plan.installments.length) })}</span>
                    <span className="font-semibold text-sensei-bright">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-sensei-line rounded-full overflow-hidden">
                    <div
                      className={cx("h-full rounded-full transition-all duration-500", plan.status === "completed" ? "bg-sensei-trust" : "bg-sensei-bright")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <InstallmentSchedule
                  installments={plan.installments}
                  onPay={(id) => mutation.mutate(id)}
                  payingId={mutation.variables ?? null}
                  pending={mutation.isPending}
                />

                <div className="px-5 sm:px-6 py-3 border-t border-sensei-line bg-white">
                  <Link
                    to="/paiements/$planId"
                    params={{ planId: plan.id }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-sensei-bright hover:text-sensei-blue"
                  >
                    {t("pay.viewDetail")} <IconChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppContainer>
  );
}
