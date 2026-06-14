import { formatCents } from "@sensei/utils";
import { Link } from "@tanstack/react-router";
import { useAudience } from "../audience";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import { PlansView } from "./plans";

export function HomePage() {
  const { session, role, appUser, loading } = useAuth();
  const { audience } = useAudience();
  const { t } = useI18n();

  if (loading) return <p className="muted">{t("common.loading")}</p>;
  if (session) {
    if (role === "merchant") return <MerchantWelcome name={appUser?.fullName} />;
    return <PlansView />;
  }
  return audience === "merchant" ? <MerchantLanding /> : <Landing />;
}

function MerchantWelcome({ name }: { name?: string }) {
  const { t } = useI18n();
  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <div className="auth-badge">🏬</div>
        <h2 className="page-title">{t("merchant.welcome.title", { name: name || "" })}</h2>
        <p className="muted small">{t("merchant.welcome.sub")}</p>
        <p className="confirmed" style={{ marginTop: 16 }}>
          {t("merchant.welcome.soon")}
        </p>
      </div>
    </section>
  );
}

function Landing() {
  const { t } = useI18n();

  const features = [
    { k: "f1", icon: "⚡" },
    { k: "f2", icon: "▤" },
    { k: "f3", icon: "↗" },
  ];
  const steps = ["1", "2", "3"];

  return (
    <div className="landing">
      <section className="bleed hero-band">
        <div className="landing-inner hero-grid">
          <div>
            <span className="kicker">{t("home.hero.kicker")}</span>
            <h1 className="hero-h1">{t("home.hero.title")}</h1>
            <p className="hero-lead">{t("home.hero.sub")}</p>
            <div className="hero-actions">
              <Link to="/signup" className="btn-primary lg">
                {t("home.hero.cta")}
              </Link>
              <a href="#how" className="btn-ghost">
                {t("home.hero.secondary")}
              </a>
            </div>
            <div className="trust-row">
              <span className="trust-item">✓ {t("home.trust.1")}</span>
              <span className="trust-item">✓ {t("home.trust.2")}</span>
              <span className="trust-item">✓ {t("home.trust.3")}</span>
            </div>
          </div>
          <ScheduleShowcase />
        </div>
      </section>

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

      <section className="landing-inner section-pad security">
        <h2 className="band-title">{t("home.security.title")}</h2>
        <p className="security-body">{t("home.security.body")}</p>
      </section>

      <section className="bleed cta-band">
        <div className="landing-inner cta-inner">
          <h2>{t("home.cta.title")}</h2>
          <p>{t("home.cta.body")}</p>
          <Link to="/signup" className="btn-primary lg light">
            {t("home.hero.cta")}
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Landing « Marchands » — façon Affirm for business. */
function MerchantLanding() {
  const { t } = useI18n();
  const features = [
    { k: "f1", icon: "💸" },
    { k: "f2", icon: "📈" },
    { k: "f3", icon: "🛡" },
  ];
  const steps = ["1", "2", "3"];

  return (
    <div className="landing">
      <section className="bleed hero-band merchant-hero">
        <div className="landing-inner hero-grid">
          <div>
            <span className="kicker">{t("mhome.hero.kicker")}</span>
            <h1 className="hero-h1">{t("mhome.hero.title")}</h1>
            <p className="hero-lead">{t("mhome.hero.sub")}</p>
            <div className="hero-actions">
              <Link to="/signup" className="btn-primary lg">
                {t("mhome.hero.cta")}
              </Link>
              <Link to="/login" className="btn-ghost">
                {t("mhome.hero.secondary")}
              </Link>
            </div>
          </div>
          <MerchantSettlementShowcase />
        </div>
      </section>

      <section className="landing-inner section-pad">
        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.k} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{t(`mhome.${f.k}.title`)}</h3>
              <p className="muted">{t(`mhome.${f.k}.body`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bleed soft-band">
        <div className="landing-inner section-pad">
          <h2 className="band-title">{t("mhome.how.title")}</h2>
          <ol className="steps">
            {steps.map((n) => (
              <li key={n} className="step">
                <span className="step-num">{n}</span>
                <div>
                  <h3>{t(`mhome.how.${n}.title`)}</h3>
                  <p className="muted">{t(`mhome.how.${n}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bleed cta-band">
        <div className="landing-inner cta-inner">
          <h2>{t("mhome.cta.title")}</h2>
          <p>{t("mhome.cta.body")}</p>
          <Link to="/signup" className="btn-primary lg light">
            {t("mhome.hero.cta")}
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Aperçu d'un échéancier 3x — héros de la page acheteurs. */
function ScheduleShowcase() {
  const { t } = useI18n();
  const total = 18000; // 180,00 USD en cents
  const each = Math.round(total / 3);
  const dates = ["15 juil.", "15 août", "15 sept."];
  return (
    <div className="sched-showcase">
      <div className="sched-head">
        <span className="showcase-label">{t("home.showcase.label")}</span>
        <strong className="sched-total">{formatCents(total)}</strong>
      </div>
      <ul className="sched-list">
        {dates.map((d, i) => (
          <li key={d} className="sched-row">
            <span className="sched-seq">
              {t("home.showcase.inst")} {i + 1}
            </span>
            <span className="muted small">{d}</span>
            <span className="sched-amount">{formatCents(each)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Aperçu « vous êtes réglé d'avance » — héros de la page marchands. */
function MerchantSettlementShowcase() {
  const { t } = useI18n();
  const total = 18000;
  return (
    <div className="sched-showcase">
      <div className="sched-head">
        <span className="showcase-label">{t("mhome.f1.title")}</span>
        <strong className="sched-total">{formatCents(total)}</strong>
      </div>
      <ul className="sched-list">
        <li className="sched-row settle-row">
          <span className="sched-seq">{t("mhome.how.3.title")}</span>
          <span className="paid-badge">✓</span>
          <span className="sched-amount">{formatCents(total)}</span>
        </li>
      </ul>
      <p className="muted small" style={{ marginTop: 12 }}>
        {t("mhome.f1.body")}
      </p>
    </div>
  );
}
