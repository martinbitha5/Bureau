import { Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { useAudience } from "../audience";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";

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
    <section className="auth-wrap">
      <div className="auth-card">
        <span className="audience-tag">
          {isMerchant ? t("aud.merchants") : t("aud.buyers")}
        </span>
        <h2 className="page-title">
          {isMerchant ? t("auth.merchant.loginTitle") : t("auth.buyer.loginTitle")}
        </h2>
        <p className="muted small">
          {isMerchant ? t("auth.merchant.loginSub") : t("auth.buyer.loginSub")}
        </p>
        <form onSubmit={onSubmit} className="auth-form">
          <label className="field">
            <span>{t("auth.email")}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>{t("auth.password")}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="declined">⚠ {error}</p>}
          <button className="btn-primary block" type="submit" disabled={busy}>
            {t("auth.login")}
          </button>
        </form>

        <p className="auth-alt small">
          {t("auth.noAccount")}{" "}
          <Link to="/signup" className="auth-link">
            {t("auth.createOne")}
          </Link>
        </p>
      </div>
    </section>
  );
}
