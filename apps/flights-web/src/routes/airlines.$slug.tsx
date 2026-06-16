import { createFileRoute, Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { SearchForm } from "../components/SearchForm";
import { useI18n } from "../i18n";
import { airlineBySlug, AIRLINES } from "./-airlines";
import { getAirlineContent } from "./-airlines-content";

export const Route = createFileRoute("/airlines/$slug")({
  component: AirlinePage,
});

/* ── Airline logo with real image + IATA fallback ──────────── */
function AirlineLogo({ iata, color, size = 44 }: { iata: string; color: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0"
        style={{ width: size, height: size, backgroundColor: color }}
      >
        {iata}
      </div>
    );
  }
  return (
    <img
      src={`https://pics.avs.io/${size * 2}/${size * 2}/${iata}.png`}
      alt={iata}
      width={size}
      height={size}
      className="rounded-xl object-contain shrink-0 bg-white"
      onError={() => setFailed(true)}
    />
  );
}

/* ── Accordion FAQ ─────────────────────────────────────────── */
function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-gray-100">
      {items.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left gap-4 group"
          >
            <span className="text-sm font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
              {item.q}
            </span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              className={`shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          {open === i && (
            <div className="pb-4 text-sm text-gray-600 leading-relaxed">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Section wrapper ───────────────────────────────────────── */
function Section({ title, children, bg = "bg-white" }: { title?: string; children: ReactNode; bg?: string }) {
  return (
    <section className={`py-12 ${bg}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {title && <h2 className="text-2xl font-extrabold text-gray-900 mb-7">{title}</h2>}
        {children}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ */
function AirlinePage() {
  const { slug } = Route.useParams();
  const airline = airlineBySlug(slug);
  const content = getAirlineContent(slug);
  const { lang } = useI18n();

  if (!airline) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-gray-900">
          {lang === "fr" ? "Compagnie introuvable" : "Airline not found"}
        </p>
        <Link to="/" className="text-violet-700 font-semibold hover:underline">
          {lang === "fr" ? "← Retour à l'accueil" : "← Back to home"}
        </Link>
      </div>
    );
  }

  const similar = (content?.similarSlugs ?? [])
    .map((s) => airlineBySlug(s))
    .filter(Boolean);

  return (
    <>
      {/* ════════════ HERO ════════════ */}
      <section
        className="relative min-h-[88vh] flex flex-col items-center justify-center px-4 pt-8 pb-16"
        style={{ background: `linear-gradient(160deg, ${airline.heroFrom} 0%, ${airline.heroTo} 100%)` }}
      >
        {/* Texture subtile */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
          aria-hidden="true"
        />

        {/* Logo badge */}
        <div className="relative z-10 mb-5 flex flex-col items-center">
          <div className="bg-white rounded-2xl px-8 py-4 shadow-xl mb-5 flex items-center gap-3">
            <AirlineLogo iata={airline.iata} color={airline.color} size={48} />
            <span className="text-lg font-bold text-gray-900">{airline.name}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white text-center tracking-tight leading-tight mb-2 max-w-3xl">
            {lang === "fr"
              ? `Recherche et réserve des vols avec ${airline.name}`
              : `Search & book flights with ${airline.name}`}
          </h1>
          <p className="text-white/60 text-base mt-2 text-center">
            {lang === "fr"
              ? "Payez en 3 ou 6 fois sans intérêts avec Sensei Pay"
              : "Pay in 3 or 6 interest-free instalments with Sensei Pay"}
          </p>
        </div>

        {/* Formulaire de recherche */}
        <SearchForm variant="dark" />
      </section>

      {/* ════════════ DESCRIPTION ════════════ */}
      {content && (
        <Section>
          <div className="flex gap-4 items-start">
            <AirlineLogo iata={airline.iata} color={airline.color} size={48} />
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-3">
                {lang === "fr" ? `Achetez des vols ${airline.name} avec Sensei Flights` : `Buy ${airline.name} flights with Sensei Flights`}
              </h2>
              <p className="text-gray-600 leading-relaxed">{content.descriptionFr}</p>
            </div>
          </div>
        </Section>
      )}

      {/* ════════════ POURQUOI RÉSERVER ════════════ */}
      {content && (
        <Section title={lang === "fr" ? `Pourquoi réserver des vols ${airline.name} ? ✨` : `Why book ${airline.name} flights? ✨`} bg="bg-[#F8F7FF]">
          <ul className="grid sm:grid-cols-2 gap-3">
            {content.whyBookFr.map((item, i) => (
              <li key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm ring-1 ring-gray-100">
                <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5" style={{ backgroundColor: airline.color }}>✓</span>
                <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ════════════ DESTINATIONS ════════════ */}
      {content && (
        <Section title={lang === "fr" ? `Destinations et réseau d'itinéraires de ${airline.name} 🌍` : `${airline.name} destinations & route network 🌍`}>
          <p className="text-gray-600 mb-6 leading-relaxed">{content.destinationsFr.coverage}</p>

          <h3 className="text-base font-bold text-gray-900 mb-4">{lang === "fr" ? "Principales destinations ✨" : "Key destinations ✨"}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {content.destinationsFr.regions.map((r) => (
              <div key={r.region} className="bg-[#EDEDFF] rounded-xl p-4">
                <p className="text-xs font-black text-violet-600 uppercase tracking-widest mb-2">{r.region}</p>
                <p className="text-sm text-gray-700">{r.cities.join(" · ")}</p>
              </div>
            ))}
          </div>

          {content.destinationsFr.popularRoutes.length > 0 && (
            <>
              <h3 className="text-base font-bold text-gray-900 mb-3">{lang === "fr" ? "Itinéraires populaires 😍" : "Popular routes 😍"}</h3>
              <ul className="space-y-2">
                {content.destinationsFr.popularRoutes.map((route, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-violet-500">✈</span> {route}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>
      )}

      {/* ════════════ TARIFS ════════════ */}
      {content && (
        <Section title={lang === "fr" ? `Prix des vols ${airline.name} 💰` : `${airline.name} flight prices 💰`} bg="bg-[#F8F7FF]">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 ring-1 ring-gray-100">
              <p className="text-xs font-black text-violet-600 uppercase tracking-widest mb-2">💺 {lang === "fr" ? "Classe Économique" : "Economy"}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{content.pricingFr.economy}</p>
            </div>
            <div className="bg-white rounded-xl p-5 ring-1 ring-gray-100">
              <p className="text-xs font-black text-violet-600 uppercase tracking-widest mb-2">💎 {lang === "fr" ? "Classe Affaires" : "Business Class"}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{content.pricingFr.business}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 ring-1 ring-gray-100 mb-4">
            <p className="text-xs font-black text-violet-600 uppercase tracking-widest mb-2">🤩 {lang === "fr" ? "Meilleur moment pour réserver" : "Best time to book"}</p>
            <p className="text-sm text-gray-700">{content.pricingFr.bestTime}</p>
          </div>
          <div className="bg-white rounded-xl p-5 ring-1 ring-gray-100 mb-6">
            <p className="text-xs font-black text-violet-600 uppercase tracking-widest mb-2">🧐 {lang === "fr" ? "Basse saison" : "Low season"}</p>
            <p className="text-sm text-gray-700">{content.pricingFr.lowSeason}</p>
          </div>

          <h3 className="text-base font-bold text-gray-900 mb-3">{lang === "fr" ? "Comment économiser ? 🤑" : "How to save? 🤑"}</h3>
          <ul className="space-y-2">
            {content.pricingFr.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-violet-500 mt-0.5">→</span> {tip}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ════════════ COMMENT RÉSERVER ════════════ */}
      {content && (
        <Section title={lang === "fr" ? `Comment réserver un vol ${airline.name} ? 🔎` : `How to book ${airline.name}? 🔎`}>
          <div className="space-y-4">
            {content.howToBookFr.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: airline.color }}>
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ════════════ BNPL PROMO ════════════ */}
      <section className="py-14" style={{ backgroundColor: airline.heroFrom + "22" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0"
            style={{ backgroundColor: airline.color }}
          >
            S
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-violet-600 uppercase tracking-widest mb-1">Sensei Pay</p>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">
              {lang === "fr" ? "Achetez maintenant, payez plus tard" : "Buy now, pay later"}
            </h3>
            <p className="text-sm text-gray-600">
              {lang === "fr"
                ? "Réservez votre billet aujourd'hui et payez en 3 ou 6 versements sans intérêts. Confirmation immédiate."
                : "Book your ticket today and pay in 3 or 6 interest-free instalments. Instant confirmation."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="shrink-0 px-6 py-3 text-sm font-semibold text-white rounded-full transition-all"
            style={{ backgroundColor: airline.color }}
          >
            {lang === "fr" ? "Réserver →" : "Book now →"}
          </button>
        </div>
      </section>

      {/* ════════════ CLASSES DE CABINE ════════════ */}
      {content && content.cabinClassesFr.length > 0 && (
        <Section title={lang === "fr" ? `Classes de cabine de ${airline.name} ✨` : `${airline.name} cabin classes ✨`}>
          <div className="grid md:grid-cols-3 gap-5">
            {content.cabinClassesFr.map((cabin, i) => (
              <div key={i} className="bg-[#EDEDFF] rounded-2xl p-6">
                <p className="text-xs font-black text-violet-600 uppercase tracking-widest mb-3">
                  {["💺", "💎", "👑"][i] ?? "✈"} {cabin.name}
                </p>
                <ul className="space-y-2">
                  {cabin.features.map((f, j) => (
                    <li key={j} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                      <span className="text-violet-400 shrink-0 mt-0.5">•</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ════════════ BAGAGES ════════════ */}
      {content && (
        <Section title={lang === "fr" ? `Franchise de bagages de ${airline.name} 🧳` : `${airline.name} baggage allowance 🧳`} bg="bg-[#F8F7FF]">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl p-5 ring-1 ring-gray-100">
              <p className="text-xs font-black text-violet-600 uppercase tracking-widest mb-3">🎒 {lang === "fr" ? "Bagage cabine" : "Carry-on"}</p>
              <ul className="space-y-1.5">
                {content.baggageFr.carryon.map((b, i) => (
                  <li key={i} className="text-sm text-gray-700">→ {b}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-5 ring-1 ring-gray-100">
              <p className="text-xs font-black text-violet-600 uppercase tracking-widest mb-3">🧳 {lang === "fr" ? "Bagages enregistrés" : "Checked baggage"}</p>
              <ul className="space-y-1.5">
                {content.baggageFr.checked.map((b, i) => (
                  <li key={i} className="text-sm text-gray-700">→ {b}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      )}

      {/* ════════════ ACTUALITÉS ════════════ */}
      {content?.latestNewsFr && content.latestNewsFr.length > 0 && (
        <Section title={lang === "fr" ? `Dernières mises à jour de ${airline.name}` : `Latest ${airline.name} news`}>
          <div className="space-y-3">
            {content.latestNewsFr.map((news, i) => (
              <div key={i} className="bg-[#EDEDFF] rounded-xl px-5 py-4 text-sm text-gray-800 leading-relaxed">
                {news}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ════════════ FAQ ════════════ */}
      {content && content.faqFr.length > 0 && (
        <Section title={lang === "fr" ? "Questions fréquemment posées" : "Frequently asked questions"} bg="bg-[#F8F7FF]">
          <div className="bg-white rounded-2xl px-6 py-2 ring-1 ring-gray-100">
            <FaqAccordion items={content.faqFr} />
          </div>
        </Section>
      )}

      {/* ════════════ COMPAGNIES SIMILAIRES ════════════ */}
      {similar.length > 0 && (
        <Section title={lang === "fr" ? `Alternatives à ${airline.name}` : `Alternatives to ${airline.name}`}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {similar.map((a) => a && (
              <Link
                key={a.slug}
                to="/airlines/$slug"
                params={{ slug: a.slug }}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-4 hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-md transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                  style={{ backgroundColor: a.color }}
                >
                  {a.iata}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.iata}</p>
                </div>
                <svg className="ml-auto text-gray-300 group-hover:text-violet-400 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            ))}
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900 transition-colors"
          >
            {lang === "fr" ? "Voir toutes les compagnies aériennes →" : "See all airlines →"}
          </Link>
        </Section>
      )}

      {/* ════════════ TOUTES LES COMPAGNIES (fallback) ════════════ */}
      {similar.length === 0 && (
        <Section title={lang === "fr" ? "Autres compagnies disponibles" : "Other available airlines"}>
          <div className="flex flex-wrap gap-3">
            {AIRLINES.filter((a) => a.slug !== slug).slice(0, 12).map((a) => (
              <Link
                key={a.slug}
                to="/airlines/$slug"
                params={{ slug: a.slug }}
                className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:border-violet-300 hover:bg-violet-50 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0" style={{ backgroundColor: a.color }}>
                  {a.iata}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-violet-700 transition-colors">{a.name}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
