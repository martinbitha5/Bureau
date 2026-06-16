import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { HELP_CATEGORIES } from "../data/help-articles";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/aide")({
  component: AideRoot,
});

// ── Icônes SVG ────────────────────────────────────────────────────────────────

function IconInfo() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}
function IconCreditCard() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M2 10h20" strokeLinecap="round" />
    </svg>
  );
}
function IconAlertCircle() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 3L4 7v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7l-8-4z" strokeLinejoin="round" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
    </svg>
  );
}
function IconStore() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 9l1-5h16l1 5H3z" strokeLinejoin="round" />
      <path d="M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9" strokeLinejoin="round" />
      <path d="M9 21V12h6v9" strokeLinejoin="round" />
    </svg>
  );
}
function IconVisa() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <path d="M7 15l2-6 2 6M9 12h4M15 9v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "a-propos": <IconInfo />,
  "compte-paiements": <IconCreditCard />,
  "litiges-remboursements": <IconAlertCircle />,
  "securite-confidentialite": <IconShield />,
  "eligibilite-score": <IconStar />,
  "marchands-partenaires": <IconStore />,
  "carte-bancaire": <IconVisa />,
};

const HOW_SLUGS = ["comment-ca-marche", "prequalification", "creer-compte", "payer-echeance"];
const FEATURED_SLUGS = ["demander-financement", "prequalification", "dates-echeance", "si-refuse"];

const ARTICLE_TITLES: Record<string, { fr: string; en: string }> = {
  "comment-ca-marche":    { fr: "Comment fonctionne Sensei Pay",          en: "How Sensei Pay works" },
  "prequalification":     { fr: "À propos de la préqualification",         en: "About prequalification" },
  "creer-compte":         { fr: "Créer un compte",                         en: "Create an account" },
  "payer-echeance":       { fr: "Payer une échéance",                     en: "Pay an installment" },
  "demander-financement": { fr: "Demander un financement",                 en: "Request financing" },
  "dates-echeance":       { fr: "Dates d'échéance du paiement",           en: "Payment due dates" },
  "si-refuse":            { fr: "Si votre demande n'est pas approuvée",   en: "If your request is not approved" },
};

const ARTICLE_CATEGORY: Record<string, string> = {
  "comment-ca-marche":    "a-propos",
  "prequalification":     "a-propos",
  "creer-compte":         "a-propos",
  "payer-echeance":       "compte-paiements",
  "demander-financement": "compte-paiements",
  "dates-echeance":       "compte-paiements",
  "si-refuse":            "compte-paiements",
};

// ── Root — décide : home ou enfant ───────────────────────────────────────────

function AideRoot() {
  const location = useLocation();
  const isHome = location.pathname === "/aide" || location.pathname === "/aide/";
  return isHome ? <AideHome /> : <Outlet />;
}

// ── Page d'accueil du centre d'aide ──────────────────────────────────────────

function AideHome() {
  const { lang } = useI18n();
  const [query, setQuery] = useState("");
  const [showMoreFeatured, setShowMoreFeatured] = useState(false);

  const t = (fr: string, en: string) => (lang === "fr" ? fr : en);
  const displayedFeatured = showMoreFeatured ? FEATURED_SLUGS : FEATURED_SLUGS.slice(0, 3);

  return (
    <div className="bg-white">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        className="relative px-6 pt-14 pb-16 text-white text-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0d0e21 0%, #1a2151 50%, #2a1a5e 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(100,80,200,0.3) 0%, transparent 70%)" }}
        />
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-bold leading-tight mb-8 tracking-tight">
            {t("Comment pouvons-nous vous aider ?", "How can we help you?")}
          </h1>
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <IconSearch />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Tapez votre problème ou votre question ici", "Type your problem or question here")}
                className="w-full pl-12 pr-5 py-4 rounded-full text-sensei-ink bg-white shadow-xl text-[15px] placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Catégories ─────────────────────────────────────────────── */}
      <section className="px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-sensei-ink mb-8">
            {t("Obtenir de l'aide par sujet", "Get help by topic")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {HELP_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to="/aide/$sujet"
                params={{ sujet: cat.slug }}
                className="flex flex-col items-center gap-3 p-6 border border-sensei-line rounded-2xl bg-white hover:border-sensei-bright hover:shadow-md transition-all text-center group"
              >
                <span className="w-14 h-14 rounded-full bg-[#eeebf8] text-[#6b4ecf] flex items-center justify-center group-hover:bg-sensei-bright group-hover:text-white transition-colors">
                  {CATEGORY_ICONS[cat.slug]}
                </span>
                <span className="text-sm font-medium text-sensei-ink leading-tight">
                  {lang === "fr" ? cat.fr : cat.en}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment fonctionne + Articles à la une ─────────────────── */}
      <section className="px-6 pb-14">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-sensei-ink mb-4">
              {t("Comment fonctionne Sensei Pay", "How Sensei Pay works")}
            </h2>
            <div className="flex flex-col gap-1">
              {HOW_SLUGS.map((slug) => {
                const titles = ARTICLE_TITLES[slug];
                const catSlug = ARTICLE_CATEGORY[slug] ?? "a-propos";
                return (
                  <Link
                    key={slug}
                    to="/aide/$sujet/$article"
                    params={{ sujet: catSlug, article: slug }}
                    className="flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl border border-sensei-line bg-white hover:border-sensei-bright hover:bg-[#fafbff] transition-all group"
                  >
                    <span className="text-sm text-sensei-text group-hover:text-sensei-ink">
                      {lang === "fr" ? titles.fr : titles.en}
                    </span>
                    <IconChevronRight />
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-sensei-ink mb-4">
              {t("Articles à la une", "Featured articles")}
            </h2>
            <div className="flex flex-col gap-1">
              {displayedFeatured.map((slug) => {
                const titles = ARTICLE_TITLES[slug];
                const catSlug = ARTICLE_CATEGORY[slug] ?? "a-propos";
                return (
                  <Link
                    key={slug}
                    to="/aide/$sujet/$article"
                    params={{ sujet: catSlug, article: slug }}
                    className="flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl border border-sensei-line bg-white hover:border-sensei-bright hover:bg-[#fafbff] transition-all group"
                  >
                    <span className="text-sm text-sensei-text group-hover:text-sensei-ink">
                      {lang === "fr" ? titles.fr : titles.en}
                    </span>
                    <IconChevronRight />
                  </Link>
                );
              })}
              {!showMoreFeatured && (
                <button
                  type="button"
                  onClick={() => setShowMoreFeatured(true)}
                  className="mt-1 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-sensei-bright hover:underline"
                >
                  {t("Afficher plus", "Show more")} <IconChevronDown />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Besoin d'aide ? ────────────────────────────────────────── */}
      <section
        className="mx-6 mb-14 rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d0e21 0%, #1a2151 100%)" }}
      >
        <div className="relative px-8 py-14 text-center text-white">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 80% at 50% -10%, rgba(100,80,200,0.25) 0%, transparent 70%)" }}
          />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {t("Besoin d'aide ?", "Need help?")}
            </h2>
            <p className="text-white/60 mb-7 text-[15px]">
              {t("Obtenez un soutien instantané et personnalisé.", "Get instant, personalized support.")}
            </p>
            <a
              href="mailto:aide@sensei.cd"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-sensei-ink font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg text-sm"
            >
              {t("Contacter le support", "Contact support")}
            </a>
          </div>
        </div>
      </section>

      {/* ── Région ─────────────────────────────────────────────────── */}
      <div className="flex justify-center pb-12">
        <div className="flex items-center gap-2 px-4 py-2.5 border border-sensei-line rounded-full text-sm text-sensei-text cursor-pointer hover:border-sensei-bright transition-colors select-none">
          <span aria-hidden className="text-xl leading-none">🇨🇩</span>
          <span className="font-medium">RD Congo (Fr)</span>
          <IconChevronDown />
        </div>
      </div>
    </div>
  );
}
