import { createFileRoute } from "@tanstack/react-router";
import { formatCents } from "@sensei/utils";
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";
import {
  type ContactChannel, type PassengerDraft, type PassengerTitle, saveDraft,
} from "../booking-store";
import { StepBar } from "../components/StepBar";
import { useI18n } from "../i18n";

export interface DetailsSearch {
  origin: string; destination: string; departDate: string; returnDate: string;
  tripType: "round" | "oneway"; passengers: number; cabin: "economy" | "premium" | "business";
  carrier: string; flightNumber: string; providerOfferId: string;
  totalCents: number; departTime: string; arriveTime: string;
}

export const Route = createFileRoute("/details")({
  validateSearch: (s: Record<string, unknown>): DetailsSearch => ({
    origin: String(s.origin ?? ""), destination: String(s.destination ?? ""),
    departDate: String(s.departDate ?? ""), returnDate: String(s.returnDate ?? ""),
    tripType: s.tripType === "round" ? "round" : "oneway",
    passengers: Number(s.passengers ?? 1),
    cabin: (["economy","premium","business"].includes(String(s.cabin)) ? String(s.cabin) : "economy") as DetailsSearch["cabin"],
    carrier: String(s.carrier ?? ""), flightNumber: String(s.flightNumber ?? ""),
    providerOfferId: String(s.providerOfferId ?? ""), totalCents: Number(s.totalCents ?? 0),
    departTime: String(s.departTime ?? ""), arriveTime: String(s.arriveTime ?? ""),
  }),
  component: DetailsPage,
});

const route = getRouteApi("/details");
const TITLES: PassengerTitle[] = ["mr", "mrs", "ms", "mx"];
function emptyPassenger(): PassengerDraft {
  return { title: "mr", first_name: "", middle_name: "", last_name: "", birth_date: "", type: "adult" };
}

/* ── Shared input style ───────────────────────────────────── */
const INPUT = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white";
const LABEL = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

export function DetailsPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const search = route.useSearch();

  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("+243");
  const [optIn, setOptIn]         = useState(false);
  const [channel, setChannel]     = useState<ContactChannel>("email");
  const [pax, setPax]             = useState<PassengerDraft[]>(() =>
    Array.from({ length: Math.max(1, search.passengers) }, emptyPassenger));
  const [error, setError]         = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  function updatePax(i: number, patch: Partial<PassengerDraft>) {
    setPax((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = fullName.trim() && email.trim() && phone.trim()
      && pax.every((p) => p.first_name.trim() && p.last_name.trim() && p.birth_date);
    if (!ok) { setError(true); return; }
    saveDraft({
      contact: { full_name: fullName.trim(), contact_email: email.trim(), contact_phone: phone.trim(), contact_opt_in: optIn, contact_channel: channel },
      passengers: pax.map((p) => ({ ...p, first_name: p.first_name.trim(), middle_name: p.middle_name.trim(), last_name: p.last_name.trim() })),
    });
    navigate({ to: "/customise", search });
  }

  return (
    <div className="min-h-screen bg-gray-50/60 pt-16 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepBar current={2} />

        {/* Flight recap */}
        <div className="bg-violet-700 text-white rounded-2xl p-5 mb-6 shadow-lg shadow-violet-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-200">
              {search.carrier} · {search.flightNumber}
            </p>
            <span className="text-sm font-black">{formatCents(search.totalCents)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-black leading-none">{search.departTime}</p>
              <p className="text-[10px] text-violet-300 mt-1">{search.origin}</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-center gap-2">
                <div className="flex-1 h-px bg-violet-400/50" />
                <span className="text-violet-300 text-sm">✈</span>
                <div className="flex-1 h-px bg-violet-400/50" />
              </div>
              <p className="text-[10px] text-violet-300 mt-1">{search.departDate}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black leading-none">{search.arriveTime}</p>
              <p className="text-[10px] text-violet-300 mt-1">{search.destination}</p>
            </div>
          </div>
          {search.tripType === "round" && (
            <p className="text-[10px] text-violet-300 mt-2 text-center">↩ {lang === "fr" ? "Retour" : "Return"}: {search.returnDate}</p>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-5">

          {/* Contact */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-base shrink-0">📞</div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{t("details.contact")}</h3>
                <p className="text-xs text-gray-400">{t("details.contactHint")}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={LABEL}>{t("details.contactName")}</label>
                <input className={INPUT} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>{t("details.email")}</label>
                <input type="email" className={INPUT} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("details.phone")}</label>
              <input className={INPUT} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            {/* Opt-in */}
            <div className="mt-5 pt-5 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t("details.stayInTouch")}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t("details.stayInTouchHint")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOptIn((v) => !v)}
                  className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ml-4 ${optIn ? "bg-violet-700" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${optIn ? "translate-x-5" : "translate-x-1"}`} />
                </button>
              </div>
              {optIn && (
                <div className="mt-3 flex gap-2">
                  {(["email", "sms"] as ContactChannel[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setChannel(c)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${channel === c ? "bg-violet-700 text-white border-violet-700" : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"}`}
                    >
                      {t(`details.channel.${c}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Passagers */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-base shrink-0">🧍</div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{t("details.passengers")}</h3>
                <p className="text-xs text-gray-400">{t("details.passengersHint")}</p>
              </div>
            </div>

            {pax.map((p, i) => (
              <div key={i} className={`${i > 0 ? "mt-6 pt-6 border-t border-gray-50" : ""}`}>
                <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-4">
                  {t("details.passenger", { n: String(i + 1) })}
                </p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className={LABEL}>{t("details.passengerTitle")}</label>
                    <select
                      className={INPUT}
                      value={p.title}
                      onChange={(e) => updatePax(i, { title: e.target.value as PassengerTitle })}
                    >
                      {TITLES.map((tt) => <option key={tt} value={tt}>{t(`title.${tt}`)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>{t("details.firstName")}</label>
                    <input className={INPUT} value={p.first_name} onChange={(e) => updatePax(i, { first_name: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL}>{t("details.middleName")}</label>
                    <input className={INPUT} value={p.middle_name} onChange={(e) => updatePax(i, { middle_name: e.target.value })} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>{t("details.lastName")}</label>
                    <input className={INPUT} value={p.last_name} onChange={(e) => updatePax(i, { last_name: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL}>{t("details.birthDate")}</label>
                    <input type="date" className={INPUT} value={p.birth_date} onChange={(e) => updatePax(i, { birth_date: e.target.value })} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
              ⚠ {t("details.required")}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-violet-700 hover:bg-violet-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-200 active:scale-95 text-sm"
          >
            {t("details.continue")} →
          </button>
        </form>
      </div>

      {/* Overlay */}
      {pageLoading && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-xs">
            <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-700 animate-spin mx-auto mb-4" />
            <p className="font-bold text-gray-900 mb-1">{t("loader.details")}</p>
            <p className="text-sm text-gray-400">{t("loader.details.sub")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
