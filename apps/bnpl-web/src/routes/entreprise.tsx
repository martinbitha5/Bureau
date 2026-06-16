import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAudience } from "../audience";
import { IconBolt, IconArrowRight, IconShield, IconTrend, IconWallet } from "../components";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/entreprise")({
  component: EntreprisePage,
});

function EntreprisePage() {
  const { t } = useI18n();
  const { setAudience } = useAudience();

  useEffect(() => {
    setAudience("merchant");
  }, [setAudience]);

  const benefits = [
    { key: "b1", Icon: IconWallet },
    { key: "b2", Icon: IconTrend },
    { key: "b3", Icon: IconShield },
    { key: "b4", Icon: IconBolt },
  ] as const;

  const stats = [
    { key: "stat1" },
    { key: "stat2" },
    { key: "stat3" },
  ] as const;

  const steps = ["1", "2", "3"] as const;

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="text-white py-20 px-6 overflow-hidden relative"
        style={{ background: "linear-gradient(135deg,#0A1B2E,#123A6B)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 80% at 75% 40%, rgba(30,99,196,0.22) 0%, transparent 70%), radial-gradient(40% 55% at 5% 85%, rgba(10,27,46,0.5) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Kicker pill */}
          <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-sensei-bright/80 bg-sensei-bright/10 border border-sensei-bright/20 px-3 py-1.5 rounded-full mb-7">
            {t("biz.kicker")}
          </span>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black leading-[1.06] tracking-tight mb-5 max-w-[18ch]">
            {t("biz.title")}
          </h1>
          <p className="text-lg text-white/65 leading-relaxed mb-9 max-w-[46ch]">
            {t("biz.subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-sensei-bright text-white font-bold rounded-full hover:bg-blue-600 transition-all shadow-lg shadow-sensei-bright/25 text-sm"
            >
              {t("biz.cta")} <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/20 text-white font-semibold rounded-full hover:bg-white/8 transition-all text-sm"
            >
              {t("biz.login")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Benefit cards ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map(({ key, Icon }) => (
              <div
                key={key}
                className="p-6 bg-sensei-paper rounded-2xl border border-sensei-line hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-sensei-bright/10 text-sensei-bright rounded-xl flex items-center justify-center mb-4 group-hover:bg-sensei-bright group-hover:text-white transition-all duration-200">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-[17px] font-bold text-sensei-ink mb-2">
                  {t(`biz.${key}.title`)}
                </h3>
                <p className="text-sensei-muted text-sm leading-relaxed">
                  {t(`biz.${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#EEF4FB] to-white border-t border-sensei-line">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-sensei-ink tracking-tight">
              {t("biz.how.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop only) */}
            <div
              className="hidden md:block absolute h-px bg-sensei-line"
              style={{ top: "24px", left: "calc(33% + 4px)", right: "calc(33% + 4px)" }}
            />
            {steps.map((n) => (
              <div key={n} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-sensei-blue text-white font-bold text-lg flex items-center justify-center mb-4 ring-4 ring-white relative z-10 shadow-sm">
                  {n}
                </div>
                <h3 className="text-[16px] font-bold text-sensei-ink mb-2">
                  {t(`biz.how.${n}.title`)}
                </h3>
                <p className="text-sensei-muted text-sm leading-relaxed">
                  {t(`biz.how.${n}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats band ────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white border-y border-sensei-line">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-sensei-ink tracking-tight">
              {t("biz.stats.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map(({ key }) => (
              <div
                key={key}
                className="text-center bg-sensei-paper rounded-2xl border border-sensei-line px-6 py-8 shadow-sm"
              >
                <p className="text-2xl sm:text-3xl font-black text-sensei-ink tabular-nums mb-2">
                  {t(`biz.${key}.value`)}
                </p>
                <p className="text-sm text-sensei-muted leading-snug">
                  {t(`biz.${key}.label`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-sensei-ink text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("biz.final.title")}
          </h2>
          <p className="text-white/55 mb-8 text-lg leading-relaxed">
            {t("biz.final.body")}
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-sensei-ink font-bold rounded-full hover:bg-sensei-paper transition-all shadow-lg text-sm"
          >
            {t("biz.cta")} <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
