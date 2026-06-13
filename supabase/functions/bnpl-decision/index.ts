// Edge Function `bnpl-decision` (runtime Deno).
// Décide l'éligibilité BNPL à partir du score. Réplique la logique pure de
// packages/payments/src/bnpl.ts (les Edge Functions tournent dans un runtime isolé, on ne
// peut pas importer le package du monorepo — la logique est volontairement dupliquée ici).
// Déploiement (plus tard) : supabase functions deploy bnpl-decision

type ScoreBand = "poor" | "fair" | "good" | "very_good" | "excellent";

const MAX_PRINCIPAL_CENTS: Record<ScoreBand, number> = {
  poor: 0,
  fair: 50_000,
  good: 150_000,
  very_good: 300_000,
  excellent: 500_000,
};
const ALLOWED_INSTALLMENTS = [3, 4];

function scoreToBand(score: number): ScoreBand {
  if (score < 580) return "poor";
  if (score < 670) return "fair";
  if (score < 740) return "good";
  if (score < 800) return "very_good";
  return "excellent";
}

function decide(score: number, principalCents: number, installmentCount: number) {
  const band = scoreToBand(score);
  if (!Number.isInteger(principalCents) || principalCents <= 0) {
    return { approved: false, reasonCode: "invalid_amount", band };
  }
  if (!ALLOWED_INSTALLMENTS.includes(installmentCount)) {
    return { approved: false, reasonCode: "invalid_installments", band };
  }
  if (score < 580) return { approved: false, reasonCode: "score_too_low", band };
  if (principalCents > MAX_PRINCIPAL_CENTS[band]) {
    return { approved: false, reasonCode: "amount_over_limit", band };
  }
  return {
    approved: true,
    reasonCode: "approved",
    band,
    principalCents,
    feeCents: 0,
    totalCents: principalCents,
    installmentCount,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const { score, principalCents, installmentCount } = await req.json();
    const decision = decide(Number(score), Number(principalCents), Number(installmentCount));
    return new Response(JSON.stringify(decision), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (_e) {
    return new Response(JSON.stringify({ error: "bad_request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
