import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth";
import { type Lang, useI18n } from "../i18n";

export function RootLayout() {
  const { t, lang, setLang } = useI18n();
  const { session, appUser, signOut } = useAuth();
  const navigate = useNavigate();
  const langs: Lang[] = ["fr", "en"];

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="brand">
          <span className="brand-mark">S</span>
          <span className="brand-name">{t("brand.name")}</span>
        </Link>
        <div className="header-right">
          {session ? (
            <>
              <span className="who">{appUser?.fullName || t("auth.account")}</span>
              <button
                type="button"
                className="lang"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/login" });
                }}
              >
                {t("auth.logout")}
              </button>
            </>
          ) : (
            <Link to="/login" className="lang">
              {t("auth.login")}
            </Link>
          )}
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
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">Sensei · {t("brand.tagline")}</footer>
    </div>
  );
}
