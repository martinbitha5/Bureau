import { bnplPlansOptions, payInstallment, queryKeys } from "@sensei/api-client";
import { maxPrincipalForScore } from "@sensei/payments";
import { formatCents } from "@sensei/utils";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../auth";
import {
  AppContainer,
  Badge,
  Card,
  EmptyState,
  IconArrowRight,
  IconCalendar,
  IconChevronRight,
  IconReceipt,
  IconSparkles,
  IconWallet,
  Money,
  ScoreGauge,
  Spinner,
  StatCard,
  SuccessToast,
  cx,
} from "../components";
import { useI18n } from "../i18n";
import { supabase } from "../supabase";

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
  principal_cents: number;
  installment_count: number;
  status: string;
  created_at: string;
  installments: Installment[];
}

const PLAN_TONE: Record<string, "bright" | "trust" | "danger" | "muted"> = {
  active: "bright",
  completed: "trust",
  defaulted: "danger",
  cancelled: "muted",
};

export function Dashboard() {
  const { t, lang } = useI18n();
  const { appUser } = useAuth();
  const qc = useQueryClient();
  const userId = appUser?.appUserId ?? "";
  const score = appUser?.score ?? 600;
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

  // Agrégats
  const activePlans = plans.filter((p) => p.status === "active");
  const allInstallments = plans.flatMap((p) => p.installments);
  const unpaid = allInstallments.filter((i) => i.status !== "paid");
  const totalRemaining = unpaid.reduce((acc, i) => acc + i.amount_cents, 0);
  const nextPayment = [...unpaid].sort((a, b) => a.due_date.localeCompare(b.due_date))[0] ?? null;
  const limit = maxPrincipalForScore(score);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-6 h-6 text-sensei-bright animate-spin" />
      </div>
    );
  }

  return (
    <AppContainer>
      {/* En-tête */}
      <div className="mb-7">
        <h1 className="text-2xl sm:text-[28px] font-bold text-sensei-ink tracking-tight">
          {appUser?.fullName
            ? t("dash.greeting", { name: appUser.fullName.split(" ")[0] ?? appUser.fullName })
            : t("dash.greetingPlain")}
        </h1>
        <p className="text-sensei-muted mt-1.5 text-sm sm:text-[15px]">{t("dash.subtitle")}</p>
      </div>

      {toast && <SuccessToast>{toast}</SuccessToast>}

      {/* Prochaine échéance (héros) */}
      <Card className="overflow-hidden mb-5">
        <div className="bg-sensei-ink text-white px-6 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5 flex items-center gap-1.5">
                <IconCalendar className="w-3.5 h-3.5" /> {t("dash.nextPayment")}
              </p>
              {nextPayment ? (
                <>
                  <p className="text-3xl font-black tabular-nums">{formatCents(nextPayment.amount_cents)}</p>
                  <p className="text-sm text-white/60 mt-1">
                    {t("dash.dueOn")} {new Date(nextPayment.due_date).toLocaleDateString(lang)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold">{t("dash.noNext")}</p>
                  <p className="text-sm text-white/60 mt-1">{t("dash.allSettled")}</p>
                </>
              )}
            </div>
            {nextPayment && (
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(nextPayment.id)}
                className="px-5 py-3 bg-sensei-bright text-white font-bold rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all shadow-lg shadow-sensei-bright/20 text-sm inline-flex items-center gap-2"
              >
                {mutation.isPending ? <Spinner className="w-4 h-4 animate-spin" /> : null}
                {t("dash.payNow")}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Cartes stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <StatCard
          label={t("dash.totalOwed")}
          value={<Money cents={totalRemaining} />}
          hint={t("dash.totalOwedSub")}
          icon={<IconReceipt className="w-4 h-4" />}
          tone="ink"
        />
        <StatCard
          label={t("dash.activePlans")}
          value={activePlans.length}
          hint={t("dash.activePlansSub")}
          icon={<IconWallet className="w-4 h-4" />}
          tone="bright"
        />
        <Link to="/score" className="block group">
          <Card className="p-5 h-full group-hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                {t("dash.scoreTitle")}
              </p>
              <IconChevronRight className="w-4 h-4 text-sensei-muted/60 group-hover:text-sensei-bright transition-colors" />
            </div>
            <p className="text-2xl font-black tabular-nums text-sensei-ink">{score}</p>
            <p className="text-xs text-sensei-muted mt-1">{t("dash.scoreSub")}</p>
          </Card>
        </Link>
      </div>

      {/* Bannière préqualification */}
      <Card className="mb-7 p-5 flex items-center justify-between gap-4 flex-wrap bg-gradient-to-br from-[#EEF4FB] to-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sensei-bright/10 text-sensei-bright flex items-center justify-center flex-shrink-0">
            <IconSparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
              {t("dash.eligibility")}
            </p>
            <p className="text-xl font-black text-sensei-ink tabular-nums">{formatCents(limit)}</p>
            <p className="text-xs text-sensei-muted">{t("dash.eligibilitySub")}</p>
          </div>
        </div>
        <Link
          to="/eligibilite"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-sensei-line text-sensei-text font-semibold rounded-xl hover:border-sensei-bright hover:text-sensei-bright transition-all text-sm"
        >
          {t("dash.estimate")} <IconArrowRight className="w-4 h-4" />
        </Link>
      </Card>

      {/* Liste des plans / état vide */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-sensei-ink">{t("dash.plansTitle")}</h2>
        {plans.length > 0 && (
          <Link to="/paiements" className="text-sm font-semibold text-sensei-bright hover:text-sensei-blue">
            {t("common.viewAll")}
          </Link>
        )}
      </div>

      {plans.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconWallet className="w-7 h-7" />}
            title={t("dash.empty.title")}
            body={t("dash.empty.body")}
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
        <div className="flex flex-col gap-3">
          {plans.slice(0, 4).map((plan) => {
            const paid = plan.installments.filter((i) => i.status === "paid").length;
            const pct = Math.round((paid / plan.installments.length) * 100);
            return (
              <Link key={plan.id} to="/paiements/$planId" params={{ planId: plan.id }} className="block group">
                <Card className="p-5 group-hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Money cents={plan.total_cents} className="text-lg font-black text-sensei-ink" />
                        <Badge tone={PLAN_TONE[plan.status] ?? "muted"}>{t(`plan.status.${plan.status}`)}</Badge>
                      </div>
                      <p className="text-xs text-sensei-muted">
                        {t("pay.settled", { paid: String(paid), total: String(plan.installments.length) })}
                      </p>
                      <div className="h-1.5 bg-sensei-line rounded-full overflow-hidden mt-2 w-44 max-w-full">
                        <div
                          className={cx(
                            "h-full rounded-full transition-all",
                            plan.status === "completed" ? "bg-sensei-trust" : "bg-sensei-bright",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <IconChevronRight className="w-5 h-5 text-sensei-muted/50 group-hover:text-sensei-bright transition-colors flex-shrink-0" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Aperçu score (pédagogie) */}
      <Card className="mt-7 p-6 flex flex-col sm:flex-row items-center gap-6">
        <ScoreGauge score={score} size={180} />
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-bold text-sensei-ink mb-1">{t("dash.scoreTitle")}</h3>
          <p className="text-sm text-sensei-muted mb-4 max-w-[40ch]">{t("score.transparency")}</p>
          <Link
            to="/score"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sensei-bright hover:text-sensei-blue"
          >
            {t("dash.viewScore")} <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Card>
    </AppContainer>
  );
}
