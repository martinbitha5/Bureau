import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { useI18n } from "../i18n";

export function SearchPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("FIH");
  const [destination, setDestination] = useState("JNB");
  const [departDate, setDepartDate] = useState("2026-08-15");
  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState<"economy" | "premium" | "business">("economy");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    navigate({ to: "/results", search: { origin, destination, departDate, passengers, cabin } });
  }

  return (
    <section className="hero">
      <h1 className="hero-title">{t("search.title")}</h1>
      <p className="hero-sub">{t("search.subtitle")}</p>

      <form className="search-card" onSubmit={onSubmit}>
        <div className="field-row">
          <label className="field">
            <span>{t("search.origin")}</span>
            <input value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())} maxLength={3} />
          </label>
          <label className="field">
            <span>{t("search.destination")}</span>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              maxLength={3}
            />
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <span>{t("search.date")}</span>
            <input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)} />
          </label>
          <label className="field">
            <span>{t("search.passengers")}</span>
            <input
              type="number"
              min={1}
              max={9}
              value={passengers}
              onChange={(e) => setPassengers(Math.max(1, Number(e.target.value)))}
            />
          </label>
          <label className="field">
            <span>{t("search.cabin")}</span>
            <select value={cabin} onChange={(e) => setCabin(e.target.value as typeof cabin)}>
              <option value="economy">{t("cabin.economy")}</option>
              <option value="premium">{t("cabin.premium")}</option>
              <option value="business">{t("cabin.business")}</option>
            </select>
          </label>
        </div>
        <button className="btn-primary" type="submit">
          {t("search.cta")}
        </button>
      </form>
    </section>
  );
}
