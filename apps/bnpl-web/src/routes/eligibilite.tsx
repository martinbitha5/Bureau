import {
  ALLOWED_INSTALLMENTS,
  MAX_PRINCIPAL_CENTS,
  SCORE_MAX,
  SCORE_MIN,
  buildInstallments,
  decideBnpl,
  maxPrincipalForScore,
  scoreToBand,
} from "@sensei/payments";
import { formatCents, usdToCents } from "@sensei/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../auth";
import {
  AppContainer,
  Badge,
  Card,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconInfo,
  IconShield,
  InfoNote,
  cx,
} from "../components";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/eligibilite")({
  component: EligibilitePage,
});

// ── Constantes ──────────────────────────────────────────────────────────────

const DEFAULT_AMOUNT_USD = 180;
const QUICK_PICKS = [100, 250, 500, 1000] as const;
const DEFAULT_SCORE = 600;

const BANDS: Array<{
  band: keyof typeof MAX_PRINCIPAL_CENTS;
  scoreLabel: string;
}> = [
  { band: "poor", scoreLabel: "< 580" },
  { band: "fair", scoreLabel: "580–669" },
  { band: "good", scoreLabel: "670–739" },
  { band: "very_good", scoreLabel: "740–799" },
  { band: "excellent", scoreLabel: "≥ 800" },
];

// ── Page ────────────────────────────────────────────────────────────────────

function EligibilitePage() {
  const { t } = useI18n();
  const { appUser } = useAuth();

  const connectedScore = appUser?.score ?? null;

  const [amountUsd, setAmountUsd] = useState<number>(DEFAULT_AMOUNT_USD);
  const [installmentCount, setInstallmentCount] = useState<3 | 4>(3);
  const [score, setScore] = useState<number>(connectedScore ?? DEFAULT_SCORE);

  const principalCents = usdToCents(amountUsd);
  const decision = decideBnpl({ score, principalCents, installmentCount });
  const limit = maxPrincipalForScore(score);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-sensei-ink text-white py-16 px-6 overflow-hidden relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(55% 75% at 75% 50%, rgba(30,99,196,0.18) 0%, transparent 70%), radial-gradient(35% 45% at 10% 80%, rgba(18,58,107,0.4) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-sensei-bright/70 bg-sensei-bright/10 px-3 py-1.5 rounded-full mb-5">
            {t("estimate.kicker")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black leading-[1.07] tracking-tight mb-4">
            {t("estimate.title")}
          </h1>
          <p className="text-lg text-white/65 leading-relaxed max-w-[52ch] mx-auto">
            {t("estimate.subtitle")}
          </p>
        </div>
      </section>

      {/* ── Corps ── */}
      <AppContainer>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-2">

          {/* ── Panneau de contrôle (gauche) ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Montant */}
            <Card className="p-6">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-sensei-muted mb-3">
                {t("estimate.amountLabel")}
              </label>

              {/* Quick picks */}
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_PICKS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmountUsd(v)}
                    className={cx(
                      "px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all",
                      amountUsd === v
                        ? "bg-sensei-bright text-white border-sensei-bright shadow-sm"
                        : "bg-sensei-paper text-sensei-text border-sensei-line hover:border-sensei-bright hover:text-sensei-bright",
                    )}
                  >
                    {v} $
                  </button>
                ))}
              </div>

              {/* Input numérique */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sensei-muted font-bold select-none">
                  $
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={amountUsd}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v) && v >= 0) setAmountUsd(v);
                  }}
                  className="w-full pl-8 pr-4 py-3 bg-sensei-paper border border-sensei-line rounded-xl text-sensei-ink font-bold text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-sensei-bright/40 focus:border-sensei-bright transition-all"
                />
              </div>
              <p className="text-xs text-sensei-muted mt-2">{t("estimate.amountHint")}</p>
            </Card>

            {/* Nombre d'échéances */}
            <Card className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted mb-3">
                {t("estimate.installmentsLabel")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(ALLOWED_INSTALLMENTS as readonly number[]).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setInstallmentCount(n as 3 | 4)}
                    className={cx(
                      "py-3.5 rounded-xl text-sm font-bold border transition-all",
                      installmentCount === n
                        ? "bg-sensei-bright text-white border-sensei-bright shadow-sm"
                        : "bg-sensei-paper text-sensei-text border-sensei-line hover:border-sensei-bright hover:text-sensei-bright",
                    )}
                  >
                    {t(`estimate.${n}x` as `estimate.${3 | 4}x`)}
                  </button>
                ))}
              </div>
            </Card>

            {/* Score */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="score-range"
                  className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted"
                >
                  {t("estimate.scoreLabel")}
                </label>
                <span className="text-xl font-black text-sensei-ink tabular-nums">{score}</span>
              </div>

              {connectedScore !== null ? (
                <p className="text-xs text-sensei-trust font-semibold mb-3">
                  {t("estimate.connectedScore")}
                </p>
              ) : (
                <p className="text-xs text-sensei-muted mb-3">{t("estimate.scoreHint")}</p>
              )}

              <input
                id="score-range"
                type="range"
                className="sensei-range w-full"
                min={SCORE_MIN}
                max={SCORE_MAX}
                step={5}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
              />

              {/* Barre de tranche visuelle */}
              <div className="mt-4 flex items-center gap-2">
                <ScoreBandPip score={score} />
              </div>
            </Card>

            {/* Plafond affiché en permanence */}
            <div className="bg-gradient-to-br from-[#EEF4FB] to-white border border-sensei-line rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                  {t("estimate.maxForScore")}
                </p>
                <p className="text-2xl font-black text-sensei-ink tabular-nums mt-0.5">
                  {formatCents(limit)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sensei-bright/10 text-sensei-bright flex items-center justify-center flex-shrink-0">
                <IconShield className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* ── Résultat (droite) ── */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            {decision.approved ? (
              <ApprovedResult
                decision={decision}
                installmentCount={installmentCount}
              />
            ) : (
              <DeclinedResult
                reasonCode={decision.reasonCode}
                score={score}
              />
            )}

            {/* CTA */}
            <Card className="p-6 text-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-sensei-bright text-white font-bold rounded-full hover:bg-sensei-blue transition-all shadow-lg shadow-sensei-bright/20 text-sm mb-3"
              >
                {t("estimate.cta")} <IconArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-sensei-muted">{t("estimate.ctaSub")}</p>
            </Card>

            {/* Disclaimer */}
            <InfoNote>
              {t("estimate.disclaimer")}
            </InfoNote>
          </div>
        </div>

        {/* ── Table des tranches ── */}
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-sensei-blue/10 text-sensei-blue rounded-xl flex items-center justify-center">
              <IconInfo className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-sensei-ink">{t("estimate.bands.title")}</h2>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sensei-paper border-b border-sensei-line">
                    <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                      {t("estimate.bands.score")}
                    </th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                      {t("estimate.bands.band")}
                    </th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                      {t("estimate.bands.limit")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {BANDS.map(({ band, scoreLabel }, idx) => {
                    const isActive = scoreToBand(score) === band;
                    return (
                      <tr
                        key={band}
                        className={cx(
                          "border-b border-sensei-line last:border-0 transition-colors",
                          isActive ? "bg-sensei-bright/5" : idx % 2 === 0 ? "bg-white" : "bg-sensei-paper/40",
                        )}
                      >
                        <td className="px-5 py-3.5 font-semibold text-sensei-text tabular-nums">
                          {scoreLabel}
                          {isActive && (
                            <span className="ml-2 text-[10px] font-bold text-sensei-bright bg-sensei-bright/10 px-2 py-0.5 rounded-full">
                              ▶
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <BandPill band={band} />
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-sensei-ink tabular-nums">
                          {formatCents(MAX_PRINCIPAL_CENTS[band])}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-sensei-line bg-sensei-paper/60">
              <p className="text-xs text-sensei-muted">{t("estimate.bands.note")}</p>
            </div>
          </Card>
        </section>
      </AppContainer>
    </div>
  );
}

// ── Résultat approuvé ────────────────────────────────────────────────────────

function ApprovedResult({
  decision,
  installmentCount,
}: {
  decision: Extract<ReturnType<typeof decideBnpl>, { approved: true }>;
  installmentCount: number;
}) {
  const { t } = useI18n();
  const schedule = buildInstallments(decision.totalCents, installmentCount, new Date());
  const perInstallment = schedule[0]?.amountCents ?? 0;

  return (
    <>
      {/* Carte héros — montant par échéance */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-sensei-ink to-[#1a3a5c] text-white px-6 pt-7 pb-6">
          <div className="flex items-start justify-between gap-4 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">
              {t("estimate.result.each")}
            </p>
            <Badge tone="trust">{t("estimate.result.approvedBadge")}</Badge>
          </div>
          <p className="text-5xl font-black tabular-nums tracking-tight mb-1">
            {formatCents(perInstallment)}
          </p>
          <p className="text-sm text-white/55 mt-1">{t("estimate.result.firstDue")}</p>

          <div className="flex items-center gap-4 mt-5 pt-5 border-t border-white/10 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-0.5">
                {t("estimate.result.total")}
              </p>
              <p className="font-black text-lg tabular-nums">{formatCents(decision.totalCents)}</p>
            </div>
            <span className="w-px h-8 bg-white/10" />
            <span className="text-sm font-bold text-sensei-trust bg-sensei-trust/15 px-3 py-1 rounded-full">
              {t("estimate.result.noFees")}
            </span>
          </div>
        </div>

        {/* Échéancier */}
        <div className="divide-y divide-sensei-line">
          {schedule.map(({ sequence, amountCents, dueDate }) => {
            const isFirst = sequence === 1;
            return (
              <div
                key={sequence}
                className={cx(
                  "flex items-center justify-between px-6 py-4",
                  isFirst ? "bg-sensei-bright/5" : "",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cx(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
                      isFirst
                        ? "bg-sensei-bright text-white"
                        : "bg-sensei-paper border border-sensei-line text-sensei-muted",
                    )}
                  >
                    {sequence}
                  </div>
                  <div>
                    <p className={cx("font-semibold text-sm", isFirst ? "text-sensei-bright" : "text-sensei-text")}>
                      {new Date(dueDate).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cx(
                      "font-black tabular-nums text-base",
                      isFirst ? "text-sensei-bright" : "text-sensei-ink",
                    )}
                  >
                    {formatCents(amountCents)}
                  </span>
                  {isFirst && <IconCalendar className="w-4 h-4 text-sensei-bright/60" />}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Trust signal */}
      <div className="flex items-center gap-2 text-xs text-sensei-trust font-semibold px-1">
        <IconCheck className="w-4 h-4 flex-shrink-0" />
        <span>{t("estimate.result.noFees")}</span>
      </div>
    </>
  );
}

// ── Résultat refusé ──────────────────────────────────────────────────────────

function DeclinedResult({
  reasonCode,
  score,
}: {
  reasonCode: string;
  score: number;
}) {
  const { t } = useI18n();
  const limit = maxPrincipalForScore(score);

  const message =
    reasonCode === "amount_over_limit"
      ? t("estimate.reason.amount_over_limit", { limit: formatCents(limit) })
      : t(`estimate.reason.${reasonCode}` as Parameters<typeof t>[0]);

  return (
    <Card className="border-sensei-warn/40 overflow-hidden">
      <div className="bg-sensei-warn/5 px-6 py-5 border-b border-sensei-warn/20 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-sensei-warn/15 text-sensei-warn flex items-center justify-center flex-shrink-0">
          <IconInfo className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sensei-ink">{t("estimate.result.declinedTitle")}</p>
          <Badge tone="warn">{reasonCode}</Badge>
        </div>
      </div>
      <div className="px-6 py-5">
        <p className="text-sensei-text leading-relaxed">{message}</p>
        <div className="mt-4 p-4 bg-sensei-paper rounded-xl border border-sensei-line flex items-center justify-between gap-3">
          <p className="text-xs text-sensei-muted">{t("estimate.maxForScore")}</p>
          <p className="font-black tabular-nums text-sensei-ink">{formatCents(limit)}</p>
        </div>
      </div>
    </Card>
  );
}

// ── Helpers visuels ──────────────────────────────────────────────────────────

const BAND_COLORS: Record<string, string> = {
  poor: "bg-sensei-danger/10 text-sensei-danger",
  fair: "bg-sensei-warn/10 text-sensei-warn",
  good: "bg-sensei-trust/10 text-sensei-trust",
  very_good: "bg-sensei-trust/20 text-sensei-trust",
  excellent: "bg-sensei-blue/10 text-sensei-blue",
};

function BandPill({ band }: { band: string }) {
  const { t } = useI18n();
  return (
    <span
      className={cx(
        "text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap",
        BAND_COLORS[band] ?? "bg-sensei-muted/10 text-sensei-muted",
      )}
    >
      {t(`score.band.${band}` as Parameters<typeof t>[0])}
    </span>
  );
}

function ScoreBandPip({ score }: { score: number }) {
  const { t } = useI18n();
  const band = scoreToBand(score);
  return (
    <div className="flex items-center gap-2">
      <BandPill band={band} />
      <span className="text-xs text-sensei-muted">
        {t(`score.band.${band}` as Parameters<typeof t>[0])}
      </span>
    </div>
  );
}
