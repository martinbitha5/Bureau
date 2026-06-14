import { formatCents } from "@sensei/utils";
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import {
  type ContactChannel,
  type PassengerDraft,
  type PassengerTitle,
  saveDraft,
} from "../booking-store";
import { useI18n } from "../i18n";

/** Paramètres du vol sélectionné, transportés depuis les résultats. */
export interface DetailsSearch {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  tripType: "round" | "oneway";
  passengers: number;
  cabin: "economy" | "premium" | "business";
  carrier: string;
  flightNumber: string;
  providerOfferId: string;
  totalCents: number;
  departTime: string;
  arriveTime: string;
}

const route = getRouteApi("/details");
const TITLES: PassengerTitle[] = ["mr", "mrs", "ms", "mx"];

function emptyPassenger(): PassengerDraft {
  return {
    title: "mr",
    first_name: "",
    middle_name: "",
    last_name: "",
    birth_date: "",
    type: "adult",
  };
}

export function DetailsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = route.useSearch();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+243");
  const [optIn, setOptIn] = useState(false);
  const [channel, setChannel] = useState<ContactChannel>("email");
  const [pax, setPax] = useState<PassengerDraft[]>(() =>
    Array.from({ length: Math.max(1, search.passengers) }, emptyPassenger),
  );
  const [error, setError] = useState(false);

  function updatePax(i: number, patch: Partial<PassengerDraft>) {
    setPax((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const contactOk = fullName.trim() && email.trim() && phone.trim();
    const paxOk = pax.every((p) => p.first_name.trim() && p.last_name.trim() && p.birth_date);
    if (!contactOk || !paxOk) {
      setError(true);
      return;
    }
    saveDraft({
      contact: {
        full_name: fullName.trim(),
        contact_email: email.trim(),
        contact_phone: phone.trim(),
        contact_opt_in: optIn,
        contact_channel: channel,
      },
      passengers: pax.map((p) => ({
        ...p,
        first_name: p.first_name.trim(),
        middle_name: p.middle_name.trim(),
        last_name: p.last_name.trim(),
      })),
    });
    navigate({ to: "/customise", search });
  }

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">{t("details.title")}</h2>
          <p className="muted">
            {search.carrier} · {formatCents(search.totalCents)}
          </p>
        </div>
        <Link
          to="/results"
          search={{
            origin: search.origin,
            destination: search.destination,
            departDate: search.departDate,
            returnDate: search.returnDate,
            tripType: search.tripType,
            passengers: search.passengers,
            cabin: search.cabin,
          }}
          className="link-back"
        >
          ← {t("results.back")}
        </Link>
      </div>

      {/* Détails du vol */}
      <div className="panel detail-panel">
        <div className="panel-head">
          <span className="panel-icon">✈</span>
          <div>
            <h3 className="panel-title">{t("details.flight")}</h3>
            <p className="muted small">{t("details.flightHint")}</p>
          </div>
        </div>
        <div className="leg-row">
          <span className="leg-tag">{t("results.outbound")}</span>
          <div className="leg-body">
            <strong>
              {search.origin} {search.departTime} → {search.destination} {search.arriveTime}
            </strong>
            <span className="muted small">
              {search.departDate} · {search.carrier} {search.flightNumber} · {t("results.nonstop")}
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
              <span className="muted small">
                {search.returnDate} · {search.carrier} · {t("results.nonstop")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Règles tarifaires */}
      <details className="panel fare-rules">
        <summary className="panel-head">
          <span className="panel-icon">📄</span>
          <div>
            <h3 className="panel-title">{t("details.fareRules")}</h3>
            <p className="muted small">{t("details.fareRulesHint")}</p>
          </div>
        </summary>
        <p className="muted fare-body">{t("details.fareRulesBody")}</p>
      </details>

      <form onSubmit={onSubmit}>
        {/* Coordonnées */}
        <div className="panel detail-panel">
          <div className="panel-head">
            <span className="panel-icon">📞</span>
            <div>
              <h3 className="panel-title">{t("details.contact")}</h3>
              <p className="muted small">{t("details.contactHint")}</p>
            </div>
          </div>
          <div className="field-row">
            <label className="field">
              <span>{t("details.contactName")}</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </label>
            <label className="field">
              <span>{t("details.email")}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span>{t("details.phone")}</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <div className="field" />
          </div>

          <div className="stay-box">
            <div className="stay-head">
              <div>
                <strong>{t("details.stayInTouch")}</strong>
                <p className="muted small">{t("details.stayInTouchHint")}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={optIn}
                className={optIn ? "toggle on" : "toggle"}
                onClick={() => setOptIn((v) => !v)}
              >
                <span className="toggle-knob" />
              </button>
            </div>
            {optIn && (
              <div className="seg seg-channel">
                {(["email", "sms"] as ContactChannel[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={channel === c ? "seg-btn active" : "seg-btn"}
                    onClick={() => setChannel(c)}
                  >
                    {t(`details.channel.${c}`)}
                  </button>
                ))}
              </div>
            )}
            {optIn && channel === "sms" && <p className="muted small">{t("details.consent")}</p>}
          </div>
        </div>

        {/* Détails du passager */}
        <div className="panel detail-panel">
          <div className="panel-head">
            <span className="panel-icon">🧍</span>
            <div>
              <h3 className="panel-title">{t("details.passengers")}</h3>
              <p className="muted small">{t("details.passengersHint")}</p>
            </div>
          </div>

          {pax.map((p, i) => (
            <div key={i} className="pax-block">
              <div className="pax-title">{t("details.passenger", { n: String(i + 1) })}</div>
              <div className="field-row">
                <label className="field pax-civility">
                  <span>{t("details.passengerTitle")}</span>
                  <select
                    value={p.title}
                    onChange={(e) => updatePax(i, { title: e.target.value as PassengerTitle })}
                  >
                    {TITLES.map((tt) => (
                      <option key={tt} value={tt}>
                        {t(`title.${tt}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>{t("details.firstName")}</span>
                  <input value={p.first_name} onChange={(e) => updatePax(i, { first_name: e.target.value })} />
                </label>
                <label className="field">
                  <span>{t("details.middleName")}</span>
                  <input value={p.middle_name} onChange={(e) => updatePax(i, { middle_name: e.target.value })} />
                </label>
              </div>
              <div className="field-row">
                <label className="field">
                  <span>{t("details.lastName")}</span>
                  <input value={p.last_name} onChange={(e) => updatePax(i, { last_name: e.target.value })} />
                </label>
                <label className="field">
                  <span>{t("details.birthDate")}</span>
                  <input
                    type="date"
                    value={p.birth_date}
                    onChange={(e) => updatePax(i, { birth_date: e.target.value })}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="declined">⚠ {t("details.required")}</p>}

        <button className="btn-primary block" type="submit">
          {t("details.continue")}
        </button>
      </form>
    </section>
  );
}
