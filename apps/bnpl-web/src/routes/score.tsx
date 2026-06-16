import { creditProfileOptions, creditScoreEventsOptions } from "@sensei/api-client";
import { maxPrincipalForScore } from "@sensei/payments";
import { formatCents } from "@sensei/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth";
import {
  AppContainer,
  Badge,
  Card,
  EmptyState,
  IconCalendar,
  IconCheck,
  IconTrend,
  IconWallet,
  InfoNote,
  PageHeader,
  ScoreGauge,
  Spinner,
  cx,
} from "../components";
import { useI18n } from "../i18n";
import { supabase } from "../supabase";
import { RequireAuth } from "../components/RequireAuth";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ScoreEvent {
  id: string;
  previous_score: number;
  new_score: number;
  reason_code: string;
  source: string;
  created_at: string;
}

interface CreditProfile {
  current_score: number | null;
  score_band: string | null;
  score_updated_at: string | null;
}

// ── Route ──────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/score")({
  component: () => (
    <RequireAuth>
      <ScorePage />
    </RequireAuth>
  ),
});

// ── Page ───────────────────────────────────────────────────────────────────────

function ScorePage() {
  const { t, lang } = useI18n();
  const { appUser } = useAuth();
  const userId = appUser?.appUserId ?? "";

  // Score brut depuis appUser (fallback)
  const appScore = appUser?.score ?? 600;

  // Profil de crédit (score + tranche + date de mise à jour)
  const { data: profileData, isLoading: profileLoading } = useQuery({
    ...creditProfileOptions(supabase, userId),
    enabled: !!userId,
  });

  // Historique des événements de score
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    ...creditScoreEventsOptions(supabase, userId),
    enabled: !!userId,
  });

  const isLoading = profileLoading || eventsLoading;

  // Score final : priorité au profil, sinon appUser
  const profile = profileData as CreditProfile | undefined;
  const score = profile?.current_score ?? appScore;
  const scoreUpdatedAt = profile?.score_updated_at ?? null;
  const events = (eventsData ?? []) as ScoreEvent[];
  const limit = maxPrincipalForScore(score);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-6 h-6 text-sensei-bright animate-spin" />
      </div>
    );
  }

  return (
    <AppContainer>
      {/* En-tête de page */}
      <PageHeader title={t("score.title")} subtitle={t("score.subtitle")} />

      {/* ── Carte héros : jauge + méta ─────────────────────────────── */}
      <Card className="mb-5 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Jauge */}
          <div className="flex-shrink-0">
            <ScoreGauge score={score} size={220} showBand />
          </div>

          {/* Méta */}
          <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
              {t("score.current")}
            </p>
            <p className="text-5xl font-black tabular-nums text-sensei-ink leading-none">
              {score}
            </p>
            <p className="text-sm text-sensei-muted">{t("score.outOf")}</p>
            {scoreUpdatedAt && (
              <p className="text-xs text-sensei-muted mt-2">
                {t("score.updated")}{" "}
                <span className="font-semibold text-sensei-text">
                  {new Date(scoreUpdatedAt).toLocaleDateString(lang)}
                </span>
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* ── Plafond ────────────────────────────────────────────────── */}
      <Card className="mb-5 p-5 flex items-center gap-4 bg-gradient-to-br from-[#EEF4FB] to-white">
        <div className="w-11 h-11 rounded-xl bg-sensei-bright/10 text-sensei-bright flex items-center justify-center flex-shrink-0">
          <IconWallet className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted mb-0.5">
            {t("score.limitTitle")}
          </p>
          <p className="text-sensei-ink text-sm font-medium">
            {t("score.limitBody", { limit: formatCents(limit) })}
          </p>
        </div>
      </Card>

      {/* ── Historique du score ─────────────────────────────────────── */}
      <section className="mb-7">
        <h2 className="text-lg font-bold text-sensei-ink mb-3">{t("score.history")}</h2>

        {events.length === 0 ? (
          <Card>
            <EmptyState
              icon={<IconTrend className="w-7 h-7" />}
              title={t("score.historyEmpty")}
            />
          </Card>
        ) : (
          <Card>
            <ul className="divide-y divide-sensei-line">
              {events.map((event) => {
                const delta = event.new_score - event.previous_score;
                const isPositive = delta >= 0;
                const label =
                  t(`score.reason.${event.reason_code}`) === `score.reason.${event.reason_code}`
                    ? event.reason_code
                    : t(`score.reason.${event.reason_code}`);

                return (
                  <li key={event.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    {/* Raison + date */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-sensei-ink truncate">{label}</p>
                      <p className="text-xs text-sensei-muted mt-0.5">
                        {new Date(event.created_at).toLocaleDateString(lang)}
                      </p>
                    </div>

                    {/* Nouveau score + delta */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className="text-lg font-black tabular-nums text-sensei-ink">
                        {event.new_score}
                      </p>
                      <Badge tone={isPositive ? "trust" : "danger"}>
                        {isPositive ? "+" : ""}
                        {delta} {t("score.points")}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>

      {/* ── Facteurs ───────────────────────────────────────────────── */}
      <section className="mb-7">
        <h2 className="text-lg font-bold text-sensei-ink mb-3">{t("score.factors.title")}</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Paiements à l'heure */}
          <Card className="p-5">
            <div className="w-10 h-10 rounded-xl bg-sensei-trust/10 text-sensei-trust flex items-center justify-center mb-3">
              <IconCalendar className="w-5 h-5" />
            </div>
            <p className="font-bold text-sensei-ink text-sm mb-1">{t("score.factors.payments")}</p>
            <p className="text-xs text-sensei-muted leading-relaxed">{t("score.factors.paymentsDesc")}</p>
          </Card>

          {/* Utilisation responsable */}
          <Card className="p-5">
            <div className="w-10 h-10 rounded-xl bg-sensei-bright/10 text-sensei-bright flex items-center justify-center mb-3">
              <IconWallet className="w-5 h-5" />
            </div>
            <p className="font-bold text-sensei-ink text-sm mb-1">{t("score.factors.usage")}</p>
            <p className="text-xs text-sensei-muted leading-relaxed">{t("score.factors.usageDesc")}</p>
          </Card>

          {/* Ancienneté */}
          <Card className="p-5">
            <div className="w-10 h-10 rounded-xl bg-sensei-ink/5 text-sensei-ink flex items-center justify-center mb-3">
              <IconTrend className="w-5 h-5" />
            </div>
            <p className="font-bold text-sensei-ink text-sm mb-1">{t("score.factors.history")}</p>
            <p className="text-xs text-sensei-muted leading-relaxed">{t("score.factors.historyDesc")}</p>
          </Card>
        </div>
      </section>

      {/* ── Comment améliorer ──────────────────────────────────────── */}
      <section className="mb-7">
        <h2 className="text-lg font-bold text-sensei-ink mb-3">{t("score.improveTitle")}</h2>

        <Card className="divide-y divide-sensei-line">
          {(["score.improve1", "score.improve2", "score.improve3"] as const).map((key) => (
            <div key={key} className="flex items-start gap-3 px-5 py-4">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-sensei-trust/10 text-sensei-trust flex items-center justify-center">
                <IconCheck className="w-3 h-3" />
              </span>
              <p className="text-sm text-sensei-text leading-relaxed">{t(key)}</p>
            </div>
          ))}
        </Card>
      </section>

      {/* ── Note de transparence ───────────────────────────────────── */}
      <InfoNote>{t("score.transparency")}</InfoNote>
    </AppContainer>
  );
}
