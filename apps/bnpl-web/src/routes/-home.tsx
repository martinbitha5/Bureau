import { formatCents } from "@sensei/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAudience } from "../audience";
import { useAuth } from "../auth";
import {
  IconBolt,
  IconBuilding,
  IconCard,
  IconCheck,
  IconChevronRight,
  IconClipboard,
  IconPhone,
  IconPlane,
  IconReceipt,
  IconShield,
  IconStore,
  Spinner,
  cx,
} from "../components";
import {
  IllusApply,
  IllusClear,
  IllusNoFees,
  MockCheckout,
  MockPlans,
  MockSchedule,
} from "../components/illustrations";
import { useI18n } from "../i18n";
import { Dashboard } from "./-dashboard";

export function HomePage() {
  const { session, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session && role === "merchant") {
      navigate({ to: "/merchant" });
    }
  }, [loading, session, role, navigate]);

  if (loading || (session && role === "merchant")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-6 h-6 text-sensei-bright animate-spin" />
      </div>
    );
  }

  if (session) return <Dashboard />;

  return <Landing />;
}

// ── Marchands partenaires ──────────────────────────────────────────────

interface Merchant {
  key: string;
  name?: string;
  Icon: typeof IconPlane;
  color: string;
  live?: boolean;
}

const MERCHANTS: Merchant[] = [
  { key: "flights", name: "Sensei Flights", Icon: IconPlane, color: "#1E63C4", live: true },
  { key: "electronics", Icon: IconCard, color: "#1E8E5A" },
  { key: "appliances", Icon: IconReceipt, color: "#C9852A" },
  { key: "phones", Icon: IconPhone, color: "#123A6B" },
  { key: "fashion", Icon: IconStore, color: "#B3271E" },
  { key: "furniture", Icon: IconBuilding, color: "#5B6B7B" },
  { key: "school", Icon: IconClipboard, color: "#1E63C4" },
  { key: "autoparts", Icon: IconBolt, color: "#0A1B2E" },
  { key: "grocery", Icon: IconStore, color: "#1E8E5A" },
  { key: "health", Icon: IconShield, color: "#123A6B" },
];

function MerchantCard({ m }: { m: Merchant }) {
  const { t } = useI18n();
  const label = m.live && m.name ? m.name : t(`shop.cat.${m.key}`);
  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-sensei-line hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Zone visuelle (dégradé + filigrane icône) */}
      <div
        className="relative h-28"
        style={{ background: `linear-gradient(135deg, ${m.color} 0%, ${m.color}b3 100%)` }}
      >
        <m.Icon className="absolute right-3 top-3 w-14 h-14 text-white/20" />
        {/* Pastille « logo » qui chevauche */}
        <div
          className="absolute -bottom-5 left-4 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center ring-1 ring-black/5"
          style={{ color: m.color }}
        >
          <m.Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="pt-7 pb-4 px-4">
        <p className="font-bold text-sensei-ink text-sm leading-tight">{label}</p>
        {m.live ? (
          <p className="text-[11px] text-sensei-trust font-semibold mt-1">
            {t("shop.live")} · {t("shop.noFees")}
          </p>
        ) : (
          <p className="text-[11px] text-sensei-muted mt-1">{t("shop.soon")}</p>
        )}
      </div>
    </div>
  );
}

// ── Carrousel d'étapes ─────────────────────────────────────────────────

const STEPS = [
  { Mock: MockCheckout, tint: "#EAF0FC" },
  { Mock: MockPlans, tint: "#E7F5EE" },
  { Mock: MockSchedule, tint: "#FBF1E2" },
];

function StepsCarousel() {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const step = STEPS[i]!;
  const Mock = step.Mock;

  return (
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl sm:text-[40px] font-semibold text-sensei-ink tracking-tight text-center mb-14">
        {t("steps.title")}
      </h2>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Texte */}
        <div className="order-2 lg:order-1">
          <div className="flex items-center gap-6 border-b border-sensei-line mb-7">
            {[0, 1, 2].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setI(n)}
                className={cx(
                  "pb-3 -mb-px text-sm font-semibold border-b-2 transition-colors",
                  n === i ? "border-sensei-ink text-sensei-ink" : "border-transparent text-sensei-muted hover:text-sensei-text",
                )}
              >
                {t("steps.tab")} {n + 1}
              </button>
            ))}
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold text-sensei-ink mb-4 tracking-tight">
            {t(`steps.s${i + 1}.title`)}
          </h3>
          <p className="text-sensei-muted text-lg leading-relaxed mb-8 max-w-[44ch]">
            {t(`steps.s${i + 1}.body`)}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/eligibilite"
              className="px-6 py-3 bg-sensei-bright text-white font-semibold rounded-full hover:bg-sensei-blue transition-all shadow-sm text-sm"
            >
              {t("steps.cta")}
            </Link>
            <Link
              to="/comment-ca-marche"
              className="px-6 py-3 border border-sensei-line text-sensei-text font-semibold rounded-full hover:border-sensei-ink transition-all text-sm"
            >
              {t("steps.learnMore")}
            </Link>
          </div>
        </div>

        {/* Visuel */}
        <div className="order-1 lg:order-2 relative">
          <div
            className="rounded-[2rem] py-12 px-6 flex items-center justify-center min-h-[420px]"
            style={{ background: step.tint }}
          >
            <Mock />
          </div>
          {/* Flèches */}
          <button
            type="button"
            onClick={() => setI((i + 2) % 3)}
            aria-label="prev"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-sensei-line flex items-center justify-center text-sensei-text hover:text-sensei-bright transition-colors"
          >
            <IconChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => setI((i + 1) % 3)}
            aria-label="next"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-sensei-line flex items-center justify-center text-sensei-text hover:text-sensei-bright transition-colors"
          >
            <IconChevronRight className="w-5 h-5" />
          </button>
          {/* Points */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[0, 1, 2].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setI(n)}
                aria-label={`step ${n + 1}`}
                className={cx("h-2 rounded-full transition-all", n === i ? "w-6 bg-sensei-ink" : "w-2 bg-sensei-line")}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Landing acheteur ───────────────────────────────────────────────────

function Landing() {
  const { t } = useI18n();
  const { setAudience } = useAudience();

  useEffect(() => setAudience("buyer"), [setAudience]);

  const love = [
    { k: "1", Illus: IllusApply },
    { k: "2", Illus: IllusNoFees },
    { k: "3", Illus: IllusClear },
  ];
  const stats = ["1", "2", "3"] as const;

  return (
    <div className="bg-white">
      {/* Hero clair */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EEF2FB] to-white">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(50% 60% at 80% 30%, rgba(30,99,196,0.10) 0%, transparent 70%)" }}
        />
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <span className="inline-block text-[12px] font-semibold text-sensei-bright bg-white border border-sensei-line px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
              {t("home.hero.kicker")}
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-medium text-sensei-ink leading-[1.02] tracking-[-0.02em] mb-6">
              {t("home.hero.title")}
            </h1>
            <p className="text-lg sm:text-xl text-sensei-muted leading-relaxed mb-9 max-w-[42ch]">
              {t("home.hero.sub")}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {stats.map((n) => (
                <span key={n} className="flex items-center gap-1.5">
                  <span className="text-sensei-trust">
                    <IconCheck className="w-4 h-4" />
                  </span>
                  <span className="text-sensei-muted">{t(`home.trust.${n}`)}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-0 m-auto w-[280px] h-[280px] rounded-[2.5rem] bg-sensei-bright/10 rotate-6" />
            <div className="relative">
              <ScheduleShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau stats */}
      <section className="bg-white border-y border-sensei-line">
        <div className="max-w-6xl mx-auto px-6 py-9 grid grid-cols-3 gap-6">
          {stats.map((n) => (
            <div key={n} className="text-center">
              <p className="text-2xl sm:text-3xl font-semibold text-sensei-ink tabular-nums">
                {t(`home.stat.${n}.value`)}
              </p>
              <p className="text-xs sm:text-sm text-sensei-muted mt-1 max-w-[22ch] mx-auto">
                {t(`home.stat.${n}.label`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pourquoi vous allez adorer */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-[40px] font-semibold text-sensei-ink tracking-tight mb-5">
              {t("love.title")}
            </h2>
            <p className="text-sensei-muted text-lg leading-relaxed">{t("love.intro")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {love.map(({ k, Illus }) => (
              <div key={k} className="flex flex-col items-center text-center">
                <div className="mb-5">
                  <Illus />
                </div>
                <h3 className="text-lg font-semibold text-sensei-ink mb-2">{t(`love.${k}.title`)}</h3>
                <p className="text-sensei-muted text-[15px] leading-relaxed max-w-[34ch]">
                  {t(`love.${k}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marchands partenaires */}
      <section className="py-24 px-6 bg-sensei-paper border-y border-sensei-line">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-[40px] font-semibold text-sensei-ink tracking-tight mb-4">
              {t("shop.title")}
            </h2>
            <p className="text-sensei-muted text-lg">{t("shop.sub")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {MERCHANTS.map((m) => (
              <MerchantCard key={m.key} m={m} />
            ))}
          </div>
        </div>
      </section>

      {/* Carrousel d'étapes */}
      <section className="py-24 bg-white border-t border-sensei-line">
        <StepsCarousel />
      </section>
    </div>
  );
}

// ── Carte d'échéancier (vitrine hero) ──────────────────────────────────

function ScheduleShowcase() {
  const { t } = useI18n();
  const total = 18000;
  const each = Math.round(total / 3);
  const items = [
    { date: "15 juil.", seq: 1, highlight: true },
    { date: "15 août", seq: 2, highlight: false },
    { date: "15 sept.", seq: 3, highlight: false },
  ];

  return (
    <div className="bg-white text-sensei-text rounded-3xl p-6 shadow-2xl shadow-sensei-ink/10 w-full max-w-[300px] relative border border-sensei-line/60">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-sensei-muted mb-1">
            {t("home.showcase.label")}
          </p>
          <p className="text-3xl font-semibold text-sensei-ink tabular-nums">{formatCents(total)}</p>
        </div>
        <span className="text-[11px] font-bold text-sensei-trust bg-sensei-trust/10 px-2.5 py-1 rounded-full mt-1">
          {t("shop.noFees")}
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map(({ date, seq, highlight }) => (
          <div
            key={seq}
            className={`flex items-center justify-between rounded-xl px-4 py-3 ${
              highlight ? "bg-sensei-bright text-white" : "bg-sensei-paper border border-sensei-line"
            }`}
          >
            <div>
              <div className={`text-xs font-bold ${highlight ? "text-white/80" : "text-sensei-muted"}`}>
                {t("home.showcase.inst")} {seq}
              </div>
              <div className={`text-[11px] ${highlight ? "text-white/60" : "text-sensei-muted/70"}`}>{date}</div>
            </div>
            <div className={`font-bold text-base tabular-nums ${highlight ? "text-white" : "text-sensei-ink"}`}>
              {formatCents(each)}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-sensei-muted text-center mt-4">{t("ccm.exampleNote")}</p>
    </div>
  );
}
