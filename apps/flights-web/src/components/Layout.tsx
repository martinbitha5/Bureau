import { Link, Outlet } from "@tanstack/react-router";
import { type Lang, useI18n } from "../i18n";

export function RootLayout() {
  const { t, lang, setLang } = useI18n();
  const langs: Lang[] = ["fr", "en"];
  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="brand">
          <span className="brand-mark">S</span>
          <span className="brand-name">{t("brand.name")}</span>
        </Link>
        <div className="lang-switch">
          {langs.map((l) => (
            <button
              key={l}
              className={l === lang ? "lang active" : "lang"}
              onClick={() => setLang(l)}
              type="button"
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">Sensei · {t("brand.tagline")}</footer>
    </div>
  );
}
