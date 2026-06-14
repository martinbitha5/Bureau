import { useI18n } from "../i18n";

const articles = [
  { k: "learn.a1", icon: "◎" },
  { k: "learn.a2", icon: "↗" },
  { k: "learn.a3", icon: "🛡" },
  { k: "learn.a4", icon: "🌍" },
];

export function ApprendrePage() {
  const { t } = useI18n();
  return (
    <section className="page">
      <h1 className="page-title">{t("page.learn.title")}</h1>
      <p className="muted">{t("page.learn.sub")}</p>

      <div className="card-grid">
        {articles.map((a) => (
          <article key={a.k} className="link-card">
            <div className="feature-icon">{a.icon}</div>
            <h3>{t(`${a.k}.title`)}</h3>
            <p className="muted">{t(`${a.k}.body`)}</p>
            <span className="inline-link">{t("page.learn.readmore")} →</span>
          </article>
        ))}
      </div>
    </section>
  );
}
