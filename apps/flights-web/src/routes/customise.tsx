import { formatCents } from "@sensei/utils";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  EXTRAS_CATALOG,
  type SeatPref,
  SEAT_PRICES,
  loadCustomise,
  saveCustomise,
} from "../booking-store";
import { StepBar } from "../components/StepBar";
import { useI18n } from "../i18n";
import type { DetailsSearch } from "./details";

export type CustomiseSearch = DetailsSearch;

const route = getRouteApi("/customise");

const SEAT_OPTIONS: SeatPref[] = ["window", "aisle", "choose", "random"];

export function CustomisePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = route.useSearch();

  const saved = loadCustomise();
  const [seatPref, setSeatPref] = useState<SeatPref>(saved?.seat_pref ?? "random");
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(
    () => new Set(saved?.selected_extra_ids ?? []),
  );
  const [bundle, setBundle] = useState(saved?.bundle_discount ?? false);

  const rawExtras = [...selectedExtras].reduce((s, id) => {
    const e = EXTRAS_CATALOG.find((x) => x.id === id);
    return s + (e?.price_cents ?? 0);
  }, 0);
  const discount = bundle && rawExtras > 0 ? Math.floor(rawExtras * 0.01) : 0;
  const extrasTotal = rawExtras - discount;

  function toggleExtra(id: string) {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onContinue() {
    saveCustomise({ seat_pref: seatPref, selected_extra_ids: [...selectedExtras], bundle_discount: bundle });
    navigate({ to: "/protect", search });
  }

  return (
    <section className="page">
      <StepBar current={3} />

      <h2 className="page-title cust-page-title">{t("customise.title")}</h2>

      {/* ── Préférence de siège ── */}
      <div className="cust-banner cust-banner--dark">
        <h3 className="cust-banner-title">{t("customise.seats.title")}</h3>
        <p className="cust-banner-sub">{t("customise.seats.sub")}</p>
      </div>
      <div className="seat-grid">
        {SEAT_OPTIONS.slice(0, 3).map((opt) => (
          <button
            key={opt}
            type="button"
            className={seatPref === opt ? "seat-card active" : "seat-card"}
            onClick={() => setSeatPref(opt)}
          >
            <span className="seat-tag">+</span>
            <div className="seat-name">{t(`customise.seat.${opt}.name`)}</div>
            <div className="muted small">{t(`customise.seat.${opt}.desc`)}</div>
            <div className="seat-price">
              {t("customise.from")} {formatCents(SEAT_PRICES[opt])} /{t("customise.seat_unit")}
            </div>
          </button>
        ))}
      </div>
      <div className="seat-or">
        <span className="seat-or-line" />
        <span className="seat-or-text">{t("customise.or")}</span>
        <span className="seat-or-line" />
      </div>
      <button
        type="button"
        className={seatPref === "random" ? "seat-card seat-card--free active" : "seat-card seat-card--free"}
        onClick={() => setSeatPref("random")}
      >
        <div className="seat-name">{t("customise.seat.random.name")}</div>
        <div className="muted small">{t("customise.seat.random.desc")}</div>
        <div className="seat-price">{formatCents(0)} /{t("customise.seat_unit")}</div>
      </button>

      {/* ── Bagages ── */}
      <div className="cust-banner cust-banner--purple">
        <h3 className="cust-banner-title">{t("customise.bags.title")}</h3>
        <p className="cust-banner-sub">{t("customise.bags.sub")}</p>
      </div>
      <div className="panel detail-panel">
        <div className="bags-leg">
          <div className="bags-route">
            <span className="bags-carrier-icon">✈</span>
            <span>
              {search.origin} → {search.destination}
            </span>
          </div>
          <button type="button" className="btn-ghost">{t("customise.bags.view")}</button>
        </div>
        {search.tripType === "round" && (
          <div className="bags-leg">
            <div className="bags-route">
              <span className="bags-carrier-icon">✈</span>
              <span>
                {search.destination} → {search.origin}
              </span>
            </div>
            <button type="button" className="btn-ghost">{t("customise.bags.view")}</button>
          </div>
        )}
        <p className="muted small bags-note">{t("customise.bags.note")}</p>
      </div>

      {/* ── Offres exclusives ── */}
      <div className="cust-banner cust-banner--green">
        <h3 className="cust-banner-title">{t("customise.extras.title")}</h3>
        <p className="cust-banner-sub">{t("customise.extras.sub")}</p>
      </div>
      <div className="panel detail-panel">
        <label className="bundle-row">
          <input
            type="checkbox"
            checked={bundle}
            onChange={(e) => setBundle(e.target.checked)}
          />
          <span>{t("customise.extras.bundle")}</span>
          <span className="badge-discount">{t("customise.extras.discount")}</span>
        </label>

        <div className="extras-grid">
          {EXTRAS_CATALOG.map((extra) => (
            <button
              key={extra.id}
              type="button"
              className={selectedExtras.has(extra.id) ? "extra-card active" : "extra-card"}
              onClick={() => toggleExtra(extra.id)}
            >
              <div className="extra-top-row">
                <span className="extra-price">{formatCents(extra.price_cents)}</span>
                <span className="extra-check">{selectedExtras.has(extra.id) ? "☑" : "☐"}</span>
              </div>
              <div className="extra-icon">{t(`customise.extras.${extra.id}.icon`)}</div>
              <div className="extra-name">{t(`customise.extras.${extra.id}.name`)}</div>
              <div className="muted small extra-desc">{t(`customise.extras.${extra.id}.desc`)}</div>
              <span className="extra-info-link">{t("customise.extras.more")}</span>
            </button>
          ))}
        </div>

        <div className="extras-footer">
          <span className="muted small">{t("customise.extras.tripadd")}</span>
          <div className="extras-total-row">
            <span className="muted small">{t("customise.extras.total")}</span>
            <strong>{formatCents(extrasTotal)}</strong>
          </div>
        </div>
      </div>

      <button type="button" className="btn-primary block" onClick={onContinue}>
        {t("customise.continue")}
      </button>
    </section>
  );
}
