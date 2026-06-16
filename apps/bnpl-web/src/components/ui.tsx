import { formatCents } from "@sensei/utils";
import { useState, type ReactNode } from "react";
import { IconCheck, IconClipboard, IconInfo } from "./icons";

/** Concatène des classes en ignorant les valeurs vides. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Conteneur de page connectée (largeur lisible, marges mobiles). */
export function AppContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("max-w-3xl mx-auto px-5 sm:px-6 py-8 sm:py-10", className)}>{children}</div>;
}

/** En-tête de page connectée : titre + sous-titre + action optionnelle. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-7">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-bold text-sensei-ink tracking-tight">{title}</h1>
        {subtitle && <p className="text-sensei-muted mt-1.5 text-sm sm:text-[15px]">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/** Carte blanche standard. */
export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  return (
    <Tag className={cx("bg-white border border-sensei-line rounded-2xl shadow-sm", className)}>
      {children}
    </Tag>
  );
}

/** Carte-statistique : libellé, valeur (chiffres tabulaires), pied optionnel. */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "ink",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "ink" | "bright" | "trust" | "warn";
}) {
  const valueTone =
    tone === "bright"
      ? "text-sensei-bright"
      : tone === "trust"
      ? "text-sensei-trust"
      : tone === "warn"
      ? "text-sensei-warn"
      : "text-sensei-ink";
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted">{label}</p>
        {icon && <span className="text-sensei-muted/70">{icon}</span>}
      </div>
      <p className={cx("text-2xl font-black tabular-nums", valueTone)}>{value}</p>
      {hint && <p className="text-xs text-sensei-muted mt-1">{hint}</p>}
    </Card>
  );
}

/** Montant d'argent (cents) — chiffres tabulaires, devise toujours visible. */
export function Money({
  cents,
  className,
}: {
  cents: number;
  className?: string;
}) {
  return <span className={cx("tabular-nums", className)}>{formatCents(cents)}</span>;
}

/** Pastille d'état colorée (toujours accompagnée d'un libellé — accessibilité). */
export function Badge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "bright" | "trust" | "warn" | "danger";
}) {
  const tones: Record<string, string> = {
    muted: "bg-sensei-muted/10 text-sensei-muted",
    bright: "bg-sensei-bright/10 text-sensei-bright",
    trust: "bg-sensei-trust/10 text-sensei-trust",
    warn: "bg-sensei-warn/10 text-sensei-warn",
    danger: "bg-sensei-danger/10 text-sensei-danger",
  };
  return (
    <span className={cx("text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap", tones[tone])}>
      {children}
    </span>
  );
}

/** État vide générique. */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      {icon && (
        <div className="w-14 h-14 bg-sensei-paper border border-sensei-line rounded-2xl flex items-center justify-center mb-4 text-sensei-muted">
          {icon}
        </div>
      )}
      <p className="font-semibold text-sensei-ink mb-1">{title}</p>
      {body && <p className="text-sm text-sensei-muted max-w-[34ch]">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Bandeau toast de succès (vert, avec coche). */
export function SuccessToast({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 bg-sensei-trust/10 text-sensei-trust border border-sensei-trust/20 rounded-2xl px-4 py-3 mb-6 font-medium text-sm">
      <span className="flex-shrink-0">
        <IconCheck className="w-5 h-5" />
      </span>
      {children}
    </div>
  );
}

/** Note d'information sobre (transparence, pédagogie). */
export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 bg-sensei-paper border border-sensei-line rounded-xl px-4 py-3 text-sm text-sensei-muted">
      <IconInfo className="w-4 h-4 flex-shrink-0 mt-0.5 text-sensei-bright" />
      <span>{children}</span>
    </div>
  );
}

/** Bouton primaire (lien ou bouton). Style cohérent dans toute l'app. */
export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center gap-2 px-5 py-3 bg-sensei-bright text-white font-bold rounded-xl hover:bg-sensei-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm text-sm",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Bloc de code sombre avec bouton de copie. */
export function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={cx("relative group", className)}>
      <pre className="bg-sensei-ink text-white/80 rounded-xl p-4 pr-12 text-xs font-mono overflow-x-auto leading-relaxed">
        {code}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
        title="Copier"
      >
        {copied ? <IconCheck className="w-3.5 h-3.5" /> : <IconClipboard className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
