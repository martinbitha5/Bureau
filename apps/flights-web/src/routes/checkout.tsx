import { Link, getRouteApi } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { buildInstallments, decideBnpl, scoreToBand } from "@sensei/payments";
import { formatCents } from "@sensei/utils";
import { useI18n } from "../i18n";

export interface CheckoutSearch {
  origin: string;
  destination: string;
  carrier: string;
  flightNumber: string;
  totalCents: number;
}

const route = getRouteApi("/checkout");

type Method = "mobile_money" | "bnpl";

export function CheckoutPage() {
  const { t } = useI18n();
  const search = route.useSearch();
  const [method, setMethod] = useState<Method>("bnpl");
  const [installmentCount, setInstallmentCount] = useState(4);
  const [score, setScore] = useState(620); // simulé (sans auth) — viendra du profil de crédit
  const [confirmed, setConfirmed] = useState(false);

  const decision = useMemo(
    () => decideBnpl({ score, principalCents: search.totalCents, installmentCount }),
    [score, search.totalCents, installmentCount],
  );
  const schedule = useMemo(
    () => (decision.approved ? buildInstallments(decision.totalCents, decision.installmentCount, new Date()) : []),
    [decision],
  );

  return (
    <section className="page checkout">
      <div className="page-head">
        <h2 className="page-title">{t("checkout.title")}</h2>
        <Link
          to="/results"
          search={{
            origin: search.origin,
            destination: search.destination,
            departDate: "",
            passengers: 1,
            cabin: "economy",
          }}
          className="link-back"
        >
          ← {search.origin} → {search.destination}
        </Link>
      </div>

      <div className="checkout-grid">
        <div className="panel">
          <h3 className="panel-title">{t("checkout.method")}</h3>

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

              <label className="field">
                <span>
                  {t("checkout.score")} : <strong>{score}</strong> ({scoreToBand(score)})
                </span>
                <input
                  type="range"
                  min={400}
                  max={850}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                />
                <span className="muted small">{t("checkout.scoreHint")}</span>
              </label>
            </div>
          )}
        </div>

        <div className="panel summary">
          <h3 className="panel-title">{t("checkout.summary")}</h3>
          <div className="sum-row">
            <span>
              {search.carrier} · {search.flightNumber}
            </span>
            <strong>{formatCents(search.totalCents)}</strong>
          </div>

          {method === "bnpl" && decision.approved && (
            <>
              <div className="schedule">
                <div className="sched-title">{t("checkout.schedule")}</div>
                {schedule.map((p, i) => (
                  <div key={p.sequence} className="sched-row">
                    <span>
                      {i === 0 ? t("checkout.dueNow") : `${t("checkout.due")} ${p.sequence} · ${p.dueDate}`}
                    </span>
                    <strong>{formatCents(p.amountCents)}</strong>
                  </div>
                ))}
              </div>
              <p className="no-fees">✓ {t("checkout.noFees")}</p>
            </>
          )}

          {method === "bnpl" && !decision.approved && (
            <p className="declined">⚠ {t("checkout.declined")}</p>
          )}

          <div className="sum-total">
            <span>{t("checkout.total")}</span>
            <strong>{formatCents(search.totalCents)}</strong>
          </div>

          {confirmed ? (
            <p className="confirmed">{t("checkout.confirmed")}</p>
          ) : (
            <button
              type="button"
              className="btn-primary block"
              disabled={method === "bnpl" && !decision.approved}
              onClick={() => setConfirmed(true)}
            >
              {method === "bnpl"
                ? t("checkout.confirm")
                : t("checkout.payFull", { amount: formatCents(search.totalCents) })}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
