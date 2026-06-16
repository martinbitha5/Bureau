import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth";
import { type Lang, useI18n } from "../i18n";

/** Réseaux sociaux du pied de page (placeholders visuels). */
const SOCIALS = [
  {
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "X",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M18.9 2H22l-7.5 8.6L23 22h-6.8l-5-6.6L5.3 22H2l8-9.2L1.5 2h7l4.5 6z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5 2.5 2.5 0 0 0 4.98 3.5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.8-2 3.7-2 3.95 0 4.45 2.6 4.45 6V21H21v-5.6c0-1.34-.02-3.07-1.9-3.07-1.9 0-2.2 1.48-2.2 3v5.67H13z" />
      </svg>
    ),
  },
];

/** Liens de l'app connectée (acheteur). */
const APP_LINKS = [
  { to: "/", key: "nav.dashboard", exact: true },
  { to: "/paiements", key: "nav.plans", exact: false },
  { to: "/score", key: "nav.score", exact: false },
  { to: "/moyens-paiement", key: "nav.methods", exact: false },
  { to: "/profil", key: "nav.profile", exact: false },
] as const;

export function RootLayout() {
  const { t, lang, setLang } = useI18n();
  const { session, role, appUser, signOut } = useAuth();
  const navigate = useNavigate();
  const langs: Lang[] = ["fr", "en"];

  const isConsumerApp = !!session && role !== "merchant";

  return (
    <div className="min-h-screen flex flex-col bg-white text-sensei-text">
      {/* ── Barre 1 : Acheteurs / Marchands — défile au scroll (public) ── */}
      {!session && (
        <div className="border-b border-sensei-line bg-sensei-paper">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 flex items-center gap-6">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="h-9 flex items-center text-sm font-medium text-sensei-muted hover:text-sensei-text border-b-2 border-transparent transition-colors"
              activeProps={{ className: "h-9 flex items-center text-sm font-semibold text-sensei-ink border-b-2 border-sensei-ink" }}
            >
              {t("aud.buyers")}
            </Link>
            <Link
              to="/entreprise"
              className="h-9 flex items-center text-sm font-medium text-sensei-muted hover:text-sensei-text border-b-2 border-transparent transition-colors"
              activeProps={{ className: "h-9 flex items-center text-sm font-semibold text-sensei-ink border-b-2 border-sensei-ink" }}
            >
              {t("aud.merchants")}
            </Link>
          </div>
        </div>
      )}

      {/* ── Barre 2 : header principal — reste fixe au scroll ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sensei-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo + Comment ça marche */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-sensei-bright flex items-center justify-center text-white font-black text-sm tracking-tight shadow-sm group-hover:bg-sensei-blue transition-colors">
                S
              </div>
              <span className="font-bold text-[17px] text-sensei-ink tracking-tight">Sensei Pay</span>
            </Link>

            {!session && (
              <Link
                to="/comment-ca-marche"
                className="hidden sm:block text-sm font-semibold text-sensei-text hover:text-sensei-bright transition-colors"
                activeProps={{ className: "hidden sm:block text-sm font-semibold text-sensei-bright" }}
              >
                {t("nav.how")}
              </Link>
            )}
          </div>

          {/* Côté droit */}
          <div className="flex items-center gap-2.5">
            <div className="flex gap-0.5 bg-sensei-paper rounded-full p-0.5 border border-sensei-line">
              {langs.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
                    l === lang ? "bg-sensei-ink text-white" : "text-sensei-muted hover:text-sensei-text"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {session ? (
              <>
                <Link
                  to="/profil"
                  className="hidden sm:block text-sm text-sensei-muted hover:text-sensei-text transition-colors max-w-[14ch] truncate"
                >
                  {appUser?.fullName}
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/login" });
                  }}
                  className="text-sm font-semibold text-sensei-bright hover:text-sensei-blue transition-colors"
                >
                  {t("auth.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:block text-sm font-semibold text-sensei-text hover:text-sensei-bright transition-colors"
                >
                  {t("auth.login")}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-sensei-bright text-white text-sm font-bold rounded-full hover:bg-sensei-blue transition-all shadow-sm"
                >
                  {t("auth.signup")}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Nav app connectée — reste dans le header fixe */}
        {isConsumerApp && (
          <div className="border-t border-sensei-line bg-white">
            <nav className="max-w-6xl mx-auto px-3 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar">
              {APP_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  activeOptions={l.exact ? { exact: true } : undefined}
                  className="px-3.5 py-2.5 rounded-none border-b-2 border-transparent text-sm font-medium text-sensei-muted hover:text-sensei-text whitespace-nowrap transition-all"
                  activeProps={{ className: "px-3.5 py-2.5 border-b-2 border-sensei-bright text-sm font-semibold text-sensei-ink whitespace-nowrap" }}
                >
                  {t(l.key)}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ── Contenu ──────────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Pied de page ─────────────────────────────────────────── */}
      <footer className="border-t border-sensei-line bg-white">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_2fr] gap-12">
            {/* Réseaux + région */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full bg-sensei-paper border border-sensei-line flex items-center justify-center text-sensei-text hover:text-sensei-bright hover:border-sensei-bright transition-colors"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
              <span className="inline-flex items-center gap-2 bg-sensei-paper border border-sensei-line rounded-full px-3.5 py-2 text-sm font-medium text-sensei-text">
                <span aria-hidden>🇨🇩</span> {t("footer.region")}
              </span>
            </div>

            {/* Colonnes de liens */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted mb-3">
                  {t("footer.consumers")}
                </p>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li><Link to="/aide" className="text-sensei-text hover:text-sensei-bright transition-colors">{t("footer.help")}</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted mb-3">
                  {t("footer.forMerchants")}
                </p>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li><Link to="/developpeurs" className="text-sensei-text hover:text-sensei-bright transition-colors">{t("footer.developers")}</Link></li>
                  <li><Link to="/soutien-marchands" className="text-sensei-text hover:text-sensei-bright transition-colors">{t("footer.merchantSupport")}</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted mb-3">
                  {t("footer.about")}
                </p>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li><Link to="/a-propos" className="text-sensei-text hover:text-sensei-bright transition-colors">{t("footer.aboutUs")}</Link></li>
                  <li><Link to="/carrieres" className="text-sensei-text hover:text-sensei-bright transition-colors">{t("footer.careers")}</Link></li>
                  <li><Link to="/investisseurs" className="text-sensei-text hover:text-sensei-bright transition-colors">{t("footer.investors")}</Link></li>
                  <li><Link to="/presse" className="text-sensei-text hover:text-sensei-bright transition-colors">{t("footer.press")}</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mentions légales */}
          <p className="text-xs text-sensei-muted leading-relaxed mt-12 pt-8 border-t border-sensei-line">
            {t("footer.legalNote")}
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-6">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-sensei-muted">
              <a href="#" className="hover:text-sensei-bright transition-colors">{t("footer.privacy")}</a>
              <a href="#" className="hover:text-sensei-bright transition-colors">{t("footer.terms")}</a>
            </div>
            <p className="text-xs text-sensei-muted whitespace-nowrap">© 2026 Sensei · {t("footer.rights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
