import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { useAudience } from "../audience";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";

const SECTORS = ["retail", "travel", "electronics", "services", "other"] as const;

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

export function SignupPage() {
  const { t } = useI18n();
  const { audience } = useAudience();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const isMerchant = audience === "merchant";

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessSector, setBusinessSector] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error, needsConfirmation } = await signUp({
      email,
      password,
      phone,
      fullName,
      country: "CD",
      role: isMerchant ? "merchant" : "consumer",
      ...(isMerchant ? { businessName, businessSector } : {}),
    });
    setBusy(false);
    if (error) { setError(error); return; }
    if (needsConfirmation) { setDone(true); return; }
    navigate({ to: "/" });
  }

  /* ── Confirmation screen ── */
  if (done) {
    return (
      <div className="min-h-[calc(100vh-130px)] flex items-center justify-center py-12 px-6 bg-gradient-to-b from-sensei-paper to-white">
        <div className="w-full max-w-[420px] bg-white rounded-3xl border border-sensei-line shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-sensei-trust/10 text-sensei-trust rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-5">
            ✓
          </div>
          <h2 className="text-xl font-bold text-sensei-ink mb-2">{t("auth.signup")}</h2>
          <div className="bg-sensei-trust/10 text-sensei-trust rounded-xl px-4 py-3 text-sm font-medium mb-6 mt-4">
            {t("auth.confirmSent")}
          </div>
          <Link
            to="/login"
            className="block w-full py-3.5 bg-sensei-bright text-white font-bold rounded-xl hover:bg-sensei-blue transition-all text-sm text-center"
          >
            {t("auth.signinLink")}
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full border border-sensei-line rounded-xl px-4 py-3 text-sm text-sensei-text bg-sensei-paper placeholder:text-sensei-muted/50 focus:ring-2 focus:ring-sensei-bright/30 focus:border-sensei-bright transition-all";

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center py-12 px-6 bg-gradient-to-b from-sensei-paper to-white">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-8">
          <span
            className={`inline-block text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4 ${
              isMerchant
                ? "bg-sensei-blue/10 text-sensei-blue"
                : "bg-sensei-bright/10 text-sensei-bright"
            }`}
          >
            {isMerchant ? t("aud.merchants") : t("aud.buyers")}
          </span>
          <h1 className="text-2xl font-bold text-sensei-ink">
            {isMerchant ? t("auth.merchant.signupTitle") : t("auth.buyer.signupTitle")}
          </h1>
          <p className="text-sensei-muted mt-2 text-sm">
            {isMerchant ? t("auth.merchant.signupSub") : t("auth.buyer.signupSub")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-sensei-line shadow-sm p-8">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {/* Merchant-only fields */}
            {isMerchant && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-sensei-text">
                    {t("auth.merchant.business")}
                  </label>
                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Mon Entreprise SARL"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-sensei-text">
                    {t("auth.merchant.sector")}
                  </label>
                  <select
                    value={businessSector}
                    onChange={(e) => setBusinessSector(e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="" disabled>
                      {t("auth.merchant.sectorPick")}
                    </option>
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {t(`sector.${s}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-sensei-text">
                {t("auth.fullName")}
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={inputClass}
                placeholder="Jean Mbuyi"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-sensei-text">
                {t("auth.country")}
              </label>
              <select value="CD" disabled className={`${inputClass} opacity-60 cursor-not-allowed`}>
                <option value="CD">🇨🇩 RD Congo</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-sensei-text">
                {t("auth.phone")}
              </label>
              <input
                type="tel"
                inputMode="tel"
                placeholder="+243…"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-sensei-text">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-sensei-text">
                {t("auth.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-sensei-danger/8 text-sensei-danger text-sm font-medium px-4 py-3 rounded-xl border border-sensei-danger/20">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 bg-sensei-bright text-white font-bold rounded-xl hover:bg-sensei-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm mt-1 text-sm"
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("auth.signup")}…
                </span>
              ) : (
                t("auth.signup")
              )}
            </button>

            <p className="text-[11px] text-sensei-muted text-center leading-relaxed">
              {t("auth.terms")}
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-sensei-muted mt-5">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="font-semibold text-sensei-bright hover:underline">
            {t("auth.signinLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
