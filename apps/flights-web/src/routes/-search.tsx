import { Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { SearchForm } from "../components/SearchForm";
import { useI18n } from "../i18n";
import { AIRLINES_ROW1, AIRLINES_ROW2, type Airline } from "./-airlines";

/* ── Payment logos ─────────────────────────────────────────── */
const PAY_ITEMS: { key: string; node: ReactNode }[] = [
  {
    key: "visa",
    node: (
      <svg viewBox="0 0 60 22" height="20" aria-label="Visa">
        <text x="1" y="19" fontFamily="'Helvetica Neue',Arial,sans-serif" fontSize="22" fontWeight="900" fontStyle="italic" fill="#1A1F71">VISA</text>
      </svg>
    ),
  },
  {
    key: "mastercard",
    node: (
      <svg viewBox="0 0 58 36" height="28" aria-label="Mastercard">
        <circle cx="20" cy="18" r="14" fill="#EB001B" />
        <circle cx="38" cy="18" r="14" fill="#F79E1B" />
        <path d="M29 7.3A14 14 0 0 1 38 18 14 14 0 0 1 29 28.7 14 14 0 0 1 20 18 14 14 0 0 1 29 7.3Z" fill="#FF5F00" />
      </svg>
    ),
  },
  {
    key: "mobile-money",
    node: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 28 28" height="26" aria-label="Mobile Money">
          <circle cx="14" cy="14" r="14" fill="#00A651" />
          <rect x="9" y="5" width="10" height="18" rx="2" fill="white" />
          <rect x="11" y="7" width="6" height="10" rx="1" fill="#00A651" />
          <circle cx="14" cy="20" r="1.2" fill="#00A651" />
        </svg>
        <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Mobile Money</span>
      </span>
    ),
  },
  {
    key: "paypal",
    node: (
      <svg viewBox="0 0 80 24" height="22" aria-label="PayPal">
        <text x="0" y="19" fontFamily="'Helvetica Neue',Arial,sans-serif" fontSize="19" fontWeight="700" fill="#003087">Pay</text>
        <text x="36" y="19" fontFamily="'Helvetica Neue',Arial,sans-serif" fontSize="19" fontWeight="700" fill="#009CDE">Pal</text>
      </svg>
    ),
  },
  {
    key: "klarna",
    node: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 70 24" height="20" aria-label="Klarna">
          <text x="0" y="19" fontFamily="'Helvetica Neue',Arial,sans-serif" fontSize="19" fontWeight="700" fill="#1C1C1C">klarna</text>
        </svg>
        <span className="w-4 h-4 rounded-full bg-[#FFB3C7] inline-block" />
      </span>
    ),
  },
  {
    key: "affirm",
    node: (
      <svg viewBox="0 0 68 24" height="20" aria-label="Affirm">
        <text x="0" y="19" fontFamily="'Helvetica Neue',Arial,sans-serif" fontSize="18" fontWeight="700" fill="#030A8C">affirm</text>
      </svg>
    ),
  },
  {
    key: "apple-pay",
    node: (
      <span className="flex items-center gap-1">
        <svg viewBox="0 0 24 24" height="20" fill="#111" aria-label="Apple Pay">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        <span className="text-sm font-semibold text-gray-900">Pay</span>
      </span>
    ),
  },
  {
    key: "sensei-pay",
    node: (
      <span className="flex items-center gap-1.5">
        <span className="w-5 h-5 rounded bg-violet-700 flex items-center justify-center text-white text-[10px] font-bold">S</span>
        <span className="text-sm font-bold text-violet-700 whitespace-nowrap">Sensei Pay</span>
      </span>
    ),
  },
  {
    key: "airtel",
    node: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 28 28" height="24" aria-label="Airtel Money">
          <circle cx="14" cy="14" r="14" fill="#E30613" />
          <text x="7" y="19" fontFamily="Arial,sans-serif" fontSize="11" fontWeight="900" fill="white">A</text>
        </svg>
        <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Airtel Money</span>
      </span>
    ),
  },
];

/* ── Airline logo with real image + IATA fallback ──────────── */
function AirlineLogo({ iata, color, size = 44 }: { iata: string; color: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm"
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

/* ── Airline card ─────────────────────────────────────────── */
function AirlineCard({ airline }: { airline: Airline }) {
  return (
    <Link
      to="/airlines/$slug"
      params={{ slug: airline.slug }}
      className="shrink-0 w-[72px] h-[72px] bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.06] flex items-center justify-center mx-2 hover:shadow-lg hover:ring-violet-200 hover:-translate-y-0.5 transition-all"
    >
      <AirlineLogo iata={airline.iata} color={airline.color} size={52} />
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════
   SearchPage
═══════════════════════════════════════════════════════════ */
export function SearchPage() {
  const { t, lang } = useI18n();

  const whyCards = [
    {
      kicker: lang === "fr" ? "RÉSERVEZ VOS VOLS" : "BOOK YOUR FLIGHTS",
      body:   lang === "fr"
        ? "Des billets depuis Kinshasa vers le monde entier, aux meilleurs prix du marché."
        : "Tickets from Kinshasa to the world, at the best market prices.",
      icon: (
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="24" fill="#DDD6FE"/>
          <path d="M10 24L32 14L27 24L32 34Z" fill="#7C3AED"/>
          <path d="M27 24L12 26.5" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M19 27L17 32L20 30" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      kicker: lang === "fr" ? "PAYER PLUS TARD" : "PAY LATER",
      body:   lang === "fr"
        ? "Réservez maintenant, payez en 3 ou 6 fois sans intérêts avec Sensei Pay."
        : "Book now, pay in 3 or 6 interest-free instalments with Sensei Pay.",
      icon: (
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="24" fill="#DDD6FE"/>
          <rect x="12" y="16" width="24" height="17" rx="3" stroke="#7C3AED" strokeWidth="2.5" fill="none"/>
          <path d="M12 22h24" stroke="#7C3AED" strokeWidth="2.5"/>
          <rect x="15" y="26" width="7" height="3" rx="1.5" fill="#7C3AED"/>
        </svg>
      ),
    },
    {
      kicker: lang === "fr" ? "SOUTIEN HUMAIN" : "HUMAN SUPPORT",
      body:   lang === "fr"
        ? "Une équipe basée à Kinshasa, disponible 7j/7 pour vous accompagner à chaque étape."
        : "A Kinshasa-based team available 7 days a week to guide you at every step.",
      icon: (
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="24" fill="#DDD6FE"/>
          <circle cx="24" cy="19" r="5" stroke="#7C3AED" strokeWidth="2.5" fill="none"/>
          <path d="M14 37c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 via-blue-50 to-white px-4 pt-8 pb-16">

        {/* Clouds décoratives */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="cloud-float absolute top-[18%] left-[5%] w-48 h-14 bg-white/70 rounded-full blur-xl opacity-80" />
          <div className="cloud-float-slow absolute top-[28%] right-[8%] w-64 h-16 bg-white/60 rounded-full blur-2xl opacity-70" />
          <div className="cloud-float absolute bottom-[32%] left-[14%] w-36 h-10 bg-white/50 rounded-full blur-xl opacity-60" />
          <div className="cloud-float-slow absolute bottom-[24%] right-[18%] w-52 h-12 bg-white/60 rounded-full blur-xl opacity-70" />
        </div>

        {/* Titre */}
        <div className="text-center mb-6 relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            {t("search.title")}
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-normal">{t("search.subtitle")}</p>
        </div>

        {/* Search form */}
        <SearchForm variant="light" />
      </section>

      {/* ════════════════════ PAYMENT STRIP ════════════════════ */}
      <div className="relative z-0 bg-white border-y border-gray-100 py-5 overflow-hidden select-none">
        <div className="pay-track">
          {[...PAY_ITEMS, ...PAY_ITEMS].map(({ key, node }, i) => (
            <div key={`${key}-${i}`} className="mx-10 flex items-center opacity-70 hover:opacity-100 transition-opacity">
              {node}
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════ BNPL PROMO ════════════════════ */}
      <section className="py-20 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-center">

          {/* Left visual */}
          <div
            className="relative h-72 md:h-96 rounded-3xl overflow-hidden flex items-end"
            style={{ background: "linear-gradient(155deg, #0ea5e9 0%, #6366f1 55%, #1e1b4b 100%)" }}
          >
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" fill="white" aria-hidden="true">
              <path d="M0 250 Q150 80 300 180 Q420 260 600 100 L600 400 L0 400Z" />
              <path d="M0 300 Q200 160 400 220 L600 150 L600 400 L0 400Z" opacity="0.6"/>
            </svg>
            <div className="relative m-5 w-full bg-white rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {lang === "fr" ? "Votre réservation" : "Your booking"}
                </p>
                <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-full uppercase tracking-wide">Sensei Pay</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-center">
                  <p className="text-xl font-black text-gray-900">FIH</p>
                  <p className="text-[10px] text-gray-400">Kinshasa</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-gray-300 text-sm">✈</div>
                  <div className="w-full h-px bg-gray-200" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-gray-900">JNB</p>
                  <p className="text-[10px] text-gray-400">Johannesburg</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400">{lang === "fr" ? "Total" : "Total"}</p>
                  <p className="text-sm font-bold text-gray-900">$320</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">{lang === "fr" ? "par versement" : "per instalment"}</p>
                  <p className="text-sm font-bold text-violet-700">3 × $107</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: text */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-5">
              {lang === "fr"
                ? "Retardez vos paiements, pas vos projets"
                : "Delay your payments, not your plans"}
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-8">
              {lang === "fr"
                ? "Avec Sensei Pay, réservez votre vol aujourd'hui et payez en 3 ou 6 versements sans intérêts. Votre billet est confirmé immédiatement."
                : "With Sensei Pay, book your flight today and pay in 3 or 6 interest-free instalments. Your ticket is confirmed instantly."}
            </p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-violet-700 text-white text-sm font-semibold rounded-full hover:bg-violet-800 transition-all shadow-lg shadow-violet-200 hover:shadow-violet-300 active:scale-95"
            >
              {lang === "fr" ? "Réserver maintenant" : "Book now"}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════ AIRLINES ════════════════════ */}
      <section className="py-16 overflow-hidden" style={{ backgroundColor: "#F0EFFE" }}>
        <div className="max-w-4xl mx-auto px-4 text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            {lang === "fr"
              ? "Nous avons vos compagnies aériennes\npréférées et bien plus encore"
              : "We have your favourite airlines\nand much more"}
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            {lang === "fr"
              ? "Choisissez parmi plus de 500 compagnies aériennes et payez comme vous voulez."
              : "Choose from 500+ airlines and pay however you like."}
          </p>
        </div>

        {/* Row 1 — scroll left */}
        <div className="overflow-hidden mb-4">
          <div className="pay-track" style={{ animationDuration: "36s" }}>
            {[...AIRLINES_ROW1, ...AIRLINES_ROW1].map((a, i) => (
              <AirlineCard key={`${a.slug}-${i}`} airline={a} />
            ))}
          </div>
        </div>

        {/* Row 2 — scroll right */}
        <div className="overflow-hidden">
          <div className="pay-track-reverse" style={{ animationDuration: "40s" }}>
            {[...AIRLINES_ROW2, ...AIRLINES_ROW2].map((a, i) => (
              <AirlineCard key={`${a.slug}-${i}`} airline={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ WHY — lavender cards ════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {whyCards.map((card) => (
              <div key={card.kicker} className="bg-[#EDEDFF] rounded-3xl p-8">
                <div className="mb-5">{card.icon}</div>
                <p className="text-[10px] font-black text-violet-500 uppercase tracking-[0.15em] mb-3">{card.kicker}</p>
                <p className="text-gray-900 font-bold text-xl leading-snug">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
