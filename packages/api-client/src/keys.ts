/**
 * Clés de cache TanStack Query — centralisées pour rester cohérentes.
 * (docs/CLAUDE.md §3 : TOUT accès au backend passe par ce package.)
 */
export const queryKeys = {
  creditProfile: (userId: string) => ["credit", "profile", userId] as const,
  creditScoreEvents: (profileId: string) => ["credit", "score-events", profileId] as const,
  creditReportLines: (userId: string) => ["credit", "report-lines", userId] as const,
  consents: (userId: string) => ["credit", "consents", userId] as const,
  identities: (userId: string) => ["credit", "identities", userId] as const,
  bnplPlans: (userId: string) => ["bnpl", "plans", userId] as const,
  bnplPlan: (planId: string) => ["bnpl", "plan", planId] as const,
  installments: (planId: string) => ["bnpl", "installments", planId] as const,
  paymentMethods: (userId: string) => ["payments", "methods", userId] as const,
  paymentsHistory: (userId: string) => ["payments", "history", userId] as const,
  bookings: (userId: string) => ["flights", "bookings", userId] as const,
  flightSearch: (params: Record<string, unknown>) => ["flights", "search", params] as const,
  merchantProfile: (userId: string) => ["merchant", "profile", userId] as const,
  merchantSessions: (merchantId: string) => ["merchant", "sessions", merchantId] as const,
  merchantWebhooks: (merchantId: string) => ["merchant", "webhooks", merchantId] as const,
} as const;
