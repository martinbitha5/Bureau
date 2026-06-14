import { creditProfileOptions, creditScoreEventsOptions } from "@sensei/api-client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import { supabase } from "../supabase";

const SCORE_MIN = 300;
const SCORE_MAX = 850;

/** Vue « Mon score » de l'utilisateur connecté. */
export function DashboardView() {
  const { t, lang } = useI18n();
  const { appUser } = useAuth();

  const userId = appUser?.appUserId ?? "";
  const { data: profile } = useQuery({
    ...creditProfileOptions(supabase, userId),
    enabled: !!userId,
  });
  const { data: events } = useQuery({
    ...creditScoreEventsOptions(supabase, userId),
    enabled: !!userId,
  });

  if (!profile) return <p className="muted">{t("score.loading")}</p>;

  const score = profile.current_score as number;
  const band = profile.score_band as string;
  const pct = ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;
  const updated = profile.score_updated_at
    ? new Date(profile.score_updated_at as string).toLocaleDateString(lang)
    : "";

  const factors = [
    { key: "ontime", weight: "35%" },
    { key: "usage", weight: "30%" },
    { key: "history", weight: "15%" },
  ] as const;

  return (
    <section className="page">
      <h2 className="page-title">{t("score.title")}</h2>

      <div className="score-card">
        <div className="score-top">
          <div className={`score-number band-${band}`}>{score}</div>
          <span className={`band-chip band-${band}`}>{t(`score.band.${band}`)}</span>
        </div>

        <div className="gauge">
          <div className="gauge-track">
            <div className="gauge-marker" style={{ left: `${pct}%` }} />
          </div>
          <div className="gauge-scale">
            <span>{SCORE_MIN}</span>
            <span>{SCORE_MAX}</span>
          </div>
        </div>

        {updated && (
          <p className="muted small">
            {t("score.updated")} {updated}
          </p>
        )}
        <Link to="/report" className="inline-link">
          {t("score.report.link")} →
        </Link>
      </div>

      <h3 className="section-title">{t("score.factors.title")}</h3>
      <div className="factor-grid">
        {factors.map((f) => (
          <div key={f.key} className="factor-card">
            <div className="factor-head">
              <span className="factor-name">{t(`score.factor.${f.key}`)}</span>
              <span className="factor-weight">{f.weight}</span>
            </div>
            <p className="muted small">{t(`score.factor.${f.key}.body`)}</p>
          </div>
        ))}
      </div>

      <h3 className="section-title">{t("score.history")}</h3>
      {(!events || events.length === 0) && <p className="muted">{t("score.empty")}</p>}
      <ul className="event-list">
        {events?.map((e) => {
          const delta = (e.new_score as number) - (e.previous_score as number);
          return (
            <li key={e.id as string} className="event-row">
              <div>
                <div className="event-reason">{t(`score.reason.${e.reason_code}`)}</div>
                <div className="muted small">
                  {new Date(e.created_at as string).toLocaleDateString(lang)} · {String(e.source)}
                </div>
              </div>
              <div className="event-right">
                <span className={delta >= 0 ? "delta up" : "delta down"}>
                  {delta >= 0 ? `+${delta}` : delta}
                </span>
                <span className="muted small">→ {e.new_score as number}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
