import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";

export function LoginPage() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const navigate = useNavigate();
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
        <h2 className="page-title">{t("auth.login")}</h2>
        <p className="muted small">{t("auth.subtitle")}</p>
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
      </div>
    </section>
  );
}
