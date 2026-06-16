import { buildInstallments, decideBnpl } from "@sensei/payments";
import { formatCents } from "@sensei/utils";
import { createFileRoute, Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BAGS_PROT_PRICE_CENTS, CANCEL_PRICE_CENTS, EXTRAS_CATALOG, SEAT_PRICES,
  type BookingRecord, type FlightLeg, calcGrandTotal, clearAllDrafts,
  generateBookingRef, loadCustomise, loadDraft, loadProtect, saveBooking,
} from "../booking-store";
import { StepBar } from "../components/StepBar";
import { useI18n } from "../i18n";
import type { DetailsSearch } from "./details";

export type SummarySearch = DetailsSearch & { bnplApproved?: boolean };

export const Route = createFileRoute("/summary")({
  validateSearch: (s: Record<string, unknown>): SummarySearch => ({
    origin: String(s.origin ?? ""), destination: String(s.destination ?? ""),
    departDate: String(s.departDate ?? ""), returnDate: String(s.returnDate ?? ""),
    tripType: s.tripType === "round" ? "round" : "oneway",
    passengers: Number(s.passengers ?? 1),
    cabin: (["economy","premium","business"].includes(String(s.cabin)) ? String(s.cabin) : "economy") as DetailsSearch["cabin"],
    carrier: String(s.carrier ?? ""), flightNumber: String(s.flightNumber ?? ""),
    providerOfferId: String(s.providerOfferId ?? ""), totalCents: Number(s.totalCents ?? 0),
    departTime: String(s.departTime ?? ""), arriveTime: String(s.arriveTime ?? ""),
    bnplApproved: s.bnplApproved === true || s.bnplApproved === "true",
  }),
  component: SummaryPage,
});

const route = getRouteApi("/summary");
type Method = "mobile_money" | "bnpl";
const INSTALLMENT_COUNT = 3;

function Avatar({ name }: { name: string }) {
  const ini = name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
      {ini}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export function SummaryPage() {
  const { t, lang } = useI18n();
  const search = route.useSearch();
  const navigate = useNavigate();

  const draft     = loadDraft();
  const customise = loadCustomise();
  const protect   = loadProtect();

  const [paymentReady, setPaymentReady] = useState(false);
  const [method, setMethod]             = useState<Method>(search.bnplApproved ? "bnpl" : "bnpl");
  const [couponOpen, setCouponOpen]     = useState(false);
  const [confirming, setConfirming]     = useState(false);
  const [confirmed, setConfirmed]       = useState<BookingRecord | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setPaymentReady(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  const grandTotal = calcGrandTotal(search.totalCents, customise, protect);
  const decision   = useMemo(
    () => decideBnpl({ score: 680, principalCents: grandTotal, installmentCount: INSTALLMENT_COUNT }),
    [grandTotal],
  );
  const schedule = useMemo(
    () => decision.approved ? buildInstallments(decision.totalCents, decision.installmentCount, new Date()) : [],
    [decision],
  );

  function onConfirm() {
    if (!draft) return;
    const outbound: FlightLeg = {
      from: search.origin, to: search.destination,
      departDate: search.departDate, departTime: search.departTime,
      arriveTime: search.arriveTime, carrier: search.carrier, flightNumber: search.flightNumber,
    };
    const inbound: FlightLeg | null = search.tripType === "round" ? {
      from: search.destination, to: search.origin,
      departDate: search.returnDate, departTime: search.arriveTime,
      arriveTime: search.departTime, carrier: search.carrier, flightNumber: search.flightNumber,
    } : null;
    const record: BookingRecord = {
      booking_ref: generateBookingRef(), provider_booking_ref: null, status: "confirmed",
      total_cents: grandTotal, currency: "USD", trip_type: search.tripType, cabin: search.cabin,
      outbound, inbound, contact: draft.contact, passengers: draft.passengers,
      customise, protect, created_at: new Date().toISOString(),
    };
    setConfirming(true);
    setTimeout(() => { saveBooking(record); clearAllDrafts(); setConfirming(false); setConfirmed(record); }, 2800);
  }

  /* ── Confirmation screen ────────────────────────────────── */
  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50/60 pt-16 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl ring-1 ring-gray-100 p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">✅</div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{t("confirm.title")}</h2>
            <p className="text-sm text-gray-500 mb-7">{t("confirm.body")}</p>
            <div className="grid grid-cols-2 gap-3 mb-7">
              <div className="bg-gray-50 rounded-2xl p-4 text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("confirm.ourRef")}</p>
                <p className="text-base font-black text-violet-700">{confirmed.booking_ref}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("confirm.airlineRef")}</p>
                <p className="text-base font-black text-gray-400">{t("confirm.processing")}</p>
              </div>
            </div>
            <Link to="/manage" className="block w-full py-3.5 bg-violet-700 hover:bg-violet-800 text-white font-bold rounded-2xl transition-all text-sm">
              {t("confirm.manage")} →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const contactName = draft?.contact.full_name ?? "—";
  const seatLabel   = customise ? t(`customise.seat.${customise.seat_pref}.name`) : t("summary.not_added");
  const selectedExtraNames = (customise?.selected_extra_ids ?? [])
    .map((id) => { const e = EXTRAS_CATALOG.find((x) => x.id === id); return e ? t(`customise.extras.${e.id}.name`) : id; })
    .join(", ");

  return (
    <div className="min-h-screen bg-gray-50/60 pt-16 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepBar current={5} />

        {/* Vol */}
        <div className="bg-violet-700 text-white rounded-2xl p-5 mb-5 shadow-lg shadow-violet-200">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-200 mb-3">{t("summary.flight")}</p>
          <div className="flex items-center gap-4 mb-2">
            <div className="text-center shrink-0">
              <p className="text-2xl font-black leading-none">{search.departTime}</p>
              <p className="text-[10px] text-violet-300">{search.origin}</p>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-px bg-violet-400/50" />
              <span className="text-violet-300 text-sm">✈</span>
              <div className="flex-1 h-px bg-violet-400/50" />
            </div>
            <div className="text-center shrink-0">
              <p className="text-2xl font-black leading-none">{search.arriveTime}</p>
              <p className="text-[10px] text-violet-300">{search.destination}</p>
            </div>
          </div>
          <p className="text-[10px] text-violet-300 text-center">{search.carrier} · {search.flightNumber} · {search.departDate}</p>
          {search.tripType === "round" && (
            <p className="text-[10px] text-violet-300 text-center mt-1">↩ Retour: {search.returnDate}</p>
          )}
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">{t("summary.contact")}</h3>
            <Link to="/details" search={search} className="text-xs text-violet-700 font-semibold hover:underline">{t("summary.modify")}</Link>
          </div>
          {draft && (
            <div className="flex items-center gap-3">
              <Avatar name={contactName} />
              <div>
                <p className="text-sm font-semibold text-gray-900">{contactName}</p>
                <p className="text-xs text-gray-400">{draft.contact.contact_email}{draft.contact.contact_phone && ` · ${draft.contact.contact_phone}`}</p>
              </div>
            </div>
          )}
        </div>

        {/* Passagers */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">{t("summary.passengers")}</h3>
            <Link to="/details" search={search} className="text-xs text-violet-700 font-semibold hover:underline">{t("summary.modify")}</Link>
          </div>
          <div className="space-y-3">
            {draft?.passengers.map((p, i) => {
              const name = `${p.first_name} ${p.middle_name} ${p.last_name}`.replace(/\s+/g, " ").trim();
              return (
                <div key={i} className="flex items-center gap-3">
                  <Avatar name={name} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t(`title.${p.title}`).toUpperCase()} {name.toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{t("details.passenger", { n: String(i + 1) })} · {p.birth_date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 mb-3">
          <h3 className="text-sm font-bold text-gray-900 mb-3">{t("summary.extras")}</h3>
          <Row label={t("summary.extras.seat")} value={customise?.seat_pref !== "random" ? seatLabel : t("summary.not_added")} />
          <Row label={t("summary.extras.bag_prot")} value={protect?.baggage_protection ? t("summary.added") : t("summary.not_added")} />
          <Row label={t("summary.extras.cancel_prot")} value={protect?.cancellation_protection ? t("summary.added") : t("summary.not_added")} />
          <Row label={t("summary.extras.supplements")} value={selectedExtraNames || t("summary.not_added")} />
        </div>

        {/* Paiement */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 mb-3">
          <h3 className="text-sm font-bold text-gray-900 mb-4">{t("summary.payment")}</h3>

          {!paymentReady ? (
            <div className="flex items-center gap-3 py-3">
              <div className="w-6 h-6 rounded-full border-2 border-violet-200 border-t-violet-700 animate-spin shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">{t("summary.payment.loading")}</p>
                <p className="text-xs text-gray-400">{t("summary.payment.loading_sub")}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-3 mb-4">
                {(["mobile_money", "bnpl"] as Method[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`flex-1 rounded-xl border-2 p-3.5 text-left transition-all ${method === m ? "border-violet-600 bg-violet-50" : "border-gray-100 hover:border-violet-200"}`}
                  >
                    <p className="text-xs font-bold text-gray-900">{t(`checkout.${m === "mobile_money" ? "mobileMoney" : "bnpl"}`)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{t(`checkout.${m === "mobile_money" ? "mobileMoneyHint" : "bnplHint"}`)}</p>
                  </button>
                ))}
              </div>

              {method === "bnpl" && !search.bnplApproved && (
                <button
                  type="button"
                  onClick={() => navigate({ to: "/sensei-pay", search: { ...search, installmentCount: INSTALLMENT_COUNT } })}
                  className="w-full flex items-center justify-between bg-gray-900 hover:bg-gray-800 text-white rounded-2xl px-5 py-4 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-sm font-black">S</div>
                    <div className="text-left">
                      <p className="text-sm font-bold">Se connecter à Sensei Pay</p>
                      <p className="text-[10px] text-gray-400">{INSTALLMENT_COUNT}× {formatCents(Math.round(grandTotal / INSTALLMENT_COUNT))} · sans frais</p>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400 group-hover:translate-x-0.5 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              )}

              {method === "bnpl" && search.bnplApproved && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                    <span className="text-emerald-600 text-sm">✓</span>
                    <div>
                      <p className="text-xs font-bold text-emerald-700">Sensei Pay activé</p>
                      <p className="text-[10px] text-emerald-600">Paiement en {INSTALLMENT_COUNT}× approuvé</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate({ to: "/sensei-pay", search: { ...search, installmentCount: INSTALLMENT_COUNT } })}
                      className="ml-auto text-[10px] text-emerald-700 font-semibold hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-emerald-700 mb-3">{t("checkout.schedule")}</p>
                    <div className="space-y-2">
                      {schedule.map((p, i) => (
                        <div key={p.sequence} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{i === 0 ? t("checkout.dueNow") : `${t("checkout.due")} ${p.sequence} · ${p.dueDate}`}</span>
                          <strong className="text-gray-900">{formatCents(p.amountCents)}</strong>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-3">✓ {t("checkout.noFees")}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Code promo */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 mb-3 overflow-hidden">
          <button
            type="button"
            onClick={() => setCouponOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-base">🏷️</span>
              <span className="text-sm font-semibold text-gray-900">{t("summary.discount")}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-gray-400 transition-transform ${couponOpen ? "rotate-180" : ""}`}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          {couponOpen && (
            <div className="px-5 pb-4 flex gap-3">
              <input
                placeholder={t("summary.discount_placeholder")}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <button type="button" className="px-5 py-2.5 bg-violet-700 text-white text-sm font-bold rounded-xl hover:bg-violet-800 transition-colors">
                {t("summary.apply")}
              </button>
            </div>
          )}
        </div>

        {/* Détail prix */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 mb-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">{t("summary.price_detail")}</h3>
          {!paymentReady ? (
            <div className="flex items-center gap-3 py-2">
              <div className="w-5 h-5 rounded-full border-2 border-violet-200 border-t-violet-700 animate-spin shrink-0" />
              <p className="text-sm text-gray-400">{t("summary.price_loading")}</p>
            </div>
          ) : (
            <>
              <Row label={t("summary.price.flight")} value={formatCents(search.totalCents)} />
              {customise?.seat_pref !== "random" && customise && (
                <Row label={t("summary.price.seat")} value={formatCents(SEAT_PRICES[customise.seat_pref])} />
              )}
              {protect?.cancellation_protection && (
                <Row label={t("summary.extras.cancel_prot")} value={formatCents(CANCEL_PRICE_CENTS)} />
              )}
              {protect?.baggage_protection && (
                <Row label={t("summary.extras.bag_prot")} value={formatCents(BAGS_PROT_PRICE_CENTS)} />
              )}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-1">
                <span className="text-base font-bold text-gray-900">{t("checkout.total")}</span>
                <span className="text-xl font-black text-violet-700">{formatCents(grandTotal)}</span>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={!paymentReady || (method === "bnpl" && !search.bnplApproved)}
          className="w-full py-4 bg-violet-700 hover:bg-violet-800 disabled:opacity-40 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-200 active:scale-95 text-sm"
        >
          {t("summary.cta")}
        </button>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-xs">
            <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-700 animate-spin mx-auto mb-4" />
            <p className="font-bold text-gray-900 mb-1">{t("confirm.overlay_title")}</p>
            <p className="text-sm text-gray-400">{t("confirm.overlay_body")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
