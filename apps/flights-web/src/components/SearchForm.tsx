import { type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AirportInput } from "./AirportInput";
import { DateRangePicker } from "./DateRangePicker";
import { useI18n } from "../i18n";

type TripType = "round" | "oneway" | "multi";
type ActivePanel = null | "dates" | "pax";

function fmtDate(iso: string, locale: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString(locale, {
    weekday: "short", day: "numeric", month: "short",
  });
}

interface Props {
  variant?: "light" | "dark";
  initialOrigin?: string;
  initialDestination?: string;
}

export function SearchForm({ variant = "light", initialOrigin = "FIH", initialDestination = "JNB" }: Props) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const locale = lang === "fr" ? "fr-FR" : "en-GB";
  const isDark = variant === "dark";

  const [tripType, setTripType]       = useState<TripType>("round");
  const [origin, setOrigin]           = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [departDate, setDepartDate]   = useState("2026-08-15");
  const [returnDate, setReturnDate]   = useState("2026-08-22");
  const [passengers, setPassengers]   = useState(1);
  const [children, setChildren]       = useState(0);
  const [babies, setBabies]           = useState(0);
  const [cabin, setCabin]             = useState<"economy" | "premium" | "business">("economy");
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function go(o: string, d: string) {
    if (!o || !d) return;
    navigate({
      to: "/results",
      search: {
        origin: o, destination: d, departDate,
        returnDate: tripType === "round" ? returnDate : "",
        tripType: tripType === "multi" ? "oneway" : tripType,
        passengers, cabin,
      },
    });
  }

  const trips: { key: TripType; label: string }[] = [
    { key: "round",  label: lang === "fr" ? "Aller-retour"       : "Return" },
    { key: "oneway", label: lang === "fr" ? "Aller simple"       : "One-way" },
    { key: "multi",  label: lang === "fr" ? "Multi-destinations" : "Multi-city" },
  ];

  const cabinLabels = {
    economy:  lang === "fr" ? "Économie" : "Economy",
    premium:  "Premium",
    business: lang === "fr" ? "Affaires" : "Business",
  };

  const datesLabel = tripType === "round"
    ? `${fmtDate(departDate, locale)} – ${fmtDate(returnDate, locale)}`
    : fmtDate(departDate, locale);

  const paxLabel = (() => {
    const parts = [
      `${passengers} ${lang === "fr" ? (passengers > 1 ? "Adultes" : "Adulte") : (passengers > 1 ? "Adults" : "Adult")}`,
    ];
    if (children > 0) parts.push(`${children} ${lang === "fr" ? (children > 1 ? "Enfants" : "Enfant") : (children > 1 ? "Children" : "Child")}`);
    if (babies > 0)   parts.push(`${babies} ${lang === "fr" ? (babies > 1 ? "Bébés" : "Bébé") : (babies > 1 ? "Infants" : "Infant")}`);
    parts.push(cabinLabels[cabin]);
    return parts.join(", ");
  })();

  const paxRows = [
    { key: "adults",   label: lang === "fr" ? "Adultes"  : "Adults",   sub: lang === "fr" ? "12 ans et plus" : "12 years and over", value: passengers, min: 1, max: 9, set: setPassengers },
    { key: "children", label: lang === "fr" ? "Enfants"  : "Children", sub: lang === "fr" ? "De 2 à 11 ans"  : "Aged 2 to 11",      value: children,   min: 0, max: 9, set: setChildren },
    { key: "babies",   label: lang === "fr" ? "Bébés"    : "Infants",  sub: lang === "fr" ? "Moins de 2 ans" : "Under 2",           value: babies,     min: 0, max: 9, set: setBabies },
  ];

  return (
    <div ref={wrapRef} className="w-full max-w-5xl relative z-10">

      {/* Trip type tabs */}
      <div className={`flex items-center justify-center gap-0.5 mb-3 rounded-full p-1 w-fit mx-auto ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
        {trips.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            disabled={key === "multi"}
            onClick={() => setTripType(key)}
            className={[
              "px-5 py-2 rounded-full text-sm font-medium transition-all",
              tripType === key
                ? "bg-white text-violet-700 font-semibold shadow-sm"
                : key === "multi"
                ? isDark ? "text-white/30 cursor-not-allowed" : "text-gray-300 cursor-not-allowed"
                : isDark ? "text-white/75 hover:text-white" : "text-gray-500 hover:text-gray-800",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search card */}
      <form onSubmit={(e: FormEvent) => { e.preventDefault(); go(origin, destination); }}>
        <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/[0.06]">
          <div className="flex items-stretch min-h-[76px]">

            {/* Origin */}
            <div className="flex-1 min-w-0 flex flex-col justify-center px-5 py-3 relative">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("search.origin")}</span>
              <div className="flex items-center gap-2">
                <AirportInput id="sf-origin" value={origin} onChange={setOrigin} placeholder={lang === "fr" ? "Ville ou aéroport" : "City or airport"} lang={lang} />
                {origin && <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-700 text-[10px] font-bold tracking-wide">{origin}</span>}
              </div>
            </div>

            {/* Swap */}
            <div className="flex items-center px-1 shrink-0 border-l border-gray-100">
              <button type="button" onClick={() => { const t = origin; setOrigin(destination); setDestination(t); }} className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all shadow-sm" aria-label="Inverser">⇄</button>
            </div>

            {/* Destination */}
            <div className="flex-1 min-w-0 flex flex-col justify-center px-5 py-3 border-l border-gray-100 relative">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("search.destination")}</span>
              <div className="flex items-center gap-2">
                <AirportInput id="sf-destination" value={destination} onChange={setDestination} placeholder={lang === "fr" ? "Ville ou aéroport" : "City or airport"} lang={lang} />
                {destination && <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-700 text-[10px] font-bold tracking-wide">{destination}</span>}
              </div>
            </div>

            {/* Dates */}
            <button type="button" onClick={() => setActivePanel(activePanel === "dates" ? null : "dates")}
              className={["flex flex-col justify-center px-5 py-3 border-l border-gray-100 min-w-[170px] text-left transition-colors", activePanel === "dates" ? "bg-violet-50/60" : "hover:bg-gray-50/80"].join(" ")}
            >
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{lang === "fr" ? "Dates" : "Dates"}</span>
              <span className="text-sm font-semibold text-gray-900 leading-tight truncate">{datesLabel || "—"}</span>
            </button>

            {/* Passengers */}
            <button type="button" onClick={() => setActivePanel(activePanel === "pax" ? null : "pax")}
              className={["flex flex-col justify-center px-5 py-3 border-l border-gray-100 min-w-[160px] text-left transition-colors", activePanel === "pax" ? "bg-violet-50/60" : "hover:bg-gray-50/80"].join(" ")}
            >
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{lang === "fr" ? "Passagers & Classe" : "Passengers"}</span>
              <span className="text-sm font-semibold text-gray-900 leading-tight truncate">{paxLabel}</span>
            </button>

            {/* Search button */}
            <div className="flex items-center px-4 border-l border-gray-100">
              <button type="submit" disabled={!origin || !destination}
                className="w-12 h-12 rounded-full bg-violet-700 hover:bg-violet-800 disabled:opacity-40 flex items-center justify-center text-white shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all active:scale-95"
                aria-label="Rechercher"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Date picker */}
        {activePanel === "dates" && (
          <DateRangePicker
            start={departDate}
            end={tripType === "round" ? returnDate : ""}
            isRange={tripType === "round"}
            lang={lang}
            onSelect={(s, e) => { setDepartDate(s); if (tripType === "round") setReturnDate(e); }}
            onClose={() => setActivePanel(null)}
          />
        )}

        {/* Pax panel */}
        {activePanel === "pax" && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl ring-1 ring-black/[0.06] p-6 z-50">
            {paxRows.map((row) => (
              <div key={row.key} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-b-0">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{row.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{row.sub}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => row.set(Math.max(row.min, row.value - 1))} disabled={row.value <= row.min} className="w-8 h-8 rounded-full border border-gray-200 text-gray-600 font-bold flex items-center justify-center hover:border-violet-400 hover:text-violet-700 disabled:opacity-30 transition-colors">−</button>
                  <span className="text-sm font-bold text-gray-900 w-4 text-center">{row.value}</span>
                  <button type="button" onClick={() => row.set(Math.min(row.max, row.value + 1))} disabled={row.value >= row.max} className="w-8 h-8 rounded-full border border-gray-200 text-gray-600 font-bold flex items-center justify-center hover:border-violet-400 hover:text-violet-700 disabled:opacity-30 transition-colors">+</button>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{lang === "fr" ? "Classe" : "Cabin class"}</label>
              <select value={cabin} onChange={(e) => setCabin(e.target.value as typeof cabin)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white appearance-none">
                <option value="economy">{cabinLabels.economy}</option>
                <option value="premium">{cabinLabels.premium}</option>
                <option value="business">{cabinLabels.business}</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setActivePanel(null)} className="text-sm font-semibold text-violet-700 hover:text-violet-900 transition-colors">{lang === "fr" ? "Terminé" : "Done"}</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
