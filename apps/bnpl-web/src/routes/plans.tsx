import { bnplPlansOptions, creditProfileOptions, payInstallment, queryKeys } from "@sensei/api-client";
import { formatCents } from "@sensei/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../auth";
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
  installment_count: number;
  status: string;
  installments: Installment[];
}

export function PlansPage() {
  const { t, lang } = useI18n();
  const { session, appUser, loading } = useAuth();
  const qc = useQueryClient();
  const userId = appUser?.appUserId ?? "";
  const [toast, setToast] = useState<string | null>(null);

  const { data: plans } = useQuery({ ...bnplPlansOptions(supabase, userId), enabled: !!userId });
  const { data: profile } = useQuery({ ...creditProfileOptions(supabase, userId), enabled: !!userId });

  const mutation = useMutation({
    mutationFn: (installmentId: string) => payInstallment(supabase, installmentId),
    onSuccess: (res) => {
      if (res.newScore != null) setToast(t("toast.scoreUp", { score: String(res.newScore) }));
      qc.invalidateQueries({ queryKey: queryKeys.bnplPlans(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.creditProfile(userId) });
    },
  });

  if (loading) return <p className="muted">{t("pay.loading")}</p>;
  if (!session) {
    return (
      <section className="empty-state">
        <p className="muted">{t("auth.required")}</p>
        <Link to="/login" className="btn-primary">
          {t("auth.login")}
        </Link>
      </section>
    );
  }

  const typedPlans = (plans ?? []) as unknown as Plan[];
  const score = (profile?.current_score as number) ?? appUser?.score;

  return (
    <section className="page">
      <div className="page-head">
        <h2 className="page-title">{t("pay.title")}</h2>
        {score != null && (
          <div className="score-pill">
            {t("pay.scoreNow")} <strong>{score}</strong>
          </div>
        )}
      </div>

      {toast && <p className="confirmed">{toast}</p>}

      {typedPlans.length === 0 && <p className="muted">{t("pay.empty")}</p>}

      {typedPlans.map((plan) => {
        const installments = [...plan.installments].sort((a, b) => a.sequence - b.sequence);
        const nextPayable = installments.find((i) => i.status !== "paid");
        return (
          <div key={plan.id} className="plan-card">
            <div className="plan-head">
              <strong>{formatCents(plan.total_cents)}</strong>
              <span className={`status-chip status-${plan.status}`}>
                {t(`plan.status.${plan.status}`)}
              </span>
            </div>
            <ul className="inst-list">
              {installments.map((inst) => {
                const isPaid = inst.status === "paid";
                const isNext = nextPayable?.id === inst.id;
                const isPaying = mutation.isPending && mutation.variables === inst.id;
                return (
                  <li key={inst.id} className="inst-row">
                    <div>
                      <div className="inst-label">
                        {t("pay.installment")} {inst.sequence}
                      </div>
                      <div className="muted small">
                        {t("pay.dueOn")} {new Date(inst.due_date).toLocaleDateString(lang)}
                      </div>
                    </div>
                    <div className="inst-right">
                      <span className="inst-amount">{formatCents(inst.amount_cents)}</span>
                      {isPaid ? (
                        <span className="paid-badge">✓ {t("pay.paid")}</span>
                      ) : isNext ? (
                        <button
                          type="button"
                          className="btn-primary small"
                          disabled={mutation.isPending}
                          onClick={() => mutation.mutate(inst.id)}
                        >
                          {isPaying ? t("pay.paying") : t("pay.pay")}
                        </button>
                      ) : (
                        <span className="muted small">—</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
