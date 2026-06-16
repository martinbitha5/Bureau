import { useI18n } from "../i18n";
import { IconCheck, Spinner } from "./icons";
import { Money, cx } from "./ui";

export interface ScheduleInstallment {
  id: string;
  sequence: number;
  amount_cents: number;
  due_date: string;
  status: string;
}

/**
 * Échéancier réutilisable (liste de paiements). Utilisé par le détail de plan et le dashboard.
 * Le bouton « Payer » n'apparaît que sur la PROCHAINE échéance dûe, et seulement si `onPay` est fourni.
 */
export function InstallmentSchedule({
  installments,
  onPay,
  payingId,
  pending,
}: {
  installments: ScheduleInstallment[];
  onPay?: (id: string) => void;
  payingId?: string | null;
  pending?: boolean;
}) {
  const { t, lang } = useI18n();
  const sorted = [...installments].sort((a, b) => a.sequence - b.sequence);
  const nextPayable = sorted.find((i) => i.status !== "paid");

  return (
    <div className="divide-y divide-sensei-line/70">
      {sorted.map((inst) => {
        const isPaid = inst.status === "paid";
        const isNext = nextPayable?.id === inst.id;
        const isPaying = payingId === inst.id;

        return (
          <div
            key={inst.id}
            className={cx("flex items-center justify-between px-5 sm:px-6 py-4", isPaid && "opacity-60")}
          >
            <div className="flex items-center gap-3">
              <div
                className={cx(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                  isPaid
                    ? "bg-sensei-trust/15 text-sensei-trust"
                    : isNext
                    ? "bg-sensei-bright text-white"
                    : "bg-sensei-line text-sensei-muted",
                )}
              >
                {isPaid ? <IconCheck className="w-3.5 h-3.5" /> : inst.sequence}
              </div>
              <div>
                <p className="text-sm font-semibold text-sensei-ink">
                  {t("pdetail.installmentN", { n: String(inst.sequence) })}
                </p>
                <p className="text-xs text-sensei-muted">
                  {t("pdetail.dueOn")} {new Date(inst.due_date).toLocaleDateString(lang)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Money cents={inst.amount_cents} className="font-bold text-sensei-ink" />
              {isPaid ? (
                <span className="text-xs font-semibold text-sensei-trust bg-sensei-trust/10 px-2.5 py-1 rounded-full">
                  {t("pdetail.paid")}
                </span>
              ) : isNext && onPay ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onPay(inst.id)}
                  className="px-4 py-2 bg-sensei-bright text-white text-xs font-bold rounded-full hover:bg-sensei-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm inline-flex items-center gap-1.5"
                >
                  {isPaying ? (
                    <>
                      <Spinner className="w-3 h-3 animate-spin" />
                      {t("pdetail.paying")}
                    </>
                  ) : (
                    t("pay.pay")
                  )}
                </button>
              ) : (
                <span className="text-xs text-sensei-muted w-12 text-right">{t("pdetail.scheduled")}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
