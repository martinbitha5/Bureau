import { formatCents } from "@sensei/utils";
import { createFileRoute, getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BAGS_PROT_PRICE_CENTS, CANCEL_PRICE_CENTS, loadProtect, saveProtect } from "../booking-store";
import { StepBar } from "../components/StepBar";
import { useI18n } from "../i18n";
import type { DetailsSearch } from "./details";

export type ProtectSearch = DetailsSearch;

export const Route = createFileRoute("/protect")({
  validateSearch: (s: Record<string, unknown>): ProtectSearch => ({
    origin: String(s.origin ?? ""), destination: String(s.destination ?? ""),
    departDate: String(s.departDate ?? ""), returnDate: String(s.returnDate ?? ""),
    tripType: s.tripType === "round" ? "round" : "oneway",
    passengers: Number(s.passengers ?? 1),
    cabin: (["economy","premium","business"].includes(String(s.cabin)) ? String(s.cabin) : "economy") as DetailsSearch["cabin"],
    carrier: String(s.carrier ?? ""), flightNumber: String(s.flightNumber ?? ""),
    providerOfferId: String(s.providerOfferId ?? ""), totalCents: Number(s.totalCents ?? 0),
    departTime: String(s.departTime ?? ""), arriveTime: String(s.arriveTime ?? ""),
  }),
  component: ProtectPage,
});

const route = getRouteApi("/protect");

function ProtectCard({
  selected, onSelect, icon, title, desc, price, benefits,
}: {
  selected: boolean; onSelect: () => void; icon: string; title: string; desc: string; price: number; benefits?: string[];
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${selected ? "border-violet-600 bg-violet-50" : "border-gray-100 bg-white hover:border-violet-200"}`}
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-gray-900">{title}</p>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ml-3 ${selected ? "border-violet-700 bg-violet-700" : "border-gray-300"}`}>
              {selected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          <p className="text-sm font-bold text-violet-700 mt-2">{price === 0 ? "Gratuit" : formatCents(price)}</p>
        </div>
      </div>
      {selected && benefits && benefits.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-violet-100 pt-4">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2 text-xs text-gray-700">
              <span className="text-violet-500 shrink-0 mt-0.5">✓</span> {b}
            </li>
          ))}
        </ul>
      )}
    </button>
  );
}

export function ProtectPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = route.useSearch();

  const saved = loadProtect();
  const [cancel, setCancel] = useState<boolean>(saved?.cancellation_protection ?? true);
  const [bags, setBags]     = useState<boolean>(saved?.baggage_protection ?? false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  function onContinue() {
    saveProtect({ cancellation_protection: cancel, baggage_protection: bags });
    navigate({ to: "/summary", search });
  }

  const cancelBenefits = (["b1","b2","b3","b4"] as const).map((k) => t(`protect.cancel.${k}`));
  const bagsBenefits   = (["b1","b2","b3","b4"] as const).map((k) => t(`protect.bags.${k}`));

  return (
    <div className="min-h-screen bg-gray-50/60 pt-16 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepBar current={4} />

        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{t("protect.title")}</h2>
        <p className="text-sm text-gray-500 mb-6">Protégez votre voyage avant de confirmer.</p>

        {/* Annulation */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-base shrink-0">🛡️</div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{t("protect.cancel.title")}</h3>
              <p className="text-xs text-gray-400">{t("protect.cancel.sub")}</p>
            </div>
          </div>
          <div className="space-y-3">
            <ProtectCard
              selected={cancel} onSelect={() => setCancel(true)} icon="✅"
              title={t("protect.cancel.add")} desc={t("protect.cancel.b1")}
              price={CANCEL_PRICE_CENTS} benefits={cancelBenefits}
            />
            <ProtectCard
              selected={!cancel} onSelect={() => setCancel(false)} icon="⬜"
              title={t("protect.cancel.none")} desc={t("protect.no_protection")}
              price={0}
            />
          </div>
        </div>

        {/* Bagages */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-base shrink-0">🧳</div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{t("protect.bags.title")}</h3>
              <p className="text-xs text-gray-400">{t("protect.bags.sub")}</p>
            </div>
          </div>
          <div className="space-y-3">
            <ProtectCard
              selected={bags} onSelect={() => setBags(true)} icon="✅"
              title={t("protect.bags.add")} desc={t("protect.bags.b1")}
              price={BAGS_PROT_PRICE_CENTS} benefits={bagsBenefits}
            />
            <ProtectCard
              selected={!bags} onSelect={() => setBags(false)} icon="⬜"
              title={t("protect.bags.none")} desc={t("protect.no_protection")}
              price={0}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="w-full py-4 bg-violet-700 hover:bg-violet-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-200 active:scale-95 text-sm"
        >
          {t("protect.continue")} →
        </button>
      </div>

      {pageLoading && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-xs">
            <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-700 animate-spin mx-auto mb-4" />
            <p className="font-bold text-gray-900 mb-1">{t("loader.protect")}</p>
            <p className="text-sm text-gray-400">{t("loader.protect.sub")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
