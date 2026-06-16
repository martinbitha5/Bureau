import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { getArticle, getCategory, HELP_ARTICLES } from "../data/help-articles";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/aide/$sujet/$article")({
  component: ArticlePage,
});

function IconThumbUp({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" strokeLinejoin="round" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" strokeLinejoin="round" />
    </svg>
  );
}
function IconThumbDown({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" strokeLinejoin="round" />
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" strokeLinejoin="round" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArticlePage() {
  const { sujet, article: articleSlug } = useParams({ from: "/aide/$sujet/$article" });
  const { lang } = useI18n();
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  const article = getArticle(articleSlug);
  const category = getCategory(sujet);

  const relatedArticles = article
    ? article.related
        .map((slug) => HELP_ARTICLES.find((a) => a.slug === slug))
        .filter(Boolean) as typeof HELP_ARTICLES
    : [];

  if (!article || !category) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-sensei-muted">Article introuvable.</p>
        <Link to="/aide" className="mt-4 inline-block text-sensei-bright hover:underline text-sm">
          ← Retour au centre d'aide
        </Link>
      </div>
    );
  }

  const content = lang === "fr" ? article.fr : article.en;
  const tag = lang === "fr" ? article.tag.fr : article.tag.en;
  const catLabel = lang === "fr" ? category.fr : category.en;

  return (
    <div className="bg-white">
      {/* ── Hero mini ──────────────────────────────────────────────── */}
      <div
        className="relative px-6 pt-8 pb-12"
        style={{ background: "linear-gradient(160deg, #0d0e21 0%, #1a2151 50%, #2a1a5e 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(100,80,200,0.25) 0%, transparent 70%)" }}
        />
        <div className="relative max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/50 text-sm flex-wrap">
            <Link to="/aide" className="hover:text-white transition-colors">
              Centre d'aide
            </Link>
            <span>›</span>
            <Link
              to="/aide/$sujet"
              params={{ sujet }}
              className="hover:text-white transition-colors"
            >
              {catLabel}
            </Link>
            <span>›</span>
            <span className="text-white/80 truncate max-w-[24ch]">{content.title}</span>
          </nav>
        </div>
      </div>

      {/* ── Contenu principal ───────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">

          {/* ── Colonne principale ── */}
          <article>
            <h1 className="text-3xl sm:text-4xl font-bold text-sensei-ink tracking-tight mb-5 leading-tight">
              {content.title}
            </h1>

            {/* Tag */}
            <span className="inline-block px-3 py-1 bg-sensei-paper border border-sensei-line rounded-full text-xs font-semibold text-sensei-muted mb-7">
              {tag}
            </span>

            {/* Corps */}
            <div className="flex flex-col gap-5">
              {content.paras.map((para, i) => (
                <p key={i} className="text-[15px] text-sensei-text leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* Feedback ── "Cet article vous a-t-il été utile ?" */}
            <div className="mt-12 pt-8 border-t border-sensei-line">
              {feedback === null ? (
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm text-sensei-muted">
                    {lang === "fr" ? "Cet article a-t-il été utile ?" : "Was this article helpful?"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFeedback("yes")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-sensei-line text-sm text-sensei-text hover:border-sensei-bright hover:text-sensei-bright transition-colors"
                    >
                      <IconThumbUp /> {lang === "fr" ? "Oui" : "Yes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedback("no")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-sensei-line text-sm text-sensei-text hover:border-sensei-bright hover:text-sensei-bright transition-colors"
                    >
                      <IconThumbDown /> {lang === "fr" ? "Non" : "No"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-sensei-muted">
                  {feedback === "yes"
                    ? (lang === "fr" ? "Merci pour votre retour !" : "Thanks for your feedback!")
                    : (lang === "fr" ? "Merci. Nous allons améliorer cet article." : "Thanks. We'll improve this article.")}
                </p>
              )}
            </div>
          </article>

          {/* ── Sidebar Articles Connexes ── */}
          <aside>
            <div className="lg:sticky lg:top-24">
              <h3 className="text-base font-bold text-sensei-ink mb-4">
                {lang === "fr" ? "Articles Connexes" : "Related Articles"}
              </h3>
              <div className="flex flex-col gap-2">
                {relatedArticles.map((rel) => {
                  const relCat = rel.category;
                  return (
                    <Link
                      key={rel.slug}
                      to="/aide/$sujet/$article"
                      params={{ sujet: relCat, article: rel.slug }}
                      className="flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl border border-sensei-line bg-white hover:border-sensei-bright hover:shadow-sm transition-all group"
                    >
                      <span className="text-sm text-sensei-text group-hover:text-sensei-ink leading-snug">
                        {lang === "fr" ? rel.fr.title : rel.en.title}
                      </span>
                      <IconChevronRight />
                    </Link>
                  );
                })}
                {/* Lien vers la catégorie parente */}
                <Link
                  to="/aide/$sujet"
                  params={{ sujet }}
                  className="mt-3 text-sm font-semibold text-sensei-bright hover:underline"
                >
                  {lang === "fr" ? `← Retour à « ${catLabel} »` : `← Back to "${catLabel}"`}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
