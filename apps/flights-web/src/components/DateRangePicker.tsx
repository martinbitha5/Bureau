import { useState } from "react";
import type { Lang } from "../i18n";

interface Props {
  start: string;
  end: string;
  isRange: boolean;
  lang: Lang;
  onSelect: (start: string, end: string) => void;
  onClose: () => void;
}

const MFR = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const MEN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DFR = ["dim.","lun.","mar.","mer.","jeu.","ven.","sam."];
const DEN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function addMonth(y: number, m: number, delta: number): [number, number] {
  const dt = new Date(y, m + delta, 1);
  return [dt.getFullYear(), dt.getMonth()];
}

export function DateRangePicker({ start, end, isRange, lang, onSelect, onClose }: Props) {
  const today = new Date();
  const todayStr = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  const [ly, setLy] = useState(today.getFullYear());
  const [lm, setLm] = useState(today.getMonth());
  const [hover, setHover] = useState("");

  const [ry, rm] = addMonth(ly, lm, 1);
  const MONTHS = lang === "fr" ? MFR : MEN;
  const DAYS   = lang === "fr" ? DFR : DEN;

  function pick(iso: string) {
    if (iso < todayStr) return;
    if (!isRange) { onSelect(iso, ""); return; }
    if (!start || (start && end)) { onSelect(iso, ""); }
    else if (iso <= start) { onSelect(iso, start); }
    else { onSelect(start, iso); }
  }

  function inRange(iso: string) {
    if (!start || !isRange) return false;
    const e = end || hover;
    if (!e || e === start) return false;
    const [s, en] = start < e ? [start, e] : [e, start];
    return iso > s && iso < en;
  }

  function renderMonth(year: number, month: number) {
    const days = new Date(year, month + 1, 0).getDate();
    const dow  = new Date(year, month, 1).getDay();
    const cells: (number | null)[] = [...Array(dow).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div className="flex-1 min-w-0">
        <p className="text-center text-sm font-semibold text-gray-800 mb-3 capitalize">
          {MONTHS[month]} {year}
        </p>
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="h-10" />;
            const iso  = toISO(year, month, day);
            const past = iso < todayStr;
            const isS  = iso === start;
            const isE  = iso === end;
            const range = inRange(iso);
            const ideal = !past && (day * 7 + month * 3) % 5 === 0;

            return (
              <div
                key={i}
                className={[
                  "relative h-8 flex items-center justify-center",
                  past ? "pointer-events-none" : "cursor-pointer",
                  range ? "bg-violet-50" : "",
                  isS && (end || hover) ? "rounded-l-full" : "",
                  isE ? "rounded-r-full" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => pick(iso)}
                onMouseEnter={() => { if (!past) setHover(iso); }}
                onMouseLeave={() => setHover("")}
              >
                <span className={[
                  "w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all",
                  past ? "text-gray-300" : "",
                  isS || isE ? "bg-violet-700 text-white font-bold shadow-md shadow-violet-200" : "",
                  !past && !isS && !isE ? "hover:bg-gray-100 text-gray-700 font-medium" : "",
                ].filter(Boolean).join(" ")}>
                  {day}
                </span>
                {ideal && !isS && !isE && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl ring-1 ring-black/[0.06] z-[400] p-4" style={{ width: 460 }}>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => { const [y, m] = addMonth(ly, lm, -1); setLy(y); setLm(m); }}
          className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 text-xl transition-colors"
        >
          ‹
        </button>
        <div />
        <button
          type="button"
          onClick={() => { const [y, m] = addMonth(ly, lm, 1); setLy(y); setLm(m); }}
          className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 text-xl transition-colors"
        >
          ›
        </button>
      </div>

      {/* Two months side by side */}
      <div className="flex gap-4">
        {renderMonth(ly, lm)}
        {renderMonth(ry, rm)}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs text-gray-500">
            {lang === "fr" ? "Une journée idéale pour voler" : "Ideal day to fly"}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 bg-violet-700 text-white text-sm font-semibold rounded-full hover:bg-violet-800 transition-colors"
        >
          {lang === "fr" ? "Fermer" : "Close"}
        </button>
      </div>
    </div>
  );
}
