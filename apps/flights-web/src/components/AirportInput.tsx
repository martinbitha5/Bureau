import { useEffect, useRef, useState } from "react";
import { type Airport, airportByCode, searchAirports } from "../data/airports";
import { type Lang } from "../i18n";

interface AirportInputProps {
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
  id: string;
  lang?: Lang;
}

function FlagImg({ country, city }: { country: string; city: string }) {
  const code = country.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width="28"
      height="20"
      alt={city}
      loading="lazy"
      className="w-7 h-5 rounded object-cover shadow-sm shrink-0"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

export function AirportInput({ value, onChange, placeholder, id, lang = "fr" }: AirportInputProps) {
  const [query, setQuery]             = useState("");
  const [open, setOpen]               = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = airportByCode(value);
  const results  = searchAirports(query, lang);

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, []);

  function onFocus() {
    setQuery("");
    setOpen(true);
    setHighlighted(0);
  }

  function select(a: Airport) {
    onChange(a.code);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown")  { e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)); }
    else if (e.key === "ArrowUp")  { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter")    { e.preventDefault(); if (results[highlighted]) select(results[highlighted]!); }
    else if (e.key === "Escape")   { setOpen(false); setQuery(""); }
  }

  const displayCity = selected ? (lang === "en" ? selected.cityEn : selected.city) : "";

  return (
    <div className="relative flex-1 min-w-0" ref={wrapRef}>

      {/* ── Input row ── */}
      <div className="flex items-center gap-1.5 cursor-text" onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          id={id}
          value={open ? query : (selected ? displayCity : "")}
          placeholder={open ? placeholder : (selected ? "" : placeholder)}
          onFocus={onFocus}
          onChange={e => { setQuery(e.target.value); setHighlighted(0); }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
        />
        {selected && !open && (
          <button
            type="button"
            aria-label="Effacer"
            tabIndex={-1}
            onMouseDown={e => { e.preventDefault(); onChange(""); setQuery(""); inputRef.current?.focus(); }}
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 text-base leading-none transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* ── Dropdown — style Alternative Airlines ── */}
      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl ring-1 ring-black/[0.06] z-[500] overflow-hidden"
          style={{ minWidth: "340px", maxHeight: "320px", overflowY: "auto" }}
        >
          {results.map((a, i) => {
            const city = lang === "en" ? a.cityEn : a.city;
            const isHi = i === highlighted;
            return (
              <li
                key={a.code}
                role="option"
                aria-selected={isHi}
                className={[
                  "flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors select-none",
                  isHi ? "bg-violet-50" : "hover:bg-gray-50",
                  i > 0 ? "border-t border-gray-50" : "",
                ].join(" ")}
                onMouseEnter={() => setHighlighted(i)}
                onMouseDown={e => { e.preventDefault(); select(a); }}
              >
                {/* Drapeau image */}
                <FlagImg country={a.country} city={city} />

                {/* Ville + nom aéroport */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isHi ? "font-bold text-violet-900" : "font-semibold text-gray-900"}`}>
                    {city}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{a.name}</p>
                </div>

                {/* Code IATA */}
                <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide ${isHi ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-700"}`}>
                  {a.code}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
