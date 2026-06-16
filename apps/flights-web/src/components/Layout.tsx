import { Link, Outlet } from "@tanstack/react-router";
import { type Lang, useI18n } from "../i18n";

export function RootLayout() {
  const { t, lang, setLang } = useI18n();
  const langs: Lang[] = ["fr", "en"];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-violet-700 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none">
              S
            </div>
            <span className="font-semibold text-gray-900 text-sm tracking-tight">
              {t("brand.name")}
            </span>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/manage"
              className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-gray-700 border border-gray-200 rounded-full px-4 py-1.5 hover:border-violet-300 hover:text-violet-700 transition-all"
            >
              {t("nav.manage")} →
            </Link>
            <div className="flex items-center bg-gray-100 rounded-full p-0.5">
              {langs.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={
                    l === lang
                      ? "px-3 py-1 rounded-full text-xs font-semibold bg-white text-gray-900 shadow-sm"
                      : "px-3 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  }
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* ── Footer — AA style ── */}
      <footer style={{ backgroundColor: "#1a3040" }} className="text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">

          {/* Top row: logo + social */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 pb-10 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none">S</div>
              <span className="text-white font-bold text-base tracking-tight">Sensei Flights</span>
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-4">
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              {/* X / Twitter */}
              <a href="#" aria-label="X" className="text-gray-400 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* YouTube */}
              <a href="#" aria-label="YouTube" className="text-gray-400 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              {/* TikTok */}
              <a href="#" aria-label="TikTok" className="text-gray-400 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.02-.08z"/></svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Col 1 */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
                {lang === "fr" ? "Réserver avec nous" : "Book with us"}
              </h4>
              <ul className="space-y-3">
                {[
                  lang === "fr" ? "Vols aller simple" : "One-way flights",
                  lang === "fr" ? "Vols aller-retour" : "Return flights",
                  lang === "fr" ? "Payer en 3 fois" : "Pay in instalments",
                  lang === "fr" ? "Vols pas chers" : "Cheap flights",
                  lang === "fr" ? "Vols depuis Kinshasa" : "Flights from Kinshasa",
                ].map((item) => (
                  <li key={item}>
                    <Link to="/" className="text-xs text-gray-400 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Col 2 */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
                {lang === "fr" ? "Ma réservation" : "My booking"}
              </h4>
              <ul className="space-y-3">
                {[
                  lang === "fr" ? "Gérer ma réservation" : "Manage booking",
                  lang === "fr" ? "Modifier mon vol" : "Change my flight",
                  lang === "fr" ? "Politique d'annulation" : "Cancellation policy",
                  lang === "fr" ? "Remboursements" : "Refunds",
                  lang === "fr" ? "Aide & support" : "Help & support",
                ].map((item) => (
                  <li key={item}>
                    <Link to="/manage" className="text-xs text-gray-400 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Col 3 */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
                {lang === "fr" ? "L'entreprise" : "Company"}
              </h4>
              <ul className="space-y-3">
                {[
                  lang === "fr" ? "À propos de nous" : "About us",
                  "Sensei Credit",
                  "Sensei BNPL",
                  lang === "fr" ? "Carrières" : "Careers",
                  lang === "fr" ? "Presse" : "Press",
                ].map((item) => (
                  <li key={item}>
                    <span className="text-xs text-gray-400 hover:text-white cursor-pointer transition-colors">{item}</span>
                  </li>
                ))}
                <li>
                  <Link to="/travel-agents" className="text-xs text-gray-400 hover:text-white transition-colors">
                    {lang === "fr" ? "Agences de voyage" : "Travel agents"}
                  </Link>
                </li>
              </ul>
            </div>
            {/* Col 4 */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
                {lang === "fr" ? "Sensei Pay" : "Sensei Pay"}
              </h4>
              <ul className="space-y-3">
                {[
                  lang === "fr" ? "Comment ça marche" : "How it works",
                  lang === "fr" ? "Payer en 3 fois" : "Pay in 3",
                  lang === "fr" ? "Payer en 6 fois" : "Pay in 6",
                  lang === "fr" ? "Éligibilité" : "Eligibility",
                  "FAQ",
                ].map((item) => (
                  <li key={item}>
                    <span className="text-xs text-gray-400 hover:text-white cursor-pointer transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom legal row */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Sensei Group — {lang === "fr" ? "Tous droits réservés" : "All rights reserved"}
            </p>
            <div className="flex items-center gap-5">
              {[
                lang === "fr" ? "Confidentialité" : "Privacy",
                lang === "fr" ? "Conditions générales" : "Terms",
                "Cookies",
                lang === "fr" ? "Accessibilité" : "Accessibility",
              ].map((l) => (
                <span key={l} className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
