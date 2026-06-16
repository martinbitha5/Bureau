import { scoreToBand } from "@sensei/payments";
import type { ScoreBand } from "@sensei/types";
import { useI18n } from "../i18n";
import { cx } from "./ui";

const SCORE_MIN = 300;
const SCORE_MAX = 850;

/** Couleur de l'arc par tranche. Le sens passe AUSSI par le libellé (accessibilité). */
const BAND_COLOR: Record<ScoreBand, string> = {
  poor: "#B3271E", // danger
  fair: "#C9852A", // warn
  good: "#1E63C4", // bright
  very_good: "#1E8E5A", // trust
  excellent: "#136B43", // trust foncé
};

/**
 * Jauge de score Sensei (demi-cercle). Le chiffre est le héros visuel
 * (docs/BRAND_BRIEF.md §5). `pathLength={100}` => le remplissage = pourcentage direct.
 */
export function ScoreGauge({
  score,
  size = 220,
  showBand = true,
}: {
  score: number;
  size?: number;
  showBand?: boolean;
}) {
  const { t } = useI18n();
  const band = scoreToBand(score);
  const clamped = Math.max(SCORE_MIN, Math.min(SCORE_MAX, score));
  const pct = ((clamped - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;
  const color = BAND_COLOR[band];

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 200 116" width={size} height={size * 0.58} role="img" aria-label={`Score ${score}`}>
        {/* Piste */}
        <path
          d="M 16 100 A 84 84 0 0 1 184 100"
          fill="none"
          stroke="#D9E1EC"
          strokeWidth={16}
          strokeLinecap="round"
          pathLength={100}
        />
        {/* Valeur */}
        <path
          d="M 16 100 A 84 84 0 0 1 184 100"
          fill="none"
          stroke={color}
          strokeWidth={16}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${pct} 100`}
          style={{ transition: "stroke-dasharray 700ms ease" }}
        />
        {/* Chiffre central */}
        <text x="100" y="86" textAnchor="middle" className="tabular-nums" fontSize="40" fontWeight="800" fill="#0A1B2E">
          {score}
        </text>
        <text x="100" y="104" textAnchor="middle" fontSize="11" fill="#5B6B7B">
          {t("score.outOf")}
        </text>
      </svg>
      {showBand && (
        <span
          className={cx("mt-1 text-sm font-bold px-3 py-1 rounded-full")}
          style={{ color, backgroundColor: `${color}1a` }}
        >
          {t(`score.band.${band}`)}
        </span>
      )}
    </div>
  );
}
