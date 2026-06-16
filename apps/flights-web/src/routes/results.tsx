import { createFileRoute } from "@tanstack/react-router";
import { flightSearchOptions } from "@sensei/api-client";
import { formatCents } from "@sensei/utils";
import { useQuery } from "@tanstack/react-query";
import { Link, getRouteApi } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { airportByCode } from "../data/airports";
import { useI18n } from "../i18n";

export interface ResultsSearch {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  tripType: "round" | "oneway";
  passengers: number;
  cabin: "economy" | "premium" | "business";
}

export const Route = createFileRoute("/results")({
  validateSearch: (s: Record<string, unknown>): ResultsSearch => ({
    origin: String(s.origin ?? "FIH"),
    destination: String(s.destination ?? "JNB"),
    departDate: String(s.departDate ?? ""),
    returnDate: String(s.returnDate ?? ""),
    tripType: s.tripType === "round" ? "round" : "oneway",
    passengers: Number(s.passengers ?? 1),
    cabin: (["economy", "premium", "business"].includes(String(s.cabin))
      ? String(s.cabin)
      : "economy") as ResultsSearch["cabin"],
  }),
  component: ResultsPage,
});

const route = getRouteApi("/results");
type SortKey = "price" | "duration" | "depart";

function calcDurationMin(departAt: string, arriveAt: string): number {
  return Math.round((new Date(arriveAt).getTime() - new Date(departAt).getTime()) / 60000);
}

function formatDuration(min: number): string {
  if (min <= 0) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function carrierColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
  return `hsl(${h % 360},50%,30%)`;
}

function AirlineBadge({ carrier }: { carrier: string }) {
  const abbr = carrier.split(/\s+/).map((w) => w[0] ?? "").slice(0, 2).join("").toUpperCase();
  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
      style={{ backgroundColor: carrierColor(carrier) }}
      title={carrier}
    >
      {abbr}
    </div>
  );
}

export function ResultsPage() {
  const { t, lang } = useI18n();
  const search = route.useSearch();

  const { data: offers, isLoading } = useQuery(
    flightSearchOptions({
      origin: search.origin,
      destination: search.destination,
      departDate: search.departDate,
      returnDate: search.tripType === "round" ? search.returnDate : null,
      passengers: search.passengers,
      cabin: search.cabin,
    }),
  );

  const [minLoad, setMinLoad] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("price");
  const [directOnly, setDirectOnly] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoad(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const showLoader = isLoading || minLoad;

  const processed = useMemo(() => {
    if (!offers) return [];
    let list = offers.map((offer) => {
      const seg = offer.segments[0]!;
      return { offer, seg, durationMin: calcDurationMin(seg.departAt, seg.arriveAt) };
    });
    if (directOnly) list = list.filter((x) => x.offer.segments.length === 1);
    if (sortBy === "price") list.sort((a, b) => a.offer.totalCents - b.offer.totalCents);
    else if (sortBy === "duration") list.sort((a, b) => a.durationMin - b.durationMin);
    else list.sort((a, b) => a.seg.departAt.localeCompare(b.seg.departAt));
    return list;
  }, [offers, sortBy, directOnly]);

  const originAirport = airportByCode(search.origin);
  const destAirport   = airportByCode(search.destination);
  const originLabel   = originAirport ? (lang === "fr" ? originAirport.city : originAirport.cityEn) : search.origin;
  const destLabel     = destAirport   ? (lang === "fr" ? destAirport.city   : destAirport.cityEn)   : search.destination;

  const SORTS: { key: SortKey; label: string }[] = [
    { key: "price",    label: lang === "fr" ? "Prix"    : "Price" },
    { key: "duration", label: lang === "fr" ? "Durée"   : "Duration" },
    { key: "depart",   label: lang === "fr" ? "Départ"  : "Depart" },
  ];

  const cabinLabel = { economy: lang === "fr" ? "Économie" : "Economy", premium: "Premium", business: lang === "fr" ? "Affaires" : "Business" }[search.cabin];

  return (
    <div className="min-h-screen bg-gray-50/60 pt-16">

      {/* ── Barre récap ── */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Link to="/" className="text-sm font-medium text-violet-700 hover:text-violet-900 transition-colors flex items-center gap-1">
            ← {lang === "fr" ? "Retour" : "Back"}
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900">
                {originAirport?.flag} {search.origin} → {destAirport?.flag} {search.destination}
              </span>
              <span className="text-xs text-gray-400">
                {search.departDate}
                {search.tripType === "round" && ` – ${search.returnDate}`}
                {" · "}{search.passengers} {lang === "fr" ? "passager(s)" : "pax"}
                {" · "}{cabinLabel}
              </span>
            </div>
          </div>

          {/* Filters */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setDirectOnly((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${directOnly ? "bg-violet-700" : "bg-gray-200"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${directOnly ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="text-xs font-medium text-gray-600">{lang === "fr" ? "Direct" : "Non-stop"}</span>
          </label>

          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-0.5">
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSortBy(s.key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${sortBy === s.key ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Compteur */}
        {!showLoader && processed.length > 0 && (
          <p className="text-xs text-gray-400 mb-4">
            {processed.length} {lang === "fr" ? `vol${processed.length > 1 ? "s" : ""} trouvé${processed.length > 1 ? "s" : ""}` : `flight${processed.length > 1 ? "s" : ""} found`}
            {" — "}{originLabel} → {destLabel}
          </p>
        )}

        {!showLoader && !isLoading && processed.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-10 text-center">
            <p className="text-4xl mb-3">✈</p>
            <p className="font-semibold text-gray-900 mb-1">{lang === "fr" ? "Aucun vol trouvé" : "No flights found"}</p>
            <p className="text-sm text-gray-400">{t("results.empty")}</p>
          </div>
        )}

        {/* Liste des offres */}
        <ul className="space-y-3">
          {processed.map(({ offer, seg, durationMin }, idx) => {
            const perPax      = formatCents(Math.round(offer.totalCents / search.passengers));
            const installment = formatCents(Math.ceil(offer.totalCents / 3));
            const isBest      = idx === 0;
            const stops       = offer.segments.length === 1 ? (lang === "fr" ? "Direct" : "Non-stop") : `${offer.segments.length - 1} escale${offer.segments.length > 2 ? "s" : ""}`;

            return (
              <li key={offer.providerOfferId} className={`bg-white rounded-2xl shadow-sm ring-1 transition-all hover:shadow-md ${isBest ? "ring-violet-300" : "ring-gray-100"}`}>
                {isBest && (
                  <div className="bg-violet-700 text-white text-[10px] font-bold px-4 py-1.5 rounded-t-2xl flex items-center gap-1.5">
                    <span>✦</span>
                    <span>{lang === "fr" ? "Meilleure offre" : "Best deal"}</span>
                  </div>
                )}
                <div className="p-5 flex items-center gap-4">
                  {/* Logo compagnie */}
                  <AirlineBadge carrier={seg.carrier} />

                  {/* Route */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 mb-1">{seg.carrier} · {seg.flightNumber}</p>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-lg font-black text-gray-900 leading-none">{seg.departAt.slice(11, 16)}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{seg.from}</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                        <p className="text-[10px] text-gray-400">{formatDuration(durationMin)}</p>
                        <div className="w-full flex items-center gap-1">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-gray-300 text-xs">✈</span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                        <p className="text-[10px] font-medium text-violet-600">{stops}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-gray-900 leading-none">{seg.arriveAt.slice(11, 16)}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{seg.to}</p>
                      </div>
                    </div>
                    {search.tripType === "round" && (
                      <p className="text-[10px] text-gray-400 mt-1">↩ Retour: {search.returnDate}</p>
                    )}
                  </div>

                  {/* Prix + CTA */}
                  <div className="shrink-0 text-right flex flex-col items-end gap-2">
                    <div>
                      <p className="text-xl font-black text-gray-900">{formatCents(offer.totalCents)}</p>
                      {search.passengers > 1 && (
                        <p className="text-[10px] text-gray-400">{perPax} / {lang === "fr" ? "pers." : "pax"}</p>
                      )}
                      <p className="text-[10px] font-semibold text-violet-600 mt-0.5">
                        {lang === "fr" ? `dès ${installment}/mois` : `from ${installment}/mo`}
                      </p>
                    </div>
                    <Link
                      to="/details"
                      search={{
                        origin: seg.from, destination: seg.to,
                        departDate: search.departDate, returnDate: search.tripType === "round" ? search.returnDate : "",
                        tripType: search.tripType, passengers: search.passengers, cabin: search.cabin,
                        carrier: seg.carrier, flightNumber: seg.flightNumber,
                        providerOfferId: offer.providerOfferId, totalCents: offer.totalCents,
                        departTime: seg.departAt.slice(11, 16), arriveTime: seg.arriveAt.slice(11, 16),
                      }}
                      className="px-5 py-2.5 bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-violet-200 active:scale-95"
                    >
                      {t("results.choose")} →
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Overlay chargement */}
      {showLoader && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-xs">
            <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-700 animate-spin mx-auto mb-4" />
            <p className="font-bold text-gray-900 mb-1">{t("loader.results")}</p>
            <p className="text-sm text-gray-400">{t("loader.results.sub")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
