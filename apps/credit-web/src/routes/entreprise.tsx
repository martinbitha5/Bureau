import { Link } from "@tanstack/react-router";
import { useI18n } from "../i18n";

const features = [
  { k: "ent.f1", icon: "⚡" },
  { k: "ent.f2", icon: "🔒" },
  { k: "ent.f3", icon: "🌍" },
];

export function EntreprisePage() {
  const { t } = useI18n();
  return (
    <div className="landing">
      {/* Hero */}
      <section className="bleed hero-band hero-band--biz">
        <div className="landing-inner hero-grid">
          <div>
            <span className="kicker">{t("ent.hero.kicker")}</span>
            <h1 className="hero-h1">{t("ent.hero.title")}</h1>
            <p className="hero-lead">{t("ent.hero.sub")}</p>
            <div className="hero-actions">
              <Link to="/" className="btn-primary lg">
                {t("ent.hero.cta")}
              </Link>
              <Link to="/produits" className="btn-ghost">
                {t("ent.hero.secondary")}
              </Link>
            </div>
          </div>
          <div className="showcase biz-showcase">
            <div className="showcase-label">{t("prod.b.decision.title")}</div>
            <div className="biz-decision">
              <span className="biz-approved">✓</span>
              <div>
                <strong>APPROVED</strong>
                <span className="muted small">score 742 · 180 ms</span>
              </div>
            </div>
            <code className="biz-code">POST /v1/decision → 200 OK</code>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-inner section-pad">
        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.k} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{t(`${f.k}.title`)}</h3>
              <p className="muted">{t(`${f.k}.body`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bleed cta-band">
        <div className="landing-inner cta-inner">
          <h2>{t("ent.cta.title")}</h2>
          <p>{t("ent.cta.body")}</p>
          <Link to="/login" className="btn-primary lg light">
            {t("ent.hero.cta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
