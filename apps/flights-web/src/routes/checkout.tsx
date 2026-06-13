import { type FlightOffer, confirmBnplBooking } from "@sensei/api-client";
import { buildInstallments, decideBnpl, scoreToBand } from "@sensei/payments";
import { formatCents } from "@sensei/utils";
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import { supabase } from "../supabase";

export interface CheckoutSearch {
  origin: string;
  destination: string;
  departDate: string;
  passengers: number;
  cabin: "economy" | "premium" | "business";
  carrier: string;
  flightNumber: string;
  providerOfferId: string;
  totalCents: number;
}

const route = getRouteApi("/checkout");

type Method = "mobile_money" | "bnpl";

export function CheckoutPage() {
  const { t } = useI18n();
  const { session, appUser } = useAuth();
  const navigate = useNavigate();
  const search = route.useSearch();

  const [method, setMethod] = useState<Method>("bnpl");
  const [installmentCount, setInstallmentCount] = useState(4);
  const [sliderScore, setSliderScore] = useState(620);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connecté : score réel du profil de crédit. Sinon : simulateur (slider).
  const score = appUser ? appUser.score : sliderScore;

  const decision = useMemo(
    () => decideBnpl({ score, principalCents: search.totalCents, installmentCount }),
    [score, search.totalCents, installmentCount],
  );
  const schedule = useMemo(
    () =>
      decision.approved
        ? buildInstallments(decision.totalCents, decision.installmentCount, new Date())
        : [],
    [decision],
  );

  async function onConfirm() {
    if (!session || !appUser) {
      navigate({ to: "/login" });
      return;
    }
    if (method === "mobile_money") {
      setConfirmedRef("MM-SIMULÉ");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const offer: FlightOffer = {
        providerOfferId: search.providerOfferId,
        provider: "mock",
        totalCents: search.totalCents,
        currency: "USD",
        expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
        segments: [
          {
            from: search.origin,
            to: search.destination,
            departAt: `${search.departDate}T08:00:00Z`,
            arriveAt: `${search.departDate}T12:00:00Z`,
            carrier: search.carrier,
            flightNumber: search.flightNumber,
          },
        ],
      };
      const result = await confirmBnplBooking(supabase, {
        userId: appUser.appUserId,
        score: appUser.score,
        installmentCount,
        search: {
          origin: search.origin,
          destination: search.destination,
          departDate: search.departDate,
          passengers: search.passengers,
          cabin: search.cabin,
        },
        offer,
      });
      if (!result.bookingId) {
        setError(t("checkout.declined"));
      } else {
        setConfirmedRef(result.bookingId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page checkout">
      <div className="page-head">
        <h2 className="page-title">{t("checkout.title")}</h2>
        <Link
          to="/results"
          search={{
            origin: search.origin,
            destination: search.destination,
            departDate: search.departDate,
            passengers: search.passengers,
            cabin: search.cabin,
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

              <div className="field">
                <span>
                  {t("checkout.score")} : <strong>{score}</strong> ({scoreToBand(score)})
                </span>
                {appUser ? (
                  <span className="muted small">{t("checkout.scoreReal")}</span>
                ) : (
                  <>
                    <input
                      type="range"
                      min={400}
                      max={850}
                      value={sliderScore}
                      onChange={(e) => setSliderScore(Number(e.target.value))}
                    />
                    <span className="muted small">{t("checkout.scoreHint")}</span>
                  </>
                )}
              </div>
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
                      {i === 0
                        ? t("checkout.dueNow")
                        : `${t("checkout.due")} ${p.sequence} · ${p.dueDate}`}
                    </span>
                    <strong>{formatCents(p.amountCents)}</strong>
                  </div>
                ))}
              </div>
              <p className="no-fees">✓ {t("checkout.noFees")}</p>
            </>
          )}

          {method === "bnpl" && !decision.approved && <p className="declined">⚠ {t("checkout.declined")}</p>}

          <div className="sum-total">
            <span>{t("checkout.total")}</span>
            <strong>{formatCents(search.totalCents)}</strong>
          </div>

          {error && <p className="declined">⚠ {error}</p>}

          {confirmedRef ? (
            <p className="confirmed">
              {t("checkout.confirmed")} {confirmedRef !== "MM-SIMULÉ" && `(#${confirmedRef.slice(0, 8)})`}
            </p>
          ) : (
            <button
              type="button"
              className="btn-primary block"
              disabled={busy || (method === "bnpl" && !decision.approved)}
              onClick={onConfirm}
            >
              {!session
                ? t("auth.loginToBook")
                : busy
                  ? "…"
                  : method === "bnpl"
                    ? t("checkout.confirm")
                    : t("checkout.payFull", { amount: formatCents(search.totalCents) })}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
