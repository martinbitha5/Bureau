/**
 * Clés de cache TanStack Query — centralisées pour rester cohérentes.
 * (docs/CLAUDE.md §3 : TOUT accès au backend passe par ce package.)
 */
export const queryKeys = {
  creditProfile: (userId: string) => ["credit", "profile", userId] as const,
  creditScoreEvents: (profileId: string) => ["credit", "score-events", profileId] as const,
  bnplPlans: (userId: string) => ["bnpl", "plans", userId] as const,
  installments: (planId: string) => ["bnpl", "installments", planId] as const,
  bookings: (userId: string) => ["flights", "bookings", userId] as const,
  flightSearch: (params: Record<string, unknown>) => ["flights", "search", params] as const,
} as const;
