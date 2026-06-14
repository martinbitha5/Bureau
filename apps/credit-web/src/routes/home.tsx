import { Link } from "@tanstack/react-router";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import { DashboardView } from "./dashboard";

export function HomePage() {
  const { session, loading } = useAuth();
  const { t } = useI18n();

  if (loading) return <p className="muted">{t("common.loading")}</p>;
  if (session) return <DashboardView />;
  return <Landing />;
}

function Landing() {
  const { t } = useI18n();

  const features = [
    { k: "f1", icon: "◎" },
    { k: "f2", icon: "⚿" },
    { k: "f3", icon: "↗" },
  ];
  const steps = ["1", "2", "3"];

  return (
    <div className="landing">
      {/* Hero */}
      <section className="bleed hero-band">
        <div className="landing-inner hero-grid">
          <div>
            <span className="kicker">{t("home.hero.kicker")}</span>
            <h1 className="hero-h1">{t("home.hero.title")}</h1>
            <p className="hero-lead">{t("home.hero.sub")}</p>
            <div className="hero-actions">
              <Link to="/login" className="btn-primary lg">
                {t("home.hero.cta")}
              </Link>
              <a href="#how" className="btn-ghost">
                {t("home.hero.secondary")}
              </a>
            </div>
            <div className="trust-row">
              <span className="trust-item">✓ {t("home.trust.transparent")}</span>
              <span className="trust-item">✓ {t("home.trust.consent")}</span>
              <span className="trust-item">✓ {t("home.trust.audited")}</span>
            </div>
          </div>
          <ScoreShowcase />
        </div>
      </section>

      {/* Offre Protection */}
      <section className="landing-inner section-pad">
        <div className="offer-card">
          <div>
            <span className="kicker offer-kicker">{t("home.offer.kicker")}</span>
            <h2 className="offer-title">{t("home.offer.title")}</h2>
            <ul className="offer-list">
              <li>✓ {t("home.offer.b1")}</li>
              <li>✓ {t("home.offer.b2")}</li>
              <li>✓ {t("home.offer.b3")}</li>
            </ul>
          </div>
          <div className="offer-side">
            <div className="offer-price">{t("home.offer.price")}</div>
            <Link to="/activation" className="btn-primary lg">
              {t("home.offer.cta")}
            </Link>
            <p className="muted small offer-note">{t("home.offer.note")}</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-inner section-pad">
        <h2 className="band-title">{t("home.features.title")}</h2>
        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.k} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{t(`home.${f.k}.title`)}</h3>
              <p className="muted">{t(`home.${f.k}.body`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bleed soft-band">
        <div className="landing-inner section-pad">
          <h2 className="band-title">{t("home.how.title")}</h2>
          <ol className="steps">
            {steps.map((n) => (
              <li key={n} className="step">
                <span className="step-num">{n}</span>
                <div>
                  <h3>{t(`home.how.${n}.title`)}</h3>
                  <p className="muted">{t(`home.how.${n}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Security */}
      <section className="landing-inner section-pad security">
        <h2 className="band-title">{t("home.security.title")}</h2>
        <p className="security-body">{t("home.security.body")}</p>
      </section>

      {/* CTA */}
      <section className="bleed cta-band">
        <div className="landing-inner cta-inner">
          <h2>{t("home.cta.title")}</h2>
          <p>{t("home.cta.body")}</p>
          <Link to="/login" className="btn-primary lg light">
            {t("home.hero.cta")}
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Aperçu visuel d'une carte de score, héros de la page. */
function ScoreShowcase() {
  const { t } = useI18n();
  const score = 742;
  const pct = ((score - 300) / (850 - 300)) * 100;
  return (
    <div className="showcase">
      <div className="showcase-label">{t("score.title")}</div>
      <div className="showcase-score band-very_good">{score}</div>
      <span className="band-chip band-very_good">{t("score.band.very_good")}</span>
      <div className="gauge showcase-gauge">
        <div className="gauge-track">
          <div className="gauge-marker" style={{ left: `${pct}%` }} />
        </div>
        <div className="gauge-scale">
          <span>300</span>
          <span>850</span>
        </div>
      </div>
      <div className="showcase-event">
        <span className="event-reason">{t("score.reason.on_time_payment")}</span>
        <span className="delta up">+8</span>
      </div>
    </div>
  );
}
