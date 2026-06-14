import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { type Audience, useAudience } from "../audience";
import { useAuth } from "../auth";
import { type Lang, useI18n } from "../i18n";

export function RootLayout() {
  const { t, lang, setLang } = useI18n();
  const { audience, setAudience } = useAudience();
  const { session, appUser, signOut } = useAuth();
  const navigate = useNavigate();
  const langs: Lang[] = ["fr", "en"];
  const audiences: Audience[] = ["buyer", "merchant"];

  return (
    <div className="app">
      {!session && (
        <div className="audience-bar">
          <div className="audience-inner">
            {audiences.map((a) => (
              <button
                key={a}
                type="button"
                className={a === audience ? "audience-tab active" : "audience-tab"}
                onClick={() => setAudience(a)}
              >
                {a === "buyer" ? t("aud.buyers") : t("aud.merchants")}
              </button>
            ))}
          </div>
        </div>
      )}

      <header className="header">
        <Link to="/" className="brand">
          <span className="brand-mark">S</span>
          <span className="brand-name">{t("brand.name")}</span>
        </Link>

        {session && (
          <nav className="main-nav">
            <Link
              to="/"
              className="nav-link"
              activeProps={{ className: "nav-link active" }}
              activeOptions={{ exact: true }}
            >
              {t("nav.plans")}
            </Link>
          </nav>
        )}

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
            <>
              <Link to="/login" className="lang">
                {t("auth.login")}
              </Link>
              <Link to="/signup" className="btn-primary small">
                {t("auth.signup")}
              </Link>
            </>
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
