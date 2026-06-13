/**
 * Design tokens — source unique, alignée sur docs/BRAND_BRIEF.md §3.
 * Utilisés côté web (CSS vars) ET mobile (objet JS). Ne pas redéfinir de couleur ailleurs.
 */
export const colors = {
  ink: "#0A1B2E",
  blue: "#123A6B",
  blueBright: "#1E63C4",
  trust: "#1E8E5A",
  warn: "#C9852A",
  danger: "#B3271E",
  paper: "#F7F9FC",
  line: "#D9E1EC",
  text: "#1B2733",
  muted: "#5B6B7B",
} as const;

export type ColorToken = keyof typeof colors;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 6, md: 10, lg: 16, pill: 999 } as const;
