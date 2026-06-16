import { formatCents } from "@sensei/utils";
import { createFileRoute, getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EXTRAS_CATALOG, type SeatPref, SEAT_PRICES, loadCustomise, saveCustomise } from "../booking-store";
import { StepBar } from "../components/StepBar";
import { useI18n } from "../i18n";
import type { DetailsSearch } from "./details";

export type CustomiseSearch = DetailsSearch;

export const Route = createFileRoute("/customise")({
  validateSearch: (s: Record<string, unknown>): CustomiseSearch => ({
    origin: String(s.origin ?? ""), destination: String(s.destination ?? ""),
    departDate: String(s.departDate ?? ""), returnDate: String(s.returnDate ?? ""),
    tripType: s.tripType === "round" ? "round" : "oneway",
    passengers: Number(s.passengers ?? 1),
    cabin: (["economy","premium","business"].includes(String(s.cabin)) ? String(s.cabin) : "economy") as DetailsSearch["cabin"],
    carrier: String(s.carrier ?? ""), flightNumber: String(s.flightNumber ?? ""),
    providerOfferId: String(s.providerOfferId ?? ""), totalCents: Number(s.totalCents ?? 0),
    departTime: String(s.departTime ?? ""), arriveTime: String(s.arriveTime ?? ""),
  }),
  component: CustomisePage,
});

const route = getRouteApi("/customise");
const SEAT_OPTIONS: SeatPref[] = ["window", "aisle", "choose", "random"];
const SEAT_ICONS: Record<SeatPref, string> = { window: "🪟", aisle: "🚶", choose: "🎯", random: "🎲" };

export function CustomisePage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const search = route.useSearch();

  const saved = loadCustomise();
  const [seatPref, setSeatPref]         = useState<SeatPref>(saved?.seat_pref ?? "random");
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(() => new Set(saved?.selected_extra_ids ?? []));
  const [bundle, setBundle]             = useState(saved?.bundle_discount ?? false);
  const [pageLoading, setPageLoading]   = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const rawExtras   = [...selectedExtras].reduce((s, id) => s + (EXTRAS_CATALOG.find((x) => x.id === id)?.price_cents ?? 0), 0);
  const discount    = bundle && rawExtras > 0 ? Math.floor(rawExtras * 0.01) : 0;
  const extrasTotal = rawExtras - discount;

  function toggleExtra(id: string) {
    setSelectedExtras((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function onContinue() {
    saveCustomise({ seat_pref: seatPref, selected_extra_ids: [...selectedExtras], bundle_discount: bundle });
    navigate({ to: "/protect", search });
  }

  return (
    <div className="min-h-screen bg-gray-50/60 pt-16 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepBar current={3} />

        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">{t("customise.title")}</h2>

        {/* Préférence de siège */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-[#EDEDFF] flex items-center justify-center text-base shrink-0">💺</div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{t("customise.seats.title")}</h3>
              <p className="text-xs text-gray-400">{t("customise.seats.sub")}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            {SEAT_OPTIONS.slice(0, 3).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSeatPref(opt)}
                className={`rounded-2xl p-4 text-left border-2 transition-all ${seatPref === opt ? "border-violet-600 bg-violet-50" : "border-gray-100 bg-gray-50 hover:border-violet-200"}`}
              >
                <span className="text-2xl block mb-2">{SEAT_ICONS[opt]}</span>
                <p className="text-xs font-bold text-gray-900">{t(`customise.seat.${opt}.name`)}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{t(`customise.seat.${opt}.desc`)}</p>
                <p className="text-xs font-bold text-violet-700 mt-2">{t("customise.from")} {formatCents(SEAT_PRICES[opt])}</p>
              </button>
            ))}
          </div>

          <div className="relative flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">{t("customise.or")}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            type="button"
            onClick={() => setSeatPref("random")}
            className={`w-full rounded-2xl p-4 text-left border-2 transition-all flex items-center gap-3 ${seatPref === "random" ? "border-violet-600 bg-violet-50" : "border-gray-100 bg-gray-50 hover:border-violet-200"}`}
          >
            <span className="text-2xl">🎲</span>
            <div>
              <p className="text-xs font-bold text-gray-900">{t("customise.seat.random.name")}</p>
              <p className="text-[10px] text-gray-400">{t("customise.seat.random.desc")}</p>
            </div>
            <span className="ml-auto text-xs font-bold text-emerald-600">{formatCents(0)}</span>
          </button>
        </div>

        {/* Bagages */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#EDEDFF] flex items-center justify-center text-base shrink-0">🧳</div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{t("customise.bags.title")}</h3>
              <p className="text-xs text-gray-400">{t("customise.bags.sub")}</p>
            </div>
          </div>
          <div className="space-y-2">
            {[{ from: search.origin, to: search.destination }, ...(search.tripType === "round" ? [{ from: search.destination, to: search.origin }] : [])].map((leg, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-gray-400">✈</span>
                  <span className="font-medium">{leg.from}</span>
                  <span className="text-gray-300">→</span>
                  <span className="font-medium">{leg.to}</span>
                </div>
                <button type="button" className="text-xs text-violet-700 font-semibold hover:underline">
                  {t("customise.bags.view")}
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-3">{t("customise.bags.note")}</p>
        </div>

        {/* Offres exclusives */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#EDEDFF] flex items-center justify-center text-base shrink-0">⊕</div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{t("customise.extras.title")}</h3>
              <p className="text-xs text-gray-400">{t("customise.extras.sub")}</p>
            </div>
          </div>

          {/* Bundle toggle */}
          <label className="flex items-center gap-3 bg-violet-50 rounded-xl px-4 py-3 mb-4 cursor-pointer">
            <input type="checkbox" checked={bundle} onChange={(e) => setBundle(e.target.checked)} className="accent-violet-700 w-4 h-4" />
            <span className="text-sm font-medium text-gray-900 flex-1">{t("customise.extras.bundle")}</span>
            <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
              {t("customise.extras.discount")}
            </span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {EXTRAS_CATALOG.map((extra) => {
              const on = selectedExtras.has(extra.id);
              return (
                <button
                  key={extra.id}
                  type="button"
                  onClick={() => toggleExtra(extra.id)}
                  className={`rounded-2xl p-4 text-left border-2 transition-all ${on ? "border-violet-600 bg-violet-50" : "border-gray-100 bg-gray-50 hover:border-violet-200"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xl">{t(`customise.extras.${extra.id}.icon`)}</span>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${on ? "bg-violet-700 border-violet-700" : "border-gray-300"}`}>
                      {on && <span className="text-white text-[8px] font-bold">✓</span>}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-900">{t(`customise.extras.${extra.id}.name`)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{t(`customise.extras.${extra.id}.desc`)}</p>
                  <p className="text-xs font-bold text-violet-700 mt-2">{formatCents(extra.price_cents)}</p>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <span className="text-xs text-gray-400">{t("customise.extras.tripadd")}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t("customise.extras.total")}</span>
              <span className="text-sm font-bold text-gray-900">{formatCents(extrasTotal)}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="w-full py-4 bg-violet-700 hover:bg-violet-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-200 active:scale-95 text-sm"
        >
          {t("customise.continue")} →
        </button>
      </div>

      {pageLoading && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-xs">
            <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-700 animate-spin mx-auto mb-4" />
            <p className="font-bold text-gray-900 mb-1">{t("loader.customise")}</p>
            <p className="text-sm text-gray-400">{t("loader.customise.sub")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
