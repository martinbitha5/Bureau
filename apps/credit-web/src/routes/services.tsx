import { Link } from "@tanstack/react-router";
import { useI18n } from "../i18n";

const services = [
  { k: "svc.rights", icon: "⚖", to: "/faq" as const },
  { k: "svc.dispute", icon: "✎", to: "/report" as const },
  { k: "svc.getreport", icon: "📄", to: "/report" as const },
  { k: "svc.complaint", icon: "✉", to: "/faq" as const },
  { k: "svc.freeze", icon: "🔒", to: "/consent" as const },
];

export function ServicesPage() {
  const { t } = useI18n();
  return (
    <section className="page">
      <h1 className="page-title">{t("page.services.title")}</h1>
      <p className="muted">{t("page.services.sub")}</p>

      <ul className="service-list">
        {services.map((s) => (
          <li key={s.k} className="service-row">
            <span className="service-icon">{s.icon}</span>
            <div className="service-text">
              <h3>{t(`${s.k}.title`)}</h3>
              <p className="muted">{t(`${s.k}.body`)}</p>
            </div>
            <Link to={s.to} className="btn-ghost sm">
              {t("page.services.open")}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
