import { createFileRoute, getRouteApi, useNavigate } from "@tanstack/react-router";
import { formatCents } from "@sensei/utils";
import { buildInstallments, decideBnpl } from "@sensei/payments";
import { type FormEvent, useMemo, useState } from "react";
import type { DetailsSearch } from "./details";

export type SenseiPaySearch = DetailsSearch & { installmentCount: number };

export const Route = createFileRoute("/sensei-pay")({
  validateSearch: (s: Record<string, unknown>): SenseiPaySearch => ({
    origin: String(s.origin ?? ""),
    destination: String(s.destination ?? ""),
    departDate: String(s.departDate ?? ""),
    returnDate: String(s.returnDate ?? ""),
    tripType: s.tripType === "round" ? "round" : "oneway",
    passengers: Number(s.passengers ?? 1),
    cabin: (["economy","premium","business"].includes(String(s.cabin)) ? String(s.cabin) : "economy") as DetailsSearch["cabin"],
    carrier: String(s.carrier ?? ""),
    flightNumber: String(s.flightNumber ?? ""),
    providerOfferId: String(s.providerOfferId ?? ""),
    totalCents: Number(s.totalCents ?? 0),
    departTime: String(s.departTime ?? ""),
    arriveTime: String(s.arriveTime ?? ""),
    installmentCount: [3, 4].includes(Number(s.installmentCount)) ? Number(s.installmentCount) : 3,
  }),
  component: SenseiPayPage,
});

const route = getRouteApi("/sensei-pay");

export function SenseiPayPage() {
  const navigate = useNavigate();
  const search = route.useSearch();

  const [phone, setPhone]   = useState("+243");
  const [step, setStep]     = useState<"login" | "otp">("login");
  const [otp, setOtp]       = useState("");
  const [loading, setLoading] = useState(false);

  const decision = useMemo(
    () => decideBnpl({ score: 680, principalCents: search.totalCents, installmentCount: search.installmentCount }),
    [search.totalCents, search.installmentCount],
  );
  const schedule = useMemo(
    () => decision.approved ? buildInstallments(decision.totalCents, decision.installmentCount, new Date()) : [],
    [decision],
  );

  function onPhoneSubmit(e: FormEvent) {
    e.preventDefault();
    if (!phone.trim() || phone === "+243") return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 1200);
  }

  function onOtpSubmit(e: FormEvent) {
    e.preventDefault();
    if (otp.length < 4) return;
    setLoading(true);
    setTimeout(() => {
      navigate({
        to: "/summary",
        search: { ...search, bnplApproved: true } as Parameters<typeof navigate>[0]["search"],
      });
    }, 1400);
  }

  const perMonth = schedule[0] ? formatCents(schedule[0].amountCents) : "—";

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/summary", search })}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-700 flex items-center justify-center text-white text-sm font-black">S</div>
          <span className="font-black text-gray-900 text-base tracking-tight">Sensei Pay</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Main card */}
      <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-12">
        <div className="w-full max-w-sm">

          {/* Amount chip */}
          <div className="bg-white rounded-2xl p-4 mb-5 shadow-sm ring-1 ring-black/[0.04]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Montant à financer</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-black text-gray-900">{formatCents(search.totalCents)}</p>
              <div className="text-right">
                <p className="text-sm font-bold text-violet-700">{perMonth} × {search.installmentCount}</p>
                <p className="text-[10px] text-gray-400">sans frais</p>
              </div>
            </div>
            {decision.approved && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                {schedule.map((inst, i) => (
                  <div key={inst.sequence} className="flex-1 bg-violet-50 rounded-xl px-2 py-1.5 text-center">
                    <p className="text-[9px] text-gray-400 font-medium">{i === 0 ? "Aujourd'hui" : inst.dueDate.slice(5)}</p>
                    <p className="text-xs font-bold text-violet-700">{formatCents(inst.amountCents)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auth card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/[0.04] p-6">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-violet-100 border-4 border-white shadow-sm flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>

            {step === "login" ? (
              <>
                <h1 className="text-xl font-extrabold text-gray-900 text-center mb-1">Se connecter</h1>
                <p className="text-sm text-gray-400 text-center mb-6">Connectez-vous à votre compte Sensei Pay pour continuer.</p>

                <form onSubmit={onPhoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+243 8X XXX XXXX"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50"
                    />
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Un code de vérification sera envoyé par SMS.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !phone.trim() || phone === "+243"}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white font-bold rounded-2xl transition-all text-sm"
                  >
                    {loading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Continuer
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 pt-5 border-t border-gray-50 text-center">
                  <p className="text-sm text-gray-500">
                    Pas encore de compte ?{" "}
                    <button type="button" className="font-semibold text-violet-700 hover:underline">
                      Créez-en un.
                    </button>
                  </p>
                </div>

                <p className="text-[10px] text-gray-400 text-center leading-relaxed mt-4">
                  En continuant, j'accepte les{" "}
                  <span className="underline cursor-pointer">Conditions d'utilisation</span> de Sensei Pay et j'autorise Sensei à accéder à mon profil de crédit conformément à ma{" "}
                  <span className="underline cursor-pointer">Politique de confidentialité</span>.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-extrabold text-gray-900 text-center mb-1">Vérification</h1>
                <p className="text-sm text-gray-400 text-center mb-1">Code envoyé au</p>
                <p className="text-sm font-semibold text-gray-900 text-center mb-6">{phone}</p>

                <form onSubmit={onOtpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      Code à 6 chiffres
                    </label>
                    <input
                      type="tel"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="• • • • • •"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-center text-xl tracking-[0.4em] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 4}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-violet-700 hover:bg-violet-800 disabled:opacity-40 text-white font-bold rounded-2xl transition-all text-sm"
                  >
                    {loading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      "Valider et payer →"
                    )}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => setStep("login")}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Changer de numéro
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 text-center leading-relaxed mt-4">
                  Code valable 10 minutes. Des frais de messagerie peuvent s'appliquer selon votre opérateur.
                </p>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-5 mt-5 text-[10px] text-gray-400 font-medium">
            <span className="flex items-center gap-1">🔒 Paiement sécurisé</span>
            <span className="flex items-center gap-1">✦ Aucun frais</span>
            <span className="flex items-center gap-1">🇨🇩 RDC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
