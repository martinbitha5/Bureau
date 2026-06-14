import { Link } from "@tanstack/react-router";
import { useI18n } from "../i18n";

const personal = [
  { k: "prod.p.score", icon: "◎", to: "/" as const },
  { k: "prod.p.monitor", icon: "🛡", to: "/activation" as const },
  { k: "prod.p.identity", icon: "👤", to: "/activation" as const },
  { k: "prod.p.bnpl", icon: "↗", to: "/" as const },
];

const business = [
  { k: "prod.b.check", icon: "✔" },
  { k: "prod.b.decision", icon: "⚡" },
  { k: "prod.b.kyc", icon: "🔍" },
];

export function ProduitsPage() {
  const { t } = useI18n();
  return (
    <section className="page">
      <h1 className="page-title">{t("produits.title")}</h1>
      <p className="muted">{t("produits.sub")}</p>

      <h2 className="section-title">{t("produits.forYou")}</h2>
      <div className="card-grid">
        {personal.map((p) => (
          <Link key={p.k} to={p.to} className="link-card">
            <div className="feature-icon">{p.icon}</div>
            <h3>{t(`${p.k}.title`)}</h3>
            <p className="muted">{t(`${p.k}.body`)}</p>
          </Link>
        ))}
      </div>

      <h2 className="section-title">{t("produits.forBusiness")}</h2>
      <div className="card-grid">
        {business.map((p) => (
          <Link key={p.k} to="/entreprise" className="link-card">
            <div className="feature-icon">{p.icon}</div>
            <h3>{t(`${p.k}.title`)}</h3>
            <p className="muted">{t(`${p.k}.body`)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
