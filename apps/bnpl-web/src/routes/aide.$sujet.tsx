import { createFileRoute, Link, Outlet, useLocation, useParams } from "@tanstack/react-router";
import { HELP_CATEGORIES, HELP_ARTICLES, getCategory } from "../data/help-articles";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/aide/$sujet")({
  component: CategoryRoot,
});

function CategoryRoot() {
  const location = useLocation();
  // Path segments: ["", "aide", sujet, article?]
  const segments = location.pathname.split("/").filter(Boolean);
  const isCategory = segments.length === 2; // /aide/$sujet only
  return isCategory ? <CategoryPage /> : <Outlet />;
}

function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CategoryPage() {
  const { sujet } = useParams({ from: "/aide/$sujet" });
  const { lang } = useI18n();
  const category = getCategory(sujet);

  if (!category) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-sensei-muted">Catégorie introuvable.</p>
        <Link to="/aide" className="mt-4 inline-block text-sensei-bright hover:underline text-sm">
          ← Retour au centre d'aide
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* ── Hero mini ──────────────────────────────────────────────── */}
      <div
        className="relative px-6 pt-8 pb-10 text-white"
        style={{ background: "linear-gradient(160deg, #0d0e21 0%, #1a2151 50%, #2a1a5e 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(100,80,200,0.25) 0%, transparent 70%)" }}
        />
        <div className="relative max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/50 text-sm mb-5">
            <Link to="/aide" className="hover:text-white transition-colors">
              Centre d'aide
            </Link>
            <span>›</span>
            <span className="text-white/80">{lang === "fr" ? category.fr : category.en}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {lang === "fr" ? "Obtenir de l'aide par sujet" : "Get help by topic"}
          </h1>
        </div>
      </div>

      {/* ── Tabs horizontaux ───────────────────────────────────────── */}
      <div className="border-b border-sensei-line bg-white sticky top-[64px] z-30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
            {HELP_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to="/aide/$sujet"
                params={{ sujet: cat.slug }}
                className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-sensei-muted border-b-2 border-transparent hover:text-sensei-ink transition-colors flex-shrink-0"
                activeProps={{ className: "whitespace-nowrap px-4 py-3.5 text-sm font-semibold text-sensei-ink border-b-2 border-sensei-ink flex-shrink-0" }}
                activeOptions={{ exact: true }}
              >
                {lang === "fr" ? cat.fr : cat.en}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sections d'articles ────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {category.sections.map((section) => {
          const articles = section.articles
            .map((slug) => HELP_ARTICLES.find((a) => a.slug === slug))
            .filter(Boolean) as typeof HELP_ARTICLES;

          return (
            <div key={section.fr} className="mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-6 items-start">
                {/* Label de section */}
                <h2 className="text-[17px] font-semibold text-sensei-ink pt-1">
                  {lang === "fr" ? section.fr : section.en}
                </h2>

                {/* Liste d'articles */}
                <div className="flex flex-col gap-2">
                  {articles.map((article) => (
                    <Link
                      key={article.slug}
                      to="/aide/$sujet/$article"
                      params={{ sujet: category.slug, article: article.slug }}
                      className="flex items-center justify-between gap-3 px-5 py-4 rounded-xl border border-sensei-line bg-white hover:border-sensei-bright hover:shadow-sm transition-all group"
                    >
                      <span className="text-sm text-sensei-text group-hover:text-sensei-ink">
                        {lang === "fr" ? article.fr.title : article.en.title}
                      </span>
                      <IconChevronRight />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
