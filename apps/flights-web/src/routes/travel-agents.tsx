import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "../i18n";
import { AIRLINES } from "./-airlines";

export const Route = createFileRoute("/travel-agents")({
  component: TravelAgentsPage,
});

/* ── FAQ accordion ─────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: "Comment rejoindre le programme Agences de voyage Sensei Flights ?",
    a: "Remplissez le formulaire d'inscription ci-dessus. Notre équipe vous contactera sous 24h pour valider votre accès à notre portail B2B.",
  },
  {
    q: "Quels sont les avantages de la billetterie prioritaire ?",
    a: "Toutes les réservations effectuées via notre portail agences sont émises au niveau de priorité le plus élevé, garantissant une confirmation immédiate même en période de forte demande.",
  },
  {
    q: "Proposez-vous des commissions sur les ventes ?",
    a: "Oui, notre programme partenaires propose des commissions compétitives. Les détails sont communiqués lors de l'onboarding de votre agence.",
  },
  {
    q: "Y a-t-il un accès à Sensei Pay (BNPL) pour mes clients ?",
    a: "Absolument. Vos clients peuvent payer leurs billets en 3 ou 6 versements sans intérêts grâce à Sensei Pay, directement depuis votre interface.",
  },
  {
    q: "Quelles compagnies aériennes puis-je réserver pour mes clients ?",
    a: "Sensei Flights donne accès à plus de 500 compagnies aériennes mondiales, y compris les grandes lignes internationales et les compagnies régionales.",
  },
];

function FaqAccordion({ items }: { items: typeof FAQ_ITEMS }) {
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
            <p className="pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
function TravelAgentsPage() {
  const { lang } = useI18n();

  const benefits = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.1 8.62a16 16 0 006.29 6.29l1.94-1.14a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
        </svg>
      ),
      title: "Service client dédié",
      desc: "Notre équipe expérimentée est disponible 7 jours sur 7 pour répondre à toutes vos questions et résoudre tout incident rapidement.",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
        </svg>
      ),
      title: "Options de vols uniques",
      desc: "En plus des grands transporteurs internationaux, nous émettons également des billets pour les petites compagnies régionales. Nous avons tout prévu !",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      title: "Billetterie prioritaire",
      desc: "Toutes les réservations B2B sont émises avec le niveau de priorité le plus élevé. Vos clients ont toujours la confirmation en premier.",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      title: "Reconnu mondialement",
      desc: "Évaluation «excellente» sur Trustpilot. Des millions de voyageurs font confiance à Sensei Flights chaque année.",
    },
  ];

  const team = [
    { name: "Emily Haines",  role: lang === "fr" ? "Responsable de l'équipe du service client" : "Customer Service Team Lead",  initials: "EH", color: "#7C3AED" },
    { name: "Lola Jones",    role: lang === "fr" ? "Agent du service clientèle" : "Customer Service Agent",                       initials: "LJ", color: "#0EA5E9" },
    { name: "Fran Kadid",    role: lang === "fr" ? "Agent du service clientèle" : "Customer Service Agent",                       initials: "FK", color: "#10B981" },
  ];

  return (
    <>
      {/* ════════════ HERO ════════════ */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 pt-16 pb-20 bg-gradient-to-br from-[#1a0e3a] via-[#2d1b6e] to-[#1e3a5f] overflow-hidden">
        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} aria-hidden="true" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span className="text-white/80 text-xs font-semibold tracking-wide uppercase">
              {lang === "fr" ? "Programme Agences de voyage" : "Travel Agent Program"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5">
            {lang === "fr"
              ? "Réserver des vols pour vos clients n'a jamais été aussi simple"
              : "Booking flights for your clients has never been easier"}
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            {lang === "fr"
              ? "Rejoignez notre réseau d'agences partenaires et offrez à vos clients les meilleures options de vols mondiales."
              : "Join our partner agency network and offer your clients the best global flight options."}
          </p>

          {/* 3 benefit chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {[
              lang === "fr" ? "✅ Des réservations simples" : "✅ Simple bookings",
              lang === "fr" ? "🎫 Billetterie prioritaire" : "🎫 Priority ticketing",
              lang === "fr" ? "🎧 Service d'assistance dédié" : "🎧 Dedicated support",
            ].map((chip) => (
              <span key={chip} className="bg-white/15 border border-white/25 text-white text-sm font-medium px-4 py-2 rounded-full">
                {chip}
              </span>
            ))}
          </div>

          <a
            href="#register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-500 hover:bg-violet-400 text-white font-bold rounded-full transition-all shadow-lg shadow-violet-900/40 hover:shadow-violet-500/40 text-sm"
          >
            {lang === "fr" ? "Devenir partenaire →" : "Become a partner →"}
          </a>
        </div>
      </section>

      {/* ════════════ AVANTAGES ════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              {lang === "fr" ? "Pourquoi choisir Sensei Flights ?" : "Why choose Sensei Flights?"}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              {lang === "fr"
                ? "Des outils pensés pour les professionnels du voyage, avec un support humain réel."
                : "Tools built for travel professionals, with genuine human support."}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className="bg-[#EDEDFF] rounded-2xl p-6">
                <div className="mb-4">{b.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{b.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ ÉQUIPE ════════════ */}
      <section className="py-16 bg-[#F8F7FF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              {lang === "fr" ? "Rencontrez l'équipe" : "Meet the team"}
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">
              {lang === "fr"
                ? "Notre équipe d'experts est à votre disposition pour répondre à toutes vos questions."
                : "Our expert team is on hand to answer all your questions."}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl p-6 text-center shadow-sm ring-1 ring-gray-100">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-black"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">{member.name}</p>
                <p className="text-xs text-gray-500 leading-tight">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ AIRLINES STRIP ════════════ */}
      <section className="py-14 bg-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 text-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            {lang === "fr" ? "Choisissez parmi plus de 500 compagnies aériennes" : "Choose from 500+ airlines"}
          </h2>
          <p className="text-gray-500 text-sm">
            {lang === "fr"
              ? "Grands transporteurs internationaux et compagnies régionales — tout est disponible."
              : "Major international carriers and regional airlines — all available."}
          </p>
        </div>
        <div className="overflow-hidden select-none">
          <div className="pay-track" style={{ animationDuration: "36s" }}>
            {[...AIRLINES, ...AIRLINES].map((a, i) => (
              <Link
                key={`${a.slug}-${i}`}
                to="/airlines/$slug"
                params={{ slug: a.slug }}
                className="shrink-0 mx-2 w-[60px] h-[60px] bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm hover:border-violet-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0"
                  style={{ backgroundColor: a.color }}
                >
                  {a.iata}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FORMULAIRE D'INSCRIPTION ════════════ */}
      <section id="register" className="py-16 bg-[#F8F7FF]">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              {lang === "fr" ? "Rejoindre le programme" : "Join the program"}
            </h2>
            <p className="text-gray-500 text-sm">
              {lang === "fr"
                ? "Remplissez ce formulaire et notre équipe vous contactera sous 24h."
                : "Fill out this form and our team will reach out within 24h."}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  {lang === "fr" ? "Prénom" : "First name"}
                </label>
                <input
                  type="text"
                  placeholder={lang === "fr" ? "Jean" : "John"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  {lang === "fr" ? "Nom" : "Last name"}
                </label>
                <input
                  type="text"
                  placeholder={lang === "fr" ? "Dupont" : "Smith"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                {lang === "fr" ? "Agence de voyage" : "Travel agency"}
              </label>
              <input
                type="text"
                placeholder={lang === "fr" ? "Nom de votre agence" : "Your agency name"}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                {lang === "fr" ? "Adresse e-mail" : "Email address"}
              </label>
              <input
                type="email"
                placeholder="vous@agence.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                {lang === "fr" ? "Téléphone / WhatsApp" : "Phone / WhatsApp"}
              </label>
              <input
                type="tel"
                placeholder="+243 8xx xxx xxx"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                {lang === "fr" ? "Message (facultatif)" : "Message (optional)"}
              </label>
              <textarea
                rows={3}
                placeholder={lang === "fr" ? "Parlez-nous de votre activité..." : "Tell us about your business..."}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none"
              />
            </div>
            <button
              type="button"
              className="w-full py-3.5 bg-violet-700 hover:bg-violet-800 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-violet-200 hover:shadow-violet-300 active:scale-95"
            >
              {lang === "fr" ? "Envoyer ma demande →" : "Send my request →"}
            </button>
            <p className="text-center text-xs text-gray-400">
              {lang === "fr"
                ? "Nous ne partageons jamais vos données. Réponse sous 24h."
                : "We never share your data. Response within 24h."}
            </p>
          </div>
        </div>
      </section>

      {/* ════════════ FAQ ════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
            {lang === "fr" ? "Tu as des questions ?" : "Got questions?"}
          </h2>
          <div className="bg-white rounded-2xl px-6 py-2 ring-1 ring-gray-100 shadow-sm">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            {lang === "fr" ? "Vous ne trouvez pas la réponse ? " : "Can't find the answer? "}
            <Link to="/" className="text-violet-700 font-semibold hover:underline">
              {lang === "fr" ? "Contactez-nous →" : "Contact us →"}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
