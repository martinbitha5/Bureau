import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  Badge,
  Card,
  IconArrowRight,
  IconBuilding,
  IconCard,
  IconPlane,
  IconStore,
} from "../components";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/ou-payer")({
  component: OuPayerPage,
});

// ── Category cards (coming soon) ──────────────────────────────────────────

const categories: Array<{ key: string; Icon: typeof IconPlane }> = [
  { key: "travel", Icon: IconPlane },
  { key: "electronics", Icon: IconCard },
  { key: "retail", Icon: IconStore },
  { key: "services", Icon: IconBuilding },
];

// ── Page ──────────────────────────────────────────────────────────────────

export function OuPayerPage() {
  const { t } = useI18n();

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-sensei-ink text-white py-20 px-6 overflow-hidden relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 80% at 70% 50%, rgba(30,99,196,0.18) 0%, transparent 70%), radial-gradient(40% 50% at 10% 80%, rgba(18,58,107,0.4) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-sensei-bright/70 bg-sensei-bright/10 px-3 py-1.5 rounded-full mb-6">
            {t("where.kicker")}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black leading-[1.06] tracking-tight mb-5">
            {t("where.title")}
          </h1>
          <p className="text-lg text-white/65 leading-relaxed max-w-[46ch] mx-auto">
            {t("where.subtitle")}
          </p>
        </div>
      </section>

      {/* ── Featured merchant: Sensei Flights ─────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-0">
              {/* Icon tile */}
              <div className="bg-sensei-blue flex items-center justify-center p-10 md:p-14">
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center">
                  <IconPlane className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-7 sm:p-9 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-bold text-sensei-ink tracking-tight">
                    {t("where.flights.name")}
                  </h2>
                  <Badge tone="trust">{t("where.flights.tag")}</Badge>
                </div>
                <p className="text-sensei-muted leading-relaxed mb-7 max-w-[44ch]">
                  {t("where.flights.desc")}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 self-start px-6 py-3.5 bg-sensei-bright text-white font-bold rounded-full hover:bg-sensei-blue transition-all shadow-lg shadow-sensei-bright/20 text-sm"
                >
                  {t("where.flights.cta")}
                  <IconArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Coming soon grid ──────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-sensei-paper border-t border-sensei-line">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-sensei-ink tracking-tight mb-3">
              {t("where.coming.title")}
            </h2>
            <p className="text-sensei-muted max-w-[44ch] mx-auto">
              {t("where.coming.body")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(({ key, Icon }) => (
              <Card
                key={key}
                className="p-5 flex flex-col items-center text-center gap-3 opacity-60 hover:opacity-75 transition-opacity"
              >
                <div className="w-11 h-11 bg-sensei-muted/10 rounded-2xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-sensei-muted" />
                </div>
                <p className="text-sm font-semibold text-sensei-ink leading-snug">
                  {t(`where.cat.${key}`)}
                </p>
                <Badge tone="muted">{t("where.cat.comingSoon")}</Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Merchant CTA ──────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-sensei-ink text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">
            {t("where.merchant.title")}
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed max-w-[44ch] mx-auto">
            {t("where.merchant.body")}
          </p>
          <Link
            to="/entreprise"
            className="inline-flex items-center gap-2 px-7 py-4 bg-white text-sensei-ink font-bold rounded-full hover:bg-sensei-paper transition-all shadow-lg text-sm"
          >
            {t("where.merchant.cta")}
            <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
