import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

export function LoginPage() {
  const { t } = useI18n();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("+243");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate({ to: "/" });
    } else {
      const { error, needsConfirmation } = await signUp({ email, password, phone, fullName });
      if (error) setError(error);
      else if (needsConfirmation) setInfo(t("auth.checkEmail"));
      else navigate({ to: "/" });
    }
    setBusy(false);
  }

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h2 className="page-title">{mode === "login" ? t("auth.login") : t("auth.signup")}</h2>
        <p className="muted small">{t("auth.subtitle")}</p>
        <form onSubmit={onSubmit} className="auth-form">
          {mode === "signup" && (
            <>
              <label className="field">
                <span>{t("auth.fullName")}</span>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </label>
              <label className="field">
                <span>{t("auth.phone")}</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </label>
            </>
          )}
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
              minLength={8}
              required
            />
          </label>
          {error && <p className="declined">⚠ {error}</p>}
          {info && <p className="ok">✓ {info}</p>}
          <button className="btn-primary block" type="submit" disabled={busy}>
            {mode === "login" ? t("auth.login") : t("auth.signup")}
          </button>
        </form>
        <button
          type="button"
          className="link-toggle"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "login" ? t("auth.toSignup") : t("auth.toLogin")}
        </button>
      </div>
    </section>
  );
}
