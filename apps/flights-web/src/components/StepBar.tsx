import { useI18n } from "../i18n";

const STEPS = ["step.flights", "step.details", "step.customise", "step.protect", "step.summary"] as const;

export function StepBar({ current }: { current: 1 | 2 | 3 | 4 | 5 }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto py-1">
      {STEPS.map((key, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4 | 5;
        const done = n < current;
        const active = n === current;
        return (
          <div key={key} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={[
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                done   ? "bg-violet-700 text-white" :
                active ? "bg-violet-700 text-white ring-4 ring-violet-100" :
                         "bg-gray-100 text-gray-400",
              ].join(" ")}>
                {done ? "✓" : n}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${active ? "text-violet-700" : done ? "text-violet-500" : "text-gray-400"}`}>
                {t(key)}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 sm:w-12 mb-4 mx-1 ${done ? "bg-violet-300" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
