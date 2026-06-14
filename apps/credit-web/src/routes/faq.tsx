import { useState } from "react";
import { useI18n } from "../i18n";

const items = ["q1", "q2", "q3", "q4", "q5", "q6"];

export function FaqPage() {
  const { t } = useI18n();
  const [open, setOpen] = useState<string | null>("q1");

  return (
    <section className="page">
      <h1 className="page-title">{t("faq.title")}</h1>
      <p className="muted">{t("faq.sub")}</p>

      <ul className="faq-list">
        {items.map((q) => {
          const isOpen = open === q;
          return (
            <li key={q} className={isOpen ? "faq-item open" : "faq-item"}>
              <button
                type="button"
                className="faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : q)}
              >
                <span>{t(`faq.${q}`)}</span>
                <span className="faq-chevron">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && <p className="faq-a">{t(`faq.a${q.slice(1)}`)}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
