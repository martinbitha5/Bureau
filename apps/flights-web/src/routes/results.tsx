import { flightSearchOptions } from "@sensei/api-client";
import { formatCents } from "@sensei/utils";
import { useQuery } from "@tanstack/react-query";
import { Link, getRouteApi } from "@tanstack/react-router";
import { useI18n } from "../i18n";

export interface ResultsSearch {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  tripType: "round" | "oneway";
  passengers: number;
  cabin: "economy" | "premium" | "business";
}

const route = getRouteApi("/results");

export function ResultsPage() {
  const { t } = useI18n();
  const search = route.useSearch();
  const { data: offers, isLoading } = useQuery(
    flightSearchOptions({
      origin: search.origin,
      destination: search.destination,
      departDate: search.departDate,
      returnDate: search.tripType === "round" ? search.returnDate : null,
      passengers: search.passengers,
      cabin: search.cabin,
    }),
  );

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">{t("results.title")}</h2>
          <p className="muted">
            {search.origin} → {search.destination}
            {search.tripType === "round" && ` → ${search.origin}`} · {search.passengers}{" "}
            {search.passengers > 1 ? t("common.passengers") : t("common.passenger")}
          </p>
        </div>
        <Link to="/" className="link-back">
          ← {t("results.back")}
        </Link>
      </div>

      {isLoading && <p className="muted">{t("results.loading")}</p>}
      {!isLoading && (!offers || offers.length === 0) && <p className="muted">{t("results.empty")}</p>}

      <ul className="offer-list">
        {offers?.map((offer) => {
          const seg = offer.segments[0]!;
          return (
            <li key={offer.providerOfferId} className="offer-card">
              <div className="offer-main">
                <div className="offer-carrier">{seg.carrier}</div>
                <div className="offer-route">
                  <span className="iata">{seg.from}</span>
                  <span className="offer-line">— {t("results.nonstop")} —</span>
                  <span className="iata">{seg.to}</span>
                </div>
                <div className="muted small">
                  {seg.flightNumber} · {seg.departAt.slice(11, 16)} → {seg.arriveAt.slice(11, 16)}
                  {search.tripType === "round" && ` · ${t("results.return")} ${search.returnDate}`}
                </div>
              </div>
              <div className="offer-side">
                <div className="offer-price">{formatCents(offer.totalCents)}</div>
                <Link
                  to="/details"
                  search={{
                    origin: seg.from,
                    destination: seg.to,
                    departDate: search.departDate,
                    returnDate: search.tripType === "round" ? search.returnDate : "",
                    tripType: search.tripType,
                    passengers: search.passengers,
                    cabin: search.cabin,
                    carrier: seg.carrier,
                    flightNumber: seg.flightNumber,
                    providerOfferId: offer.providerOfferId,
                    totalCents: offer.totalCents,
                    departTime: seg.departAt.slice(11, 16),
                    arriveTime: seg.arriveAt.slice(11, 16),
                  }}
                  className="btn-primary small"
                >
                  {t("results.choose")}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
