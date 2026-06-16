import { createFileRoute } from "@tanstack/react-router";
import { formatCents } from "@sensei/utils";
import { type FormEvent, useState } from "react";
import { type BookingRecord, type FlightLeg, findBooking } from "../booking-store";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/manage")({
  component: ManagePage,
});

const INPUT = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white";
const LABEL = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

export function ManagePage() {
  const { t, lang } = useI18n();
  const [ref, setRef]         = useState("");
  const [email, setEmail]     = useState("");
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [notFound, setNotFound] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = findBooking(ref, email);
    setBooking(found);
    setNotFound(!found);
  }

  if (booking) return <Overview booking={booking} onBack={() => setBooking(null)} />;

  return (
    <div className="min-h-screen bg-gray-50/60 pt-16">

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a0e3a] via-[#2d1b6e] to-[#1e3a5f] py-16 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{t("manage.title")}</h1>
        <p className="text-white/60 text-base max-w-sm mx-auto">{t("manage.subtitle")}</p>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-8">

        {/* Lookup card */}
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-8 mb-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className={LABEL}>{t("manage.ref")}</label>
              <input
                className={INPUT}
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                placeholder="SN-XXX-XXXXX"
              />
            </div>
            <div>
              <label className={LABEL}>{t("manage.email")}</label>
              <input type="email" className={INPUT} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {notFound && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
                ⚠ {t("manage.notFound")}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-violet-700 hover:bg-violet-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-200 active:scale-95 text-sm"
            >
              {t("manage.login")} →
            </button>
          </form>
        </div>

        {/* Avantages */}
        <div className="bg-[#EDEDFF] rounded-2xl p-6">
          <p className="text-xs font-black text-violet-600 uppercase tracking-widest mb-2">Sensei Flights</p>
          <h3 className="text-base font-bold text-gray-900 mb-1">{t("manage.benefit.title")}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{t("manage.benefit.body")}</p>
        </div>
      </div>
    </div>
  );
}

function Leg({ leg, label }: { leg: FlightLeg; label: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-full shrink-0">{label}</span>
      <div>
        <p className="text-sm font-bold text-gray-900">{leg.from} {leg.departTime} → {leg.to} {leg.arriveTime}</p>
        <p className="text-xs text-gray-400 mt-0.5">{leg.departDate} · {leg.carrier} {leg.flightNumber}</p>
      </div>
    </div>
  );
}

function Overview({ booking, onBack }: { booking: BookingRecord; onBack: () => void }) {
  const { t } = useI18n();
  const statusColors: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-700",
    pending:   "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const statusClass = statusColors[booking.status] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="min-h-screen bg-gray-50/60 pt-16 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">{booking.contact.full_name}</h2>
            <p className="text-sm text-gray-400">{booking.booking_ref}</p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-semibold text-violet-700 hover:text-violet-900 transition-colors"
          >
            ← {t("manage.back")}
          </button>
        </div>

        {/* Statut */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t("manage.status")}</p>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusClass}`}>{t(`status.${booking.status}`)}</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t("manage.ourRef")}</p>
            <p className="text-sm font-black text-violet-700">{booking.booking_ref}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t("manage.airlineRef")}</p>
            <p className="text-sm font-black text-gray-400">{booking.provider_booking_ref ?? t("confirm.processing")}</p>
          </div>
        </div>

        {/* Vol */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">✈</span>
            <h3 className="text-sm font-bold text-gray-900">{t("manage.flight")}</h3>
          </div>
          <Leg leg={booking.outbound} label={t("results.outbound")} />
          {booking.inbound && <Leg leg={booking.inbound} label={t("results.return")} />}
          <div className="flex items-center justify-between pt-4 mt-1">
            <span className="text-sm font-semibold text-gray-600">{t("checkout.total")}</span>
            <span className="text-lg font-black text-violet-700">{formatCents(booking.total_cents)}</span>
          </div>
        </div>

        {/* Passagers */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🧍</span>
            <h3 className="text-sm font-bold text-gray-900">{t("manage.passengers")}</h3>
          </div>
          <div className="space-y-3">
            {booking.passengers.map((p, i) => {
              const name = `${p.first_name} ${p.middle_name} ${p.last_name}`.replace(/\s+/g, " ").trim();
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
                    {name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t(`title.${p.title}`)} {name}</p>
                    <p className="text-xs text-gray-400">{p.birth_date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
