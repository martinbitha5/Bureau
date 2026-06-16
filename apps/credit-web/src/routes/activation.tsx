import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { useI18n } from "../i18n";

type Choice = "existing" | "new";

/**
 * Page « Code d'activation » — inspirée d'Equifax /activer.
 * Deux parcours : compte existant ou nouveau compte. Le code est validé
 * côté UI uniquement (la vraie activation passera plus tard par api-client).
 */
export const Route = createFileRoute("/activation")({
  component: ActivationPage,
});

export function ActivationPage() {
  const { t } = useI18n();
  const [choice, setChoice] = useState<Choice>("existing");
  const [code, setCode] = useState("");
  const [robot, setRobot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.trim().length < 4) {
      setError(t("act.error.code"));
      return;
    }
    if (!robot) {
      setError(t("act.error.robot"));
      return;
    }
    setDone(true);
  }

  return (
    <section className="page act-page">
      <div className="act-grid">
        <div>
          <h1 className="page-title">{t("act.title")}</h1>
          <p className="act-intro">{t("act.intro")}</p>

          <p className="act-choose">{t("act.choose")}</p>

          <fieldset className="act-options">
            <label className="act-option">
              <input
                type="radio"
                name="act-choice"
                checked={choice === "existing"}
                onChange={() => setChoice("existing")}
              />
              <span>
                <strong>{t("act.opt.existing")}</strong>
                {choice === "existing" && (
                  <span className="act-option-body">
                    {t("act.opt.existing.body")}{" "}
                    <Link to="/login" className="inline-link">
                      {t("act.opt.existing.link")}
                    </Link>
                  </span>
                )}
              </span>
            </label>

            <label className="act-option">
              <input
                type="radio"
                name="act-choice"
                checked={choice === "new"}
                onChange={() => setChoice("new")}
              />
              <span>
                <strong>{t("act.opt.new")}</strong>
                {choice === "new" && (
                  <span className="act-option-body">{t("act.opt.new.body")}</span>
                )}
              </span>
            </label>
          </fieldset>

          {done ? (
            <p className="ok act-success">✓ {t("act.success")}</p>
          ) : (
            <form className="act-form" onSubmit={onSubmit}>
              <label className="field">
                <span>{t("act.code.label")}</span>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t("act.code.placeholder")}
                  autoComplete="off"
                />
              </label>

              <label className="act-robot">
                <input
                  type="checkbox"
                  checked={robot}
                  onChange={(e) => setRobot(e.target.checked)}
                />
                <span>{t("act.robot")}</span>
                <span className="act-robot-badge">reCAPTCHA</span>
              </label>

              {error && <p className="declined">⚠ {error}</p>}

              <button type="submit" className="btn-primary">
                {t("act.submit")}
              </button>
            </form>
          )}
        </div>

        <aside className="act-aside">
          <div className="act-illustration">🔐</div>
          <p className="muted">{t("act.opt.existing.body")}</p>
        </aside>
      </div>
    </section>
  );
}
