import { formatCents } from "@sensei/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IconCheck, IconChevronRight, IconGauge, IconPlane, IconStore, cx } from "../components";
import {
  IllusApply,
  IllusClear,
  IllusNoFees,
  MockCheckout,
  MockPlans,
  MockSchedule,
} from "../components/illustrations";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/comment-ca-marche")({
  component: CommentCaMarchePage,
});

const STEP_ROWS = [
  { key: "s1", Mock: MockCheckout, tint: "#EAF0FC" },
  { key: "s2", Mock: MockPlans, tint: "#E7F5EE" },
  { key: "s3", Mock: MockSchedule, tint: "#FBF1E2" },
] as const;

const FEATURES = [
  { key: "transparency", Illus: IllusClear },
  { key: "noFees", Illus: IllusNoFees },
  { key: "scoreLink", Illus: IllusApply },
] as const;

const CHOICES = [
  { key: "a", count: 3 },
  { key: "b", count: 4 },
] as const;

const TABLE_ROWS = [
  { amount: 18000, monthly: 6000, count: 3 },
  { amount: 50000, monthly: 12500, count: 4 },
];

const WHERE = [
  { key: "1", Icon: IconStore },
  { key: "2", Icon: IconPlane },
  { key: "3", Icon: IconGauge },
] as const;

const FAQ_KEYS = ["1", "2", "3", "5"] as const;

export function CommentCaMarchePage() {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#EEF2FB] to-white py-20 sm:py-28 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-[12px] font-semibold text-sensei-bright bg-white border border-sensei-line px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
            {t("ccm.kicker")}
          </span>
          <h1 className="text-5xl sm:text-6xl font-medium text-sensei-ink leading-[1.03] tracking-[-0.02em] mb-6">
            {t("ccm.title")}
          </h1>
          <p className="text-lg sm:text-xl text-sensei-muted leading-relaxed max-w-[50ch] mx-auto">
            {t("ccm.subtitle")}
          </p>
        </div>
      </section>

      {/* Le choix vous appartient */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-[40px] font-semibold text-sensei-ink tracking-tight text-center mb-14">
            {t("ccm.choice.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CHOICES.map((c) => (
              <div key={c.key} className="bg-white border border-sensei-line rounded-3xl shadow-sm p-7">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-sensei-ink">{t(`ccm.choice.${c.key}.title`)}</h3>
                  <span className="text-sm font-bold text-sensei-bright bg-sensei-bright/10 rounded-full px-3 py-1 tabular-nums">
                    {c.count}×
                  </span>
                </div>
                <p className="text-sensei-muted mb-5">{t(`ccm.choice.${c.key}.body`)}</p>
                <ul className="flex flex-col gap-3">
                  {["1", "2", "3"].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-sensei-text">
                      <span className="text-sensei-trust mt-0.5 flex-shrink-0">
                        <IconCheck className="w-4 h-4" />
                      </span>
                      {t(`ccm.choice.${c.key}.${b}`)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Étapes avec maquettes */}
      <section className="py-20 px-6 bg-sensei-paper border-y border-sensei-line">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-[40px] font-semibold text-sensei-ink tracking-tight text-center mb-16">
            {t("steps.title")}
          </h2>
          <div className="flex flex-col gap-16 lg:gap-20">
            {STEP_ROWS.map((row, i) => {
              const Mock = row.Mock;
              const even = i % 2 === 0;
              return (
                <div key={row.key} className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                  <div className={cx("order-2", even ? "lg:order-1" : "lg:order-2")}>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-sensei-bright mb-3">
                      {t("steps.tab")} {i + 1}
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-semibold text-sensei-ink mb-4 tracking-tight">
                      {t(`steps.${row.key}.title`)}
                    </h3>
                    <p className="text-sensei-muted text-lg leading-relaxed max-w-[44ch]">
                      {t(`steps.${row.key}.body`)}
                    </p>
                  </div>
                  <div className={cx("order-1", even ? "lg:order-2" : "lg:order-1")}>
                    <div
                      className="rounded-[2rem] py-12 px-6 flex items-center justify-center min-h-[400px]"
                      style={{ background: row.tint }}
                    >
                      <Mock />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blocs avec illustrations */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {FEATURES.map(({ key, Illus }) => (
            <div key={key} className="flex flex-col items-center text-center">
              <div className="mb-5">
                <Illus />
              </div>
              <h3 className="text-lg font-semibold text-sensei-ink mb-2">{t(`ccm.${key}.title`)}</h3>
              <p className="text-sensei-muted text-[15px] leading-relaxed max-w-[34ch]">
                {t(`ccm.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tableau de conditions */}
      <section className="py-20 px-6 bg-sensei-paper border-y border-sensei-line">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-sensei-ink tracking-tight text-center mb-10">
            {t("ccm.table.title")}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-sensei-line bg-white">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-sensei-paper text-sensei-muted text-[11px] font-bold uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5">{t("ccm.table.amount")}</th>
                  <th className="text-right px-5 py-3.5">{t("ccm.table.monthly")}</th>
                  <th className="text-right px-5 py-3.5">{t("ccm.table.count")}</th>
                  <th className="text-right px-5 py-3.5">{t("ccm.table.interest")}</th>
                  <th className="text-right px-5 py-3.5">{t("ccm.table.fees")}</th>
                  <th className="text-right px-5 py-3.5">{t("ccm.table.total")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sensei-line">
                {TABLE_ROWS.map((r) => (
                  <tr key={r.amount} className="text-sensei-text tabular-nums">
                    <td className="px-5 py-4 font-semibold text-sensei-ink">{formatCents(r.amount)}</td>
                    <td className="px-5 py-4 text-right">{formatCents(r.monthly)}</td>
                    <td className="px-5 py-4 text-right">{r.count}</td>
                    <td className="px-5 py-4 text-right text-sensei-trust">{formatCents(0)}</td>
                    <td className="px-5 py-4 text-right text-sensei-trust">{formatCents(0)}</td>
                    <td className="px-5 py-4 text-right font-semibold text-sensei-ink">{formatCents(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-sensei-muted mt-4 text-center max-w-[60ch] mx-auto">{t("ccm.table.note")}</p>
        </div>
      </section>

      {/* Utiliser Sensei Pay */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-[40px] font-semibold text-sensei-ink tracking-tight text-center mb-14">
            {t("ccm.where.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {WHERE.map(({ key, Icon }) => (
              <div key={key} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-sensei-bright/10 text-sensei-bright flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-sensei-ink mb-2">{t(`ccm.where.${key}.title`)}</h3>
                <p className="text-sensei-muted text-[15px] leading-relaxed max-w-[34ch] mx-auto">
                  {t(`ccm.where.${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-sensei-paper border-t border-sensei-line">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-[40px] font-semibold text-sensei-ink tracking-tight mb-3">
              {t("ccm.faqTitle")}
            </h2>
            <p className="text-sensei-muted text-lg">{t("ccm.help.body")}</p>
          </div>
          <div className="flex flex-col gap-3">
            {FAQ_KEYS.map((n) => {
              const isOpen = openFaq === n;
              return (
                <div key={n} className="border border-sensei-line rounded-2xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : n)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-sensei-ink text-[15px]">{t(`faq.q${n}`)}</span>
                    <IconChevronRight
                      className={cx("w-5 h-5 text-sensei-muted flex-shrink-0 transition-transform", isOpen && "rotate-90")}
                    />
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-5 -mt-1 text-sensei-muted text-sm leading-relaxed">{t(`faq.a${n}`)}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
