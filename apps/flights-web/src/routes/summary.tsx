import { buildInstallments, decideBnpl, scoreToBand } from "@sensei/payments";
import { formatCents } from "@sensei/utils";
import { Link, getRouteApi } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BAGS_PROT_PRICE_CENTS,
  CANCEL_PRICE_CENTS,
  EXTRAS_CATALOG,
  SEAT_PRICES,
  type BookingRecord,
  type FlightLeg,
  calcGrandTotal,
  clearAllDrafts,
  generateBookingRef,
  loadCustomise,
  loadDraft,
  loadProtect,
  saveBooking,
} from "../booking-store";
import { StepBar } from "../components/StepBar";
import { useI18n } from "../i18n";
import type { DetailsSearch } from "./details";

export type SummarySearch = DetailsSearch;

const route = getRouteApi("/summary");

type Method = "mobile_money" | "bnpl";

function Initials({ name }: { name: string }) {
  const ini = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return <span className="avatar">{ini}</span>;
}

function ExtrasLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-extra-row">
      <span className="summary-extra-label">{label}</span>
      <span className="muted small">{value}</span>
    </div>
  );
}

export function SummaryPage() {
  const { t } = useI18n();
  const search = route.useSearch();

  const draft = loadDraft();
  const customise = loadCustomise();
  const protect = loadProtect();

  const [paymentReady, setPaymentReady] = useState(false);
  const [method, setMethod] = useState<Method>("bnpl");
  const [installmentCount, setInstallmentCount] = useState(4);
  const [sliderScore, setSliderScore] = useState(620);
  const [couponOpen, setCouponOpen] = useState(false);
  const [confirmed, setConfirmed] = useState<BookingRecord | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setPaymentReady(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const grandTotal = calcGrandTotal(search.totalCents, customise, protect);

  const decision = useMemo(
    () => decideBnpl({ score: sliderScore, principalCents: grandTotal, installmentCount }),
    [sliderScore, grandTotal, installmentCount],
  );
  const schedule = useMemo(
    () =>
      decision.approved
        ? buildInstallments(decision.totalCents, decision.installmentCount, new Date())
        : [],
    [decision],
  );

  function onConfirm() {
    if (!draft) return;

    const outbound: FlightLeg = {
      from: search.origin,
      to: search.destination,
      departDate: search.departDate,
      departTime: search.departTime,
      arriveTime: search.arriveTime,
      carrier: search.carrier,
      flightNumber: search.flightNumber,
    };
    const inbound: FlightLeg | null =
      search.tripType === "round"
        ? {
            from: search.destination,
            to: search.origin,
            departDate: search.returnDate,
            departTime: search.arriveTime,
            arriveTime: search.departTime,
            carrier: search.carrier,
            flightNumber: search.flightNumber,
          }
        : null;

    const record: BookingRecord = {
      booking_ref: generateBookingRef(),
      provider_booking_ref: null,
      status: "confirmed",
      total_cents: grandTotal,
      currency: "USD",
      trip_type: search.tripType,
      cabin: search.cabin,
      outbound,
      inbound,
      contact: draft.contact,
      passengers: draft.passengers,
      customise,
      protect,
      created_at: new Date().toISOString(),
    };
    saveBooking(record);
    clearAllDrafts();
    setConfirmed(record);
  }

  if (confirmed) {
    return (
      <section className="page">
        <div className="confirm-hero">
          <h2 className="page-title">{t("confirm.title")}</h2>
          <p className="muted">{t("confirm.body")}</p>
        </div>
        <div className="ref-grid">
          <div className="ref-card">
            <span className="ref-label">{t("confirm.ourRef")}</span>
            <span className="ref-value">{confirmed.booking_ref}</span>
          </div>
          <div className="ref-card">
            <span className="ref-label">{t("confirm.airlineRef")}</span>
            <span className="ref-value">{t("confirm.processing")}</span>
          </div>
        </div>
        <Link to="/manage" className="btn-primary block">
          {t("confirm.manage")}
        </Link>
      </section>
    );
  }

  const contactName = draft?.contact.full_name ?? "—";
  const seatLabel = customise
    ? t(`customise.seat.${customise.seat_pref}.name`)
    : t("summary.not_added");
  const selectedExtraNames = (customise?.selected_extra_ids ?? [])
    .map((id) => {
      const e = EXTRAS_CATALOG.find((x) => x.id === id);
      return e ? t(`customise.extras.${e.id}.name`) : id;
    })
    .join(", ");

  return (
    <section className="page">
      <StepBar current={5} />

      {/* ── Détails du vol ── */}
      <details className="panel summary-section" open>
        <summary className="summary-sec-head">
          <span className="panel-icon">✈</span>
          <h3 className="panel-title">{t("summary.flight")}</h3>
        </summary>
        <div className="leg-row">
          <span className="leg-tag">{t("results.outbound")}</span>
          <div className="leg-body">
            <strong>
              {search.origin} {search.departTime} → {search.destination} {search.arriveTime}
            </strong>
            <span className="muted small">
              {search.departDate} · {search.carrier} {search.flightNumber}
            </span>
          </div>
        </div>
        {search.tripType === "round" && (
          <div className="leg-row">
            <span className="leg-tag">{t("results.return")}</span>
            <div className="leg-body">
              <strong>
                {search.destination} → {search.origin}
              </strong>
              <span className="muted small">{search.returnDate}</span>
            </div>
          </div>
        )}
      </details>

      {/* ── Coordonnées ── */}
      <div className="panel summary-section">
        <div className="summary-sec-head">
          <span className="panel-icon">📞</span>
          <h3 className="panel-title">{t("summary.contact")}</h3>
          <Link to="/details" search={search} className="link-back summary-modify">
            {t("summary.modify")}
          </Link>
        </div>
        {draft && (
          <div className="summary-person-row">
            <Initials name={contactName} />
            <div>
              <div className="summary-person-name">{contactName.toUpperCase()}</div>
              <div className="muted small">
                {draft.contact.contact_email}
                {draft.contact.contact_phone && ` · ${draft.contact.contact_phone}`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Passagers ── */}
      <div className="panel summary-section">
        <div className="summary-sec-head">
          <span className="panel-icon">🧍</span>
          <h3 className="panel-title">{t("summary.passengers")}</h3>
          <Link to="/details" search={search} className="link-back summary-modify">
            {t("summary.modify")}
          </Link>
        </div>
        {draft?.passengers.map((p, i) => {
          const name = `${p.first_name} ${p.middle_name} ${p.last_name}`.replace(/\s+/g, " ").trim();
          return (
            <div key={i} className="summary-person-row">
              <Initials name={name} />
              <div>
                <div className="summary-person-name">
                  {t(`title.${p.title}`).toUpperCase()} {name.toUpperCase()}
                </div>
                <div className="muted small">
                  {t("details.passenger", { n: String(i + 1) })} · {p.birth_date}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Services complémentaires ── */}
      <div className="panel summary-section">
        <div className="summary-sec-head">
          <span className="panel-icon">⊕</span>
          <h3 className="panel-title">{t("summary.extras")}</h3>
        </div>
        <ExtrasLine
          label={t("summary.extras.seat")}
          value={customise?.seat_pref !== "random" ? seatLabel : t("summary.not_added")}
        />
        <ExtrasLine
          label={t("summary.extras.bag_prot")}
          value={protect?.baggage_protection ? t("summary.added") : t("summary.not_added")}
        />
        <ExtrasLine
          label={t("summary.extras.cancel_prot")}
          value={protect?.cancellation_protection ? t("summary.added") : t("summary.not_added")}
        />
        <ExtrasLine
          label={t("summary.extras.supplements")}
          value={selectedExtraNames || t("summary.not_added")}
        />
      </div>

      {/* ── Sélection du paiement ── */}
      <div className="panel summary-section">
        <div className="summary-sec-head">
          <span className="panel-icon">💳</span>
          <h3 className="panel-title">{t("summary.payment")}</h3>
        </div>

        {!paymentReady ? (
          <div className="summary-loading">
            <div className="loading-spinner" />
            <div>
              <div className="summary-loading-title">{t("summary.payment.loading")}</div>
              <div className="muted small">{t("summary.payment.loading_sub")}</div>
            </div>
          </div>
        ) : (
          <div className="payment-methods">
            <button
              type="button"
              className={method === "mobile_money" ? "method active" : "method"}
              onClick={() => setMethod("mobile_money")}
            >
              <div className="method-name">{t("checkout.mobileMoney")}</div>
              <div className="muted small">{t("checkout.mobileMoneyHint")}</div>
            </button>
            <button
              type="button"
              className={method === "bnpl" ? "method active" : "method"}
              onClick={() => setMethod("bnpl")}
            >
              <div className="method-name">{t("checkout.bnpl")}</div>
              <div className="muted small">{t("checkout.bnplHint")}</div>
            </button>

            {method === "bnpl" && (
              <div className="bnpl-config">
                <label className="field">
                  <span>{t("checkout.installments")}</span>
                  <div className="seg">
                    {[3, 4].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={installmentCount === n ? "seg-btn active" : "seg-btn"}
                        onClick={() => setInstallmentCount(n)}
                      >
                        {n}×
                      </button>
                    ))}
                  </div>
                </label>
                <div className="field">
                  <span>
                    {t("checkout.score")} : <strong>{sliderScore}</strong> ({scoreToBand(sliderScore)})
                  </span>
                  <input
                    type="range"
                    min={400}
                    max={850}
                    value={sliderScore}
                    onChange={(e) => setSliderScore(Number(e.target.value))}
                  />
                  <span className="muted small">{t("checkout.scoreHint")}</span>
                </div>
                {method === "bnpl" && decision.approved && (
                  <div className="schedule">
                    <div className="sched-title">{t("checkout.schedule")}</div>
                    {schedule.map((p, i) => (
                      <div key={p.sequence} className="sched-row">
                        <span>
                          {i === 0
                            ? t("checkout.dueNow")
                            : `${t("checkout.due")} ${p.sequence} · ${p.dueDate}`}
                        </span>
                        <strong>{formatCents(p.amountCents)}</strong>
                      </div>
                    ))}
                    <p className="no-fees">✓ {t("checkout.noFees")}</p>
                  </div>
                )}
                {method === "bnpl" && !decision.approved && (
                  <p className="declined">⚠ {t("checkout.declined")}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Utiliser la réduction ── */}
      <div className="panel summary-section">
        <button
          type="button"
          className="summary-sec-head summary-coupon-toggle"
          onClick={() => setCouponOpen((v) => !v)}
        >
          <span className="panel-icon">🏷</span>
          <h3 className="panel-title">{t("summary.discount")}</h3>
          <span className="summary-arrow">{couponOpen ? "▲" : "▶"}</span>
        </button>
        {couponOpen && (
          <div className="coupon-row">
            <input className="coupon-input" placeholder={t("summary.discount_placeholder")} />
            <button type="button" className="btn-primary small">
              {t("summary.apply")}
            </button>
          </div>
        )}
      </div>

      {/* ── Détail des prix ── */}
      <div className="panel summary-section">
        <div className="summary-sec-head">
          <span className="panel-icon">📋</span>
          <h3 className="panel-title">{t("summary.price_detail")}</h3>
        </div>

        {!paymentReady ? (
          <div className="summary-loading">
            <div className="loading-spinner" />
            <div>
              <div className="summary-loading-title">{t("summary.price_loading")}</div>
              <div className="muted small">{t("summary.price_loading_sub")}</div>
            </div>
          </div>
        ) : (
          <div className="price-breakdown">
            <div className="sched-row">
              <span>{t("summary.price.flight")}</span>
              <span>{formatCents(search.totalCents)}</span>
            </div>
            {customise && customise.seat_pref !== "random" && (
              <div className="sched-row">
                <span>{t("summary.price.seat")}</span>
                <span>{formatCents(SEAT_PRICES[customise.seat_pref])}</span>
              </div>
            )}
            {protect?.cancellation_protection && (
              <div className="sched-row">
                <span>{t("summary.extras.cancel_prot")}</span>
                <span>{formatCents(CANCEL_PRICE_CENTS)}</span>
              </div>
            )}
            {protect?.baggage_protection && (
              <div className="sched-row">
                <span>{t("summary.extras.bag_prot")}</span>
                <span>{formatCents(BAGS_PROT_PRICE_CENTS)}</span>
              </div>
            )}
            <div className="sum-total">
              <span>{t("checkout.total")}</span>
              <strong>{formatCents(grandTotal)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* ── CTA ── */}
      <button
        type="button"
        className="btn-primary block"
        disabled={!paymentReady || (method === "bnpl" && !decision.approved)}
        onClick={onConfirm}
      >
        {t("summary.cta")}
      </button>
    </section>
  );
}
