import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { useAudience } from "../audience";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

export function LoginPage() {
  const { t } = useI18n();
  const { audience } = useAudience();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const isMerchant = audience === "merchant";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) setError(error);
    else navigate({ to: "/" });
  }

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center py-12 px-6 bg-gradient-to-b from-sensei-paper to-white">
      <div className="w-full max-w-[420px]">
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
            {isMerchant ? t("auth.merchant.loginTitle") : t("auth.buyer.loginTitle")}
          </h1>
          <p className="text-sensei-muted mt-2 text-sm">
            {isMerchant ? t("auth.merchant.loginSub") : t("auth.buyer.loginSub")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-sensei-line shadow-sm p-8">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
                className="w-full border border-sensei-line rounded-xl px-4 py-3 text-sm text-sensei-text bg-sensei-paper placeholder:text-sensei-muted/50 focus:ring-2 focus:ring-sensei-bright/30 focus:border-sensei-bright transition-all"
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
                placeholder="••••••••"
                className="w-full border border-sensei-line rounded-xl px-4 py-3 text-sm text-sensei-text bg-sensei-paper placeholder:text-sensei-muted/50 focus:ring-2 focus:ring-sensei-bright/30 focus:border-sensei-bright transition-all"
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
                  {t("auth.login")}…
                </span>
              ) : (
                t("auth.login")
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-sensei-muted mt-5">
          {t("auth.noAccount")}{" "}
          <Link to="/signup" className="font-semibold text-sensei-bright hover:underline">
            {t("auth.createOne")}
          </Link>
        </p>
      </div>
    </div>
  );
}
