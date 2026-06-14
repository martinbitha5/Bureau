import { useI18n } from "../i18n";

const STEPS = [
  "step.flights",
  "step.details",
  "step.customise",
  "step.protect",
  "step.summary",
] as const;

/** Indicateur de progression (1 = Vols sélectionnés … 5 = Résumé). */
export function StepBar({ current }: { current: 1 | 2 | 3 | 4 | 5 }) {
  const { t } = useI18n();
  return (
    <div className="step-bar">
      {STEPS.map((key, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4 | 5;
        const done = n < current;
        const active = n === current;
        return (
          <div
            key={key}
            className={["step-item", done && "done", active && "active"].filter(Boolean).join(" ")}
          >
            <span className="step-dot">{done ? "✓" : n}</span>
            <span className="step-label">{t(key)}</span>
            {i < STEPS.length - 1 && <span className="step-line" aria-hidden />}
          </div>
        );
      })}
    </div>
  );
}
