import { Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { useAudience } from "../audience";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";

const SECTORS = ["retail", "travel", "electronics", "services", "other"] as const;

export function SignupPage() {
  const { t } = useI18n();
  const { audience } = useAudience();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const isMerchant = audience === "merchant";

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessSector, setBusinessSector] = useState<string>("");
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
    if (error) {
      setError(error);
      return;
    }
    if (needsConfirmation) {
      setDone(true);
      return;
    }
    navigate({ to: "/" });
  }

  if (done) {
    return (
      <section className="auth-wrap">
        <div className="auth-card">
          <div className="auth-badge">✓</div>
          <h2 className="page-title">{t("auth.signup")}</h2>
          <p className="confirmed" style={{ marginTop: 16 }}>
            {t("auth.confirmSent")}
          </p>
          <Link to="/login" className="btn-primary block">
            {t("auth.signinLink")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <span className="audience-tag">
          {isMerchant ? t("aud.merchants") : t("aud.buyers")}
        </span>
        <h2 className="page-title">
          {isMerchant ? t("auth.merchant.signupTitle") : t("auth.buyer.signupTitle")}
        </h2>
        <p className="muted small">
          {isMerchant ? t("auth.merchant.signupSub") : t("auth.buyer.signupSub")}
        </p>

        <form onSubmit={onSubmit} className="auth-form">
          {isMerchant && (
            <>
              <label className="field">
                <span>{t("auth.merchant.business")}</span>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>{t("auth.merchant.sector")}</span>
                <select
                  className="select"
                  value={businessSector}
                  onChange={(e) => setBusinessSector(e.target.value)}
                  required
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
              </label>
            </>
          )}

          <label className="field">
            <span>{t("auth.fullName")}</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>

          <label className="field">
            <span>{t("auth.country")}</span>
            <select className="select" value="CD" disabled>
              <option value="CD">🇨🇩 RD Congo</option>
            </select>
          </label>

          <label className="field">
            <span>{t("auth.phone")}</span>
            <input
              type="tel"
              inputMode="tel"
              placeholder="+243…"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>{t("auth.email")}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>{t("auth.password")}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {error && <p className="declined">⚠ {error}</p>}

          <button className="btn-primary block" type="submit" disabled={busy}>
            {t("auth.signup")}
          </button>
          <p className="auth-terms muted small">{t("auth.terms")}</p>
        </form>

        <p className="auth-alt small">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="auth-link">
            {t("auth.signinLink")}
          </Link>
        </p>
      </div>
    </section>
  );
}
