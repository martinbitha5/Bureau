import type { ReactNode } from "react";
import { IconArrowRight } from "./icons";

/**
 * Gabarit de page de contenu (Aide, À propos, Carrières, etc.).
 * Hero clair + sections enfant. Cohérent avec la landing premium.
 */
export function InfoPage({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="bg-white">
      <section className="bg-gradient-to-b from-[#EEF2FB] to-white py-20 sm:py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          {kicker && (
            <span className="inline-block text-[12px] font-semibold text-sensei-bright bg-white border border-sensei-line px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
              {kicker}
            </span>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-medium text-sensei-ink leading-[1.04] tracking-[-0.02em] mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg sm:text-xl text-sensei-muted leading-relaxed max-w-[52ch] mx-auto">{subtitle}</p>
          )}
        </div>
      </section>
      {children}
    </div>
  );
}

/** Carte d'information : icône + titre + corps. */
export function InfoCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white border border-sensei-line rounded-2xl p-6 shadow-sm">
      <div className="w-11 h-11 rounded-xl bg-sensei-bright/10 text-sensei-bright flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-[17px] font-semibold text-sensei-ink mb-2">{title}</h3>
      <p className="text-sensei-muted text-sm leading-relaxed">{body}</p>
    </div>
  );
}

/** Bloc de contact (titre + corps + e-mail). */
export function ContactCard({
  title,
  body,
  email,
  cta,
}: {
  title: string;
  body: string;
  email: string;
  cta: string;
}) {
  return (
    <div className="max-w-2xl mx-auto bg-sensei-ink text-white rounded-3xl px-8 py-12 text-center relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(50% 80% at 50% 0%, rgba(30,99,196,0.35) 0%, transparent 70%)" }}
      />
      <div className="relative">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight">{title}</h2>
        <p className="text-white/60 mb-7 max-w-[44ch] mx-auto">{body}</p>
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-sensei-ink font-semibold rounded-full hover:bg-sensei-paper transition-all shadow-lg text-sm"
        >
          {cta} <IconArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
