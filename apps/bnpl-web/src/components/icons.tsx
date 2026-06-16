/**
 * Jeu d'icônes partagé (linéaire, fin, neutre — docs/BRAND_BRIEF.md §5).
 * Toutes les pages importent d'ici pour ne pas redéfinir les mêmes SVG.
 * Chaque icône accepte `className` (taille/couleur via Tailwind).
 */
type IconProps = { className?: string };

const S = ({ className, children }: IconProps & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? "w-5 h-5"}
  >
    {children}
  </svg>
);

export const IconBolt = (p: IconProps) => (
  <S {...p}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </S>
);

export const IconClipboard = (p: IconProps) => (
  <S {...p}>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </S>
);

export const IconTrend = (p: IconProps) => (
  <S {...p}>
    <path d="M22 7l-8.5 8.5-5-5L2 17" />
    <path d="M16 7h6v6" />
  </S>
);

export const IconShield = (p: IconProps) => (
  <S {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </S>
);

export const IconStore = (p: IconProps) => (
  <S {...p}>
    <path d="M3 9l1-5h16l1 5M3 9h18M3 9v11h18V9" />
    <path d="M9 21V12h6v9" />
  </S>
);

export const IconCard = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </S>
);

export const IconPhone = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <path d="M11 18h2" />
  </S>
);

export const IconCalendar = (p: IconProps) => (
  <S {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </S>
);

export const IconChevronRight = (p: IconProps) => (
  <S {...p}>
    <path d="M9 18l6-6-6-6" />
  </S>
);

export const IconArrowRight = (p: IconProps) => (
  <S {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </S>
);

export const IconPlus = (p: IconProps) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
);

export const IconTrash = (p: IconProps) => (
  <S {...p}>
    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
  </S>
);

export const IconLock = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </S>
);

export const IconPlane = (p: IconProps) => (
  <S {...p}>
    <path d="M17.8 19.2L16 11l3.5-3.5a2.12 2.12 0 00-3-3L13 8 4.8 6.2a.5.5 0 00-.5.8L8 11l-2 4-2-.5a.5.5 0 00-.5.8L6 17l1.7 2.5a.5.5 0 00.8-.5L8 17l4-2 3.5 3.7a.5.5 0 00.8-.5z" />
  </S>
);

export const IconSparkles = (p: IconProps) => (
  <S {...p}>
    <path d="M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8L12 3z" />
    <path d="M19 14l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
  </S>
);

export const IconInfo = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4M12 8h.01" />
  </S>
);

export const IconWallet = (p: IconProps) => (
  <S {...p}>
    <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    <path d="M16 12h3M3 9h13a2 2 0 012 2v2a2 2 0 01-2 2H3" />
  </S>
);

export const IconReceipt = (p: IconProps) => (
  <S {...p}>
    <path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1-2-1z" />
    <path d="M9 8h6M9 12h6" />
  </S>
);

export const IconGauge = (p: IconProps) => (
  <S {...p}>
    <path d="M12 14l4-4" />
    <path d="M5 19a9 9 0 1114 0" />
  </S>
);

export const IconUser = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0116 0" />
  </S>
);

export const IconBuilding = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="3" width="16" height="18" rx="1" />
    <path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h6" />
  </S>
);

export const IconGlobe = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
  </S>
);

export const IconX = (p: IconProps) => (
  <S {...p}>
    <path d="M18 6L6 18M6 6l12 12" />
  </S>
);

/** Coche pleine (succès) — fond plein, à utiliser sur pastilles. */
export const IconCheck = ({ className }: IconProps) => (
  <svg className={className ?? "w-4 h-4"} viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
      clipRule="evenodd"
    />
  </svg>
);

/** Spinner circulaire (chargement / bouton occupé). */
export const Spinner = ({ className }: IconProps) => (
  <svg className={className ?? "w-4 h-4 animate-spin"} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);
