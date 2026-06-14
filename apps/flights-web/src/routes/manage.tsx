import { formatCents } from "@sensei/utils";
import { type FormEvent, useState } from "react";
import { type BookingRecord, type FlightLeg, findBooking } from "../booking-store";
import { useI18n } from "../i18n";

export function ManagePage() {
  const { t } = useI18n();
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [notFound, setNotFound] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = findBooking(ref, email);
    setBooking(found);
    setNotFound(!found);
  }

  if (booking) {
    return <Overview booking={booking} onBack={() => setBooking(null)} />;
  }

  return (
    <section className="manage-wrap">
      <div className="manage-card">
        <h2 className="page-title">{t("manage.title")}</h2>
        <p className="muted small">{t("manage.subtitle")}</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="field">
            <span>{t("manage.ref")}</span>
            <input value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} placeholder="SN-XXX-XXXXX" />
          </label>
          <label className="field">
            <span>{t("manage.email")}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          {notFound && <p className="declined">⚠ {t("manage.notFound")}</p>}

          <button className="btn-primary block" type="submit">
            {t("manage.login")}
          </button>
        </form>
      </div>

      <aside className="manage-aside">
        <strong>{t("manage.benefit.title")}</strong>
        <p>{t("manage.benefit.body")}</p>
      </aside>
    </section>
  );
}

function Leg({ leg, label }: { leg: FlightLeg; label: string }) {
  return (
    <div className="leg-row">
      <span className="leg-tag">{label}</span>
      <div className="leg-body">
        <strong>
          {leg.from} {leg.departTime} → {leg.to} {leg.arriveTime}
        </strong>
        <span className="muted small">
          {leg.departDate} · {leg.carrier} {leg.flightNumber}
        </span>
      </div>
    </div>
  );
}

function Overview({ booking, onBack }: { booking: BookingRecord; onBack: () => void }) {
  const { t } = useI18n();
  return (
    <section className="page">
      <div className="page-head">
        <h2 className="page-title">{booking.contact.full_name}</h2>
        <button type="button" className="link-back" onClick={onBack}>
          ← {t("manage.back")}
        </button>
      </div>

      <div className="ref-grid">
        <div className="ref-card">
          <span className="ref-label">{t("manage.status")}</span>
          <span className={`status-chip bk-${booking.status}`}>{t(`status.${booking.status}`)}</span>
        </div>
        <div className="ref-card">
          <span className="ref-label">{t("manage.ourRef")}</span>
          <span className="ref-value">{booking.booking_ref}</span>
        </div>
        <div className="ref-card">
          <span className="ref-label">{t("manage.airlineRef")}</span>
          <span className="ref-value">{booking.provider_booking_ref ?? t("confirm.processing")}</span>
        </div>
      </div>

      <div className="panel detail-panel">
        <div className="panel-head">
          <span className="panel-icon">✈</span>
          <h3 className="panel-title">{t("manage.flight")}</h3>
        </div>
        <Leg leg={booking.outbound} label={t("results.outbound")} />
        {booking.inbound && <Leg leg={booking.inbound} label={t("results.return")} />}
        <div className="sum-total">
          <span>{t("checkout.total")}</span>
          <strong>{formatCents(booking.total_cents)}</strong>
        </div>
      </div>

      <div className="panel detail-panel">
        <div className="panel-head">
          <span className="panel-icon">🧍</span>
          <h3 className="panel-title">{t("manage.passengers")}</h3>
        </div>
        {booking.passengers.map((p, i) => (
          <div key={i} className="pax-summary">
            <strong>
              {t(`title.${p.title}`)} {p.first_name} {p.middle_name} {p.last_name}
            </strong>
            <span className="muted small">{p.birth_date}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
