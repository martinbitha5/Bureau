import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth";
import { type Lang, useI18n } from "../i18n";

type LinkTo = "/" | "/entreprise" | "/produits" | "/apprendre" | "/services" | "/faq" | "/activation";

interface MenuEntry {
  k: string;
  to: LinkTo;
}

const PRODUITS_MENU: MenuEntry[] = [
  { k: "prod.p.score", to: "/" },
  { k: "prod.p.monitor", to: "/activation" },
  { k: "prod.p.identity", to: "/activation" },
  { k: "prod.p.bnpl", to: "/" },
];

const APPRENDRE_MENU: MenuEntry[] = [
  { k: "learn.a1", to: "/apprendre" },
  { k: "learn.a2", to: "/apprendre" },
  { k: "learn.a3", to: "/apprendre" },
  { k: "learn.a4", to: "/apprendre" },
];

const SERVICES_MENU: MenuEntry[] = [
  { k: "svc.rights", to: "/services" },
  { k: "svc.dispute", to: "/services" },
  { k: "svc.getreport", to: "/services" },
  { k: "svc.complaint", to: "/services" },
  { k: "svc.freeze", to: "/services" },
];

export function RootLayout() {
  const { t, lang, setLang } = useI18n();
  const { session, appUser, signOut } = useAuth();
  const navigate = useNavigate();
  const langs: Lang[] = ["fr", "en"];

  return (
    <div className="app">
      {/* Barre supérieure : audience + liens + langue */}
      <div className="topbar">
        <div className="topbar-inner">
          <nav className="audience-tabs">
            <Link
              to="/"
              className="audience-tab"
              activeProps={{ className: "audience-tab active" }}
              activeOptions={{ exact: true }}
            >
              {t("nav.audience.particulier")}
            </Link>
            <Link
              to="/entreprise"
              className="audience-tab"
              activeProps={{ className: "audience-tab active" }}
            >
              {t("nav.audience.entreprise")}
            </Link>
          </nav>
          <div className="topbar-right">
            <Link to="/faq" className="topbar-link">
              {t("nav.about")}
            </Link>
            <Link to="/services" className="topbar-link">
              {t("nav.contact")}
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
          </div>
        </div>
      </div>

      {/* Barre principale : marque + navigation + actions */}
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">S</span>
            <span className="brand-name">{t("brand.name")}</span>
          </Link>

          {session ? (
            <nav className="main-nav">
              <Link to="/" className="nav-link" activeProps={{ className: "nav-link active" }} activeOptions={{ exact: true }}>
                {t("nav.score")}
              </Link>
              <Link to="/report" className="nav-link" activeProps={{ className: "nav-link active" }}>
                {t("nav.report")}
              </Link>
              <Link to="/consent" className="nav-link" activeProps={{ className: "nav-link active" }}>
                {t("nav.consent")}
              </Link>
            </nav>
          ) : (
            <nav className="mega-nav">
              <NavDropdown label={t("nav.produits")} entries={PRODUITS_MENU} allTo="/produits" />
              <NavDropdown label={t("nav.apprendre")} entries={APPRENDRE_MENU} allTo="/apprendre" />
              <NavDropdown label={t("nav.services")} entries={SERVICES_MENU} allTo="/services" />
              <Link to="/faq" className="nav-link" activeProps={{ className: "nav-link active" }}>
                {t("nav.faq")}
              </Link>
            </nav>
          )}

          <div className="header-right">
            {session ? (
              <>
                <span className="who">{appUser?.fullName || t("auth.account")}</span>
                <button
                  type="button"
                  className="btn-text"
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
                <Link to="/activation" className="btn-activation">
                  {t("nav.activation")}
                </Link>
                <Link to="/login" className="btn-text">
                  {t("auth.login")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}

function NavDropdown({ label, entries, allTo }: { label: string; entries: MenuEntry[]; allTo: LinkTo }) {
  const { t } = useI18n();
  return (
    <div className="nav-dd">
      <button type="button" className="nav-link nav-dd-trigger">
        {label} <span className="caret">▾</span>
      </button>
      <div className="nav-dd-panel">
        {entries.map((e, i) => (
          <Link key={`${e.k}-${i}`} to={e.to} className="nav-dd-item">
            <span className="nav-dd-title">{t(`${e.k}.title`)}</span>
            <span className="nav-dd-body">{t(`${e.k}.body`)}</span>
          </Link>
        ))}
        <Link to={allTo} className="nav-dd-all">
          {label} →
        </Link>
      </div>
    </div>
  );
}

function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="footer-cols">
        <div className="footer-brand">
          <span className="brand-mark">S</span>
          <div>
            <div className="brand-name">{t("brand.name")}</div>
            <div className="muted small">{t("brand.tagline")}</div>
          </div>
        </div>
        <div className="footer-col">
          <h4>{t("footer.products")}</h4>
          <Link to="/produits">{t("nav.produits")}</Link>
          <Link to="/entreprise">{t("nav.audience.entreprise")}</Link>
          <Link to="/activation">{t("nav.activation")}</Link>
        </div>
        <div className="footer-col">
          <h4>{t("footer.company")}</h4>
          <Link to="/apprendre">{t("nav.apprendre")}</Link>
          <Link to="/services">{t("nav.services")}</Link>
          <Link to="/faq">{t("nav.faq")}</Link>
        </div>
        <div className="footer-col">
          <h4>{t("footer.legal")}</h4>
          <Link to="/faq">{t("footer.privacy")}</Link>
          <Link to="/faq">{t("footer.terms")}</Link>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Sensei · {t("footer.rights")}
      </div>
    </footer>
  );
}
