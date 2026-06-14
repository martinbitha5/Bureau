import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { useI18n } from "../i18n";

const POPULAR = [
  { origin: "FIH", destination: "JNB", label: "Kinshasa → Johannesburg" },
  { origin: "FIH", destination: "NBO", label: "Kinshasa → Nairobi" },
  { origin: "FBM", destination: "FIH", label: "Lubumbashi → Kinshasa" },
  { origin: "FIH", destination: "CDG", label: "Kinshasa → Paris" },
];

type TripType = "round" | "oneway" | "multi";

export function SearchPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<TripType>("round");
  const [origin, setOrigin] = useState("FIH");
  const [destination, setDestination] = useState("JNB");
  const [departDate, setDepartDate] = useState("2026-08-15");
  const [returnDate, setReturnDate] = useState("2026-08-22");
  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState<"economy" | "premium" | "business">("economy");

  function go(o: string, d: string) {
    navigate({
      to: "/results",
      search: {
        origin: o,
        destination: d,
        departDate,
        returnDate: tripType === "round" ? returnDate : "",
        tripType: tripType === "multi" ? "oneway" : tripType,
        passengers,
        cabin,
      },
    });
  }
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    go(origin, destination);
  }

  const why = ["1", "2", "3"];
  const trips: TripType[] = ["round", "oneway", "multi"];

  return (
    <>
      <section className="hero">
        <h1 className="hero-title">{t("search.title")}</h1>
        <p className="hero-sub">{t("search.subtitle")}</p>

        <div className="trip-tabs">
          {trips.map((tt) => (
            <button
              key={tt}
              type="button"
              className={tt === tripType ? "trip-tab active" : "trip-tab"}
              onClick={() => setTripType(tt)}
              disabled={tt === "multi"}
              title={tt === "multi" ? "Bientôt disponible" : undefined}
            >
              {t(`trip.${tt}`)}
            </button>
          ))}
        </div>

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
            {tripType === "round" && (
              <label className="field">
                <span>{t("search.returnDate")}</span>
                <input
                  type="date"
                  value={returnDate}
                  min={departDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </label>
            )}
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

        <div className="trust-row">
          <span className="trust-item">✓ {t("search.trust.1")}</span>
          <span className="trust-item">✓ {t("search.trust.2")}</span>
          <span className="trust-item">✓ {t("search.trust.3")}</span>
        </div>
      </section>

      <section className="popular">
        <h3 className="section-title">{t("search.popular")}</h3>
        <div className="route-chips">
          {POPULAR.map((r) => (
            <button
              key={r.label}
              type="button"
              className="route-chip"
              onClick={() => go(r.origin, r.destination)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </section>

      <section className="why">
        <h3 className="section-title">{t("home.why.title")}</h3>
        <div className="why-grid">
          {why.map((n) => (
            <div key={n} className="why-card">
              <h4>{t(`home.why.${n}.title`)}</h4>
              <p className="muted">{t(`home.why.${n}.body`)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
