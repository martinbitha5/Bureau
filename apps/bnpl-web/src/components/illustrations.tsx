import { formatCents } from "@sensei/utils";
import type { ReactNode } from "react";
import { useI18n } from "../i18n";
import { IconGauge, IconPlane, IconStore, IconUser, IconWallet } from "./icons";

/**
 * Illustrations & maquettes ORIGINALES (aucun asset tiers).
 * Style « flat » coloré, palette Sensei + accents. Utilisées par la landing
 * pour le niveau de finition (section « pourquoi adorer » + carrousel d'étapes).
 */

// ── Illustrations de section (96×96) ───────────────────────────────────

export function IllusApply() {
  return (
    <svg viewBox="0 0 96 96" className="w-20 h-20" role="img" aria-hidden>
      <circle cx="48" cy="48" r="44" fill="#1E63C4" opacity="0.08" />
      <rect x="26" y="20" width="44" height="54" rx="9" fill="#fff" stroke="#D9E1EC" strokeWidth="2" />
      <rect x="34" y="32" width="28" height="5" rx="2.5" fill="#C9D6E8" />
      <rect x="34" y="43" width="20" height="5" rx="2.5" fill="#E2E9F2" />
      <circle cx="60" cy="62" r="13" fill="#1E8E5A" />
      <path d="M54 62l4 4 7-8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 56v17l5-4 3 6 4-2-3-6 6-1z" fill="#C9852A" />
    </svg>
  );
}

export function IllusNoFees() {
  return (
    <svg viewBox="0 0 96 96" className="w-20 h-20" role="img" aria-hidden>
      <circle cx="48" cy="48" r="44" fill="#1E8E5A" opacity="0.08" />
      <circle cx="48" cy="50" r="25" fill="#1E8E5A" />
      <text x="48" y="60" textAnchor="middle" fontSize="30" fontWeight="900" fill="#fff" fontFamily="Inter, system-ui">0</text>
      <path d="M74 26l2.4 5.4 5.6 2.4-5.6 2.4L74 42l-2.4-5.4L66 34.2l5.6-2.4z" fill="#C9852A" />
      <circle cx="26" cy="34" r="3.5" fill="#1E63C4" />
    </svg>
  );
}

export function IllusClear() {
  return (
    <svg viewBox="0 0 96 96" className="w-20 h-20" role="img" aria-hidden>
      <circle cx="48" cy="48" r="44" fill="#123A6B" opacity="0.08" />
      <path d="M20 48c8-13 20-19 28-19s20 6 28 19c-8 13-20 19-28 19s-20-6-28-19z" fill="#fff" stroke="#1E63C4" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="48" cy="48" r="11" fill="#1E63C4" />
      <circle cx="48" cy="48" r="5" fill="#0A1B2E" />
      <circle cx="44" cy="44" r="2.2" fill="#fff" />
    </svg>
  );
}

// ── Cadre téléphone ────────────────────────────────────────────────────

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-[238px] rounded-[2.3rem] bg-sensei-ink p-2.5 shadow-2xl shadow-sensei-ink/30">
      <div className="rounded-[1.8rem] bg-white overflow-hidden">
        <div className="h-7 flex items-center justify-center">
          <div className="w-16 h-1.5 bg-sensei-ink/15 rounded-full" />
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Maquette étape 1 : panier + Sensei Pay à la caisse ─────────────────

export function MockCheckout() {
  const { t } = useI18n();
  return (
    <PhoneFrame>
      <div className="px-4 pb-5 pt-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-sensei-muted mb-3">
          {t("mock.summary")}
        </p>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-sensei-bright/10 text-sensei-bright flex items-center justify-center">
            <IconPlane className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-sensei-ink leading-tight">Sensei Flights</p>
            <p className="text-[9px] text-sensei-muted">FIH → JNB</p>
          </div>
          <span className="text-[11px] font-bold text-sensei-ink tabular-nums">{formatCents(18000)}</span>
        </div>
        <div className="border-t border-sensei-line my-2.5" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-sensei-muted">{t("mock.total")}</span>
          <span className="text-sm font-black text-sensei-ink tabular-nums">{formatCents(18000)}</span>
        </div>
        <div className="bg-sensei-bright/8 rounded-xl px-3 py-2 mb-3">
          <p className="text-[9px] font-bold uppercase tracking-wide text-sensei-bright">
            {t("dash.eligibility")}
          </p>
          <p className="text-[13px] font-black text-sensei-ink tabular-nums">{formatCents(150000)}</p>
        </div>
        <div className="rounded-xl bg-sensei-bright text-white text-center py-2.5 text-[11px] font-bold shadow-sm">
          {t("mock.pay")}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Maquette étape 2 : options d'échéancier ────────────────────────────

export function MockPlans() {
  const { t } = useI18n();
  const plans = [
    { each: 6000, n: 3, total: 18000, accent: true },
    { each: 4500, n: 4, total: 18000, accent: false },
  ];
  return (
    <div className="flex flex-col gap-3 w-full max-w-[280px] mx-auto">
      {plans.map((p) => (
        <div
          key={p.n}
          className="bg-white rounded-2xl border border-sensei-line shadow-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-2xl font-black text-sensei-ink tabular-nums">
              {formatCents(p.each)}
              <span className="text-xs font-semibold text-sensei-muted"> {t("mock.month")}</span>
            </p>
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                p.accent ? "bg-sensei-bright text-white" : "bg-sensei-paper text-sensei-text"
              }`}
            >
              {t("mock.months", { n: String(p.n) })}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <p className="text-sensei-muted">{t("mock.fees")}</p>
              <p className="font-bold text-sensei-trust tabular-nums">{formatCents(0)}</p>
            </div>
            <div className="text-right">
              <p className="text-sensei-muted">{t("mock.total")}</p>
              <p className="font-bold text-sensei-ink tabular-nums">{formatCents(p.total)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Maquette étape 3 : échéances à venir ───────────────────────────────

export function MockSchedule() {
  const { t } = useI18n();
  const rows = [
    { name: "Sensei Flights", amount: 6000 },
    { name: "Sensei Flights", amount: 6000 },
  ];
  return (
    <PhoneFrame>
      <div className="px-4 pb-3 pt-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold text-sensei-muted">{t("mock.dueThisMonth")}</span>
          <span className="text-sm font-black text-sensei-ink tabular-nums">{formatCents(12000)}</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-sensei-bright/10 text-sensei-bright flex items-center justify-center">
              <IconPlane className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-sensei-ink leading-tight">{r.name}</p>
              <p className="text-[9px] text-sensei-muted">15 / {i + 7}</p>
            </div>
            <span className="text-[10px] font-bold text-white bg-sensei-bright rounded-full px-2.5 py-1 tabular-nums">
              {formatCents(r.amount)}
            </span>
          </div>
        ))}
        <p className="text-[10px] font-semibold text-sensei-bright mb-3">{t("common.viewAll")} →</p>
        <div className="-mx-4 border-t border-sensei-line flex items-center justify-around py-2.5 text-sensei-muted">
          <IconStore className="w-4 h-4" />
          <IconWallet className="w-4 h-4 text-sensei-bright" />
          <IconGauge className="w-4 h-4" />
          <IconUser className="w-4 h-4" />
        </div>
      </div>
    </PhoneFrame>
  );
}
