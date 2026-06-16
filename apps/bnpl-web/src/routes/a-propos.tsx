import { createFileRoute, Link } from "@tanstack/react-router";
import { IconArrowRight, IconBolt, IconClipboard, IconShield, InfoPage } from "../components";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/a-propos")({
  component: AProposPage,
});

const TRUST = [
  { key: "t1", Icon: IconClipboard },
  { key: "t2", Icon: IconShield },
  { key: "t3", Icon: IconBolt },
] as const;

const STATS = [{ key: "stat1" }, { key: "stat2" }, { key: "stat3" }] as const;

const TEAM = [
  { key: "m1", initials: "GM" },
  { key: "m2", initials: "DK" },
  { key: "m3", initials: "NT" },
  { key: "m4", initials: "JM" },
  { key: "m5", initials: "CN" },
  { key: "m6", initials: "AL" },
  { key: "m7", initials: "SK" },
] as const;

function AProposPage() {
  const { t } = useI18n();
  return (
    <InfoPage kicker={t("about.kicker")} title={t("about.title")} subtitle={t("about.subtitle")}>
      {/* Mission */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-sensei-ink tracking-tight mb-4">
            {t("about.mission.title")}
          </h2>
          <p className="text-sensei-muted text-lg leading-relaxed">{t("about.mission.body")}</p>
        </div>
      </section>

      {/* Pas de frais, pas de pièges */}
      <section className="py-16 px-6 bg-sensei-paper border-t border-sensei-line">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRUST.map(({ key, Icon }) => (
              <div key={key} className="bg-white border border-sensei-line rounded-2xl p-6 shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-sensei-bright/10 text-sensei-bright flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-sensei-ink mb-2">{t(`about.${key}.title`)}</h3>
                <p className="text-sensei-muted text-sm leading-relaxed">{t(`about.${key}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="py-16 px-6 bg-white border-t border-sensei-line">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-sensei-ink tracking-tight text-center mb-10">
            {t("about.stats.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STATS.map(({ key }) => (
              <div
                key={key}
                className="text-center bg-sensei-paper rounded-2xl border border-sensei-line px-6 py-8 shadow-sm"
              >
                <p className="text-2xl sm:text-3xl font-black text-sensei-ink tabular-nums mb-2">
                  {t(`about.${key}.value`)}
                </p>
                <p className="text-sm text-sensei-muted leading-snug">{t(`about.${key}.label`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe de direction */}
      <section className="py-16 px-6 bg-sensei-paper border-t border-sensei-line">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-sensei-ink tracking-tight text-center mb-12">
            {t("about.team.title")}
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 bg-white border border-sensei-line rounded-2xl p-8 shadow-sm mb-8">
            <div className="relative w-20 h-20 rounded-full bg-sensei-bright text-white flex items-center justify-center text-2xl font-bold flex-shrink-0 overflow-hidden">
              MB
              <img
                src="/martin.jpg"
                alt={t("about.team.founder.name")}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg text-sensei-ink leading-relaxed mb-3">{t("about.team.quote")}</p>
              <p className="font-semibold text-sensei-ink">
                {t("about.team.founder.name")}
                <span className="text-sensei-muted font-normal">, {t("about.team.founder.title")}</span>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {TEAM.map(({ key, initials }) => (
              <div key={key} className="text-center">
                <div className="w-16 h-16 rounded-full bg-sensei-bright/10 text-sensei-bright flex items-center justify-center text-lg font-bold mx-auto mb-3">
                  {initials}
                </div>
                <p className="font-semibold text-sensei-ink text-sm">{t(`about.team.${key}.name`)}</p>
                <p className="text-sensei-muted text-xs">{t(`about.team.${key}.title`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="py-20 px-6 bg-sensei-ink text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("about.final.title")}</h2>
          <p className="text-white/55 mb-8 text-lg leading-relaxed">{t("about.final.body")}</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-sensei-ink font-bold rounded-full hover:bg-sensei-paper transition-all shadow-lg text-sm"
          >
            {t("about.final.cta")} <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </InfoPage>
  );
}
