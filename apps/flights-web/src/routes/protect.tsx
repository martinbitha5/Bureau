import { formatCents } from "@sensei/utils";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  BAGS_PROT_PRICE_CENTS,
  CANCEL_PRICE_CENTS,
  loadProtect,
  saveProtect,
} from "../booking-store";
import { StepBar } from "../components/StepBar";
import { useI18n } from "../i18n";
import type { DetailsSearch } from "./details";

export type ProtectSearch = DetailsSearch;

const route = getRouteApi("/protect");

export function ProtectPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = route.useSearch();

  const saved = loadProtect();
  const [cancel, setCancel] = useState<boolean>(saved?.cancellation_protection ?? true);
  const [bags, setBags] = useState<boolean>(saved?.baggage_protection ?? false);

  function onContinue() {
    saveProtect({ cancellation_protection: cancel, baggage_protection: bags });
    navigate({ to: "/summary", search });
  }

  return (
    <section className="page">
      <StepBar current={4} />

      <h2 className="page-title">{t("protect.title")}</h2>

      {/* ── Annulation d'urgence ── */}
      <div className="cust-banner cust-banner--lime">
        <h3 className="cust-banner-title">{t("protect.cancel.title")}</h3>
        <p className="cust-banner-sub">{t("protect.cancel.sub")}</p>
      </div>
      <div className="panel detail-panel">
        <div className="protect-options">
          <button
            type="button"
            className={cancel ? "protect-opt active" : "protect-opt"}
            onClick={() => setCancel(true)}
          >
            <div className="protect-opt-check">{cancel ? "●" : "○"}</div>
            <div className="protect-opt-label">{t("protect.cancel.add")}</div>
            <div className="protect-opt-price">{formatCents(CANCEL_PRICE_CENTS)}</div>
            {cancel && <span className="protect-badge">{t("protect.recommended")}</span>}
          </button>
          <button
            type="button"
            className={!cancel ? "protect-opt active" : "protect-opt"}
            onClick={() => setCancel(false)}
          >
            <div className="protect-opt-check">{!cancel ? "●" : "○"}</div>
            <div className="protect-opt-label">{t("protect.cancel.none")}</div>
            <div className="protect-opt-price">{formatCents(0)}</div>
          </button>
        </div>

        {cancel && (
          <ul className="protect-benefits">
            {(["b1", "b2", "b3", "b4"] as const).map((k) => (
              <li key={k}>
                <span className="benefit-dot">✓</span>
                {t(`protect.cancel.${k}`)}
              </li>
            ))}
          </ul>
        )}
        {!cancel && <p className="muted small protect-no-prot">{t("protect.no_protection")}</p>}
      </div>

      {/* ── Protection des bagages ── */}
      <div className="cust-banner cust-banner--indigo">
        <h3 className="cust-banner-title">{t("protect.bags.title")}</h3>
        <p className="cust-banner-sub">{t("protect.bags.sub")}</p>
      </div>
      <div className="panel detail-panel">
        <div className="protect-options">
          <button
            type="button"
            className={bags ? "protect-opt active" : "protect-opt"}
            onClick={() => setBags(true)}
          >
            <div className="protect-opt-check">{bags ? "●" : "○"}</div>
            <div className="protect-opt-label">{t("protect.bags.add")}</div>
            <div className="protect-opt-price">{formatCents(BAGS_PROT_PRICE_CENTS)}</div>
          </button>
          <button
            type="button"
            className={!bags ? "protect-opt active" : "protect-opt"}
            onClick={() => setBags(false)}
          >
            <div className="protect-opt-check">{!bags ? "●" : "○"}</div>
            <div className="protect-opt-label">{t("protect.bags.none")}</div>
            <div className="protect-opt-price">{formatCents(0)}</div>
          </button>
        </div>

        {bags && (
          <ul className="protect-benefits">
            {(["b1", "b2", "b3", "b4"] as const).map((k) => (
              <li key={k}>
                <span className="benefit-dot">✓</span>
                {t(`protect.bags.${k}`)}
              </li>
            ))}
          </ul>
        )}
        {!bags && <p className="muted small protect-no-prot">{t("protect.no_protection")}</p>}
      </div>

      <button type="button" className="btn-primary block" onClick={onContinue}>
        {t("protect.continue")}
      </button>
    </section>
  );
}
