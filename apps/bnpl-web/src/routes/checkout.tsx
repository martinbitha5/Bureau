import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatCents } from "@sensei/utils";
import {
  ALLOWED_INSTALLMENTS,
  buildInstallments,
  MAX_PRINCIPAL_CENTS,
  scoreToBand,
} from "@sensei/payments";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import { supabase } from "../supabase";
import {
  AppContainer,
  Badge,
  Card,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconInfo,
  IconShield,
  Money,
  Spinner,
  cx,
} from "../components";

// ── Route ────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search["token"] as string) ?? "",
  }),
  component: CheckoutPage,
});

// ── Types ────────────────────────────────────────────────────────────────

interface CheckoutSession {
  id: string;
  token: string;
  amount_cents: number;
  currency: string;
  order_ref: string;
  status: "pending" | "authorized" | "expired" | "cancelled";
  metadata_json: { merchantName?: string; items?: unknown[] };
  return_url: string;
  cancel_url: string;
  expires_at: string;
}

// ── Page ─────────────────────────────────────────────────────────────────

function CheckoutPage() {
  const { token } = Route.useSearch();
  const { t } = useI18n();
  const { session: authSession, appUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [installmentCount, setInstallmentCount] = useState<3 | 4>(3);
  const [confirmed, setConfirmed] = useState(false);

  const { data: checkoutSession, isLoading, error } = useQuery({
    queryKey: ["checkout_session", token],
    queryFn: async (): Promise<CheckoutSession> => {
      if (!token) throw new Error("no_token");
      const { data, error } = await supabase
        .from("checkout_sessions")
        .select(
          "id, token, amount_cents, currency, order_ref, status, metadata_json, return_url, cancel_url, expires_at",
        )
        .eq("token", token)
        .single();
      if (error) throw error;
      return data as CheckoutSession;
    },
    enabled: !!token,
    staleTime: 0,
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("checkout-confirm", {
        body: { token, installmentCount },
      });
      if (error) throw error;
      return data as {
        approved: boolean;
        reasonCode?: string;
        redirectUrl?: string;
        totalCents?: number;
        installmentCount?: number;
      };
    },
    onSuccess: (result) => {
      if (result.approved && result.redirectUrl) {
        setConfirmed(true);
        window.location.href = result.redirectUrl;
      }
    },
  });

  // ── Cas manquants ──────────────────────────────────────────────────────

  if (!token) {
    return (
      <ErrorScreen
        title="Lien invalide"
        body="Aucun token de paiement dans l'URL. Revenez sur le site du marchand."
      />
    );
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-6 h-6 text-sensei-bright animate-spin" />
      </div>
    );
  }

  if (error || !checkoutSession) {
    return (
      <ErrorScreen
        title="Session introuvable"
        body="Ce lien de paiement n'existe pas ou a expiré."
      />
    );
  }

  if (checkoutSession.status === "expired" || new Date(checkoutSession.expires_at) < new Date()) {
    return (
      <ErrorScreen
        title="Session expirée"
        body="Ce lien de paiement a expiré (validité 24 h). Revenez sur le site du marchand pour relancer le paiement."
        cancelUrl={checkoutSession.cancel_url}
      />
    );
  }

  if (checkoutSession.status === "authorized") {
    return (
      <SuccessScreen
        merchantName={checkoutSession.metadata_json.merchantName}
        amountCents={checkoutSession.amount_cents}
      />
    );
  }

  if (checkoutSession.status === "cancelled") {
    return (
      <ErrorScreen
        title="Paiement annulé"
        body="Cette session a été annulée. Revenez sur le site du marchand."
        cancelUrl={checkoutSession.cancel_url}
      />
    );
  }

  // ── Garde auth ────────────────────────────────────────────────────────

  if (!authSession) {
    return <AuthWall token={token} session={checkoutSession} />;
  }

  // ── Éligibilité ───────────────────────────────────────────────────────

  const score = appUser?.score ?? 300;
  const band = scoreToBand(score);
  const maxCents = MAX_PRINCIPAL_CENTS[band] ?? 0;
  const isEligible = score >= 580 && checkoutSession.amount_cents <= maxCents;
  const declineReason =
    score < 580
      ? "score_too_low"
      : checkoutSession.amount_cents > maxCents
        ? "amount_over_limit"
        : null;

  const schedule = isEligible
    ? buildInstallments(checkoutSession.amount_cents, installmentCount, new Date())
    : [];

  const merchantName =
    checkoutSession.metadata_json.merchantName ?? "le marchand";

  return (
    <div className="min-h-screen bg-gradient-to-b from-sensei-paper to-white py-10 px-4">
      <AppContainer>
        <div className="max-w-xl mx-auto">

          {/* En-tête marchand */}
          <div className="text-center mb-8">
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-3 bg-sensei-bright/10 text-sensei-bright">
              Paiement Sensei Pay
            </span>
            <h1 className="text-2xl font-bold text-sensei-ink">
              {t("checkout.title", { merchant: merchantName })}
            </h1>
            <p className="text-sensei-muted text-sm mt-1">{t("checkout.subtitle")}</p>
          </div>

          {/* Récapitulatif du montant */}
          <Card className="overflow-hidden mb-5">
            <div className="bg-sensei-ink text-white px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1">
                  {t("checkout.total")}
                </p>
                <p className="text-3xl font-black tabular-nums">
                  <Money cents={checkoutSession.amount_cents} />
                </p>
                <p className="text-sm text-white/55 mt-1">
                  Commande {checkoutSession.order_ref}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <IconShield className="w-6 h-6 text-white/70" />
              </div>
            </div>
          </Card>

          {/* Zone éligibilité */}
          {!isEligible ? (
            <DeclinedCard reasonCode={declineReason!} maxCents={maxCents} score={score} />
          ) : (
            <>
              {/* Sélecteur d'échéances */}
              <Card className="p-6 mb-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-sensei-muted mb-3">
                  {t("checkout.installmentsLabel")}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(ALLOWED_INSTALLMENTS as readonly number[]).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setInstallmentCount(n as 3 | 4)}
                      className={cx(
                        "py-4 rounded-xl text-sm font-bold border transition-all",
                        installmentCount === n
                          ? "bg-sensei-bright text-white border-sensei-bright shadow-sm"
                          : "bg-sensei-paper text-sensei-text border-sensei-line hover:border-sensei-bright hover:text-sensei-bright",
                      )}
                    >
                      {n}× {formatCents(Math.ceil(checkoutSession.amount_cents / n))} / mois
                    </button>
                  ))}
                </div>

                {/* Échéancier */}
                <div className="divide-y divide-sensei-line border border-sensei-line rounded-xl overflow-hidden">
                  {schedule.map(({ sequence, amountCents, dueDate }) => {
                    const isFirst = sequence === 1;
                    return (
                      <div
                        key={sequence}
                        className={cx(
                          "flex items-center justify-between px-4 py-3",
                          isFirst ? "bg-sensei-bright/5" : "bg-white",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cx(
                              "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0",
                              isFirst
                                ? "bg-sensei-bright text-white"
                                : "bg-sensei-paper border border-sensei-line text-sensei-muted",
                            )}
                          >
                            {sequence}
                          </div>
                          <p className={cx("text-sm font-semibold", isFirst ? "text-sensei-bright" : "text-sensei-text")}>
                            {new Date(dueDate).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                            {isFirst && (
                              <span className="ml-2 text-[10px] font-bold text-sensei-bright bg-sensei-bright/10 px-1.5 py-0.5 rounded-full">
                                Aujourd'hui
                              </span>
                            )}
                          </p>
                        </div>
                        <span className={cx("font-black tabular-nums text-sm", isFirst ? "text-sensei-bright" : "text-sensei-ink")}>
                          {formatCents(amountCents)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Trust signal */}
                <div className="flex items-center gap-2 mt-4 text-xs text-sensei-trust font-semibold">
                  <IconCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Sans frais cachés — 0 % d'intérêts</span>
                </div>
              </Card>

              {/* Erreur de confirm */}
              {confirmMutation.isError && (
                <div className="flex items-center gap-2.5 bg-sensei-danger/8 text-sensei-danger text-sm font-medium px-4 py-3 rounded-xl border border-sensei-danger/20 mb-4">
                  <IconInfo className="w-4 h-4 flex-shrink-0" />
                  Une erreur est survenue. Veuillez réessayer.
                </div>
              )}

              {/* Résultat declined si la mutation retourne not approved */}
              {confirmMutation.isSuccess && !confirmMutation.data?.approved && (
                <DeclinedCard
                  reasonCode={confirmMutation.data?.reasonCode ?? "score_too_low"}
                  maxCents={maxCents}
                  score={score}
                />
              )}

              {/* Consentement lecture du score (CLAUDE.md §5) */}
              <p className="text-center text-xs text-sensei-muted mb-3">
                {t("checkout.consentDisclosure", { merchant: merchantName })}
              </p>

              {/* Bouton confirmer */}
              <button
                type="button"
                disabled={confirmMutation.isPending || confirmed}
                onClick={() => confirmMutation.mutate()}
                className="w-full py-4 bg-sensei-bright text-white font-bold rounded-2xl hover:bg-sensei-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sensei-bright/20 text-base flex items-center justify-center gap-2"
              >
                {confirmMutation.isPending || confirmed ? (
                  <>
                    <Spinner className="w-4 h-4 animate-spin" />
                    Confirmation en cours…
                  </>
                ) : (
                  <>
                    Confirmer le financement <IconArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-sensei-muted mt-3">
                En confirmant, vous acceptez l'échéancier ci-dessus.
                <br />
                <a
                  href={checkoutSession.cancel_url}
                  className="underline hover:text-sensei-bright"
                >
                  Retourner sur {merchantName}
                </a>
              </p>
            </>
          )}

          {/* Logo Sensei */}
          <div className="text-center mt-8">
            <p className="text-xs text-sensei-muted">
              Paiement sécurisé par{" "}
              <Link to="/" className="font-bold text-sensei-bright hover:underline">
                Sensei Pay
              </Link>
            </p>
          </div>
        </div>
      </AppContainer>
    </div>
  );
}

// ── Sous-composants ───────────────────────────────────────────────────────

function AuthWall({
  token,
  session,
}: {
  token: string;
  session: CheckoutSession;
}) {
  const merchantName = session.metadata_json.merchantName ?? "le marchand";
  return (
    <div className="min-h-screen bg-gradient-to-b from-sensei-paper to-white py-10 px-4">
      <AppContainer>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-3 bg-sensei-bright/10 text-sensei-bright">
              Paiement Sensei Pay
            </span>
            <h1 className="text-2xl font-bold text-sensei-ink">
              Financer ma commande
            </h1>
            <p className="text-sensei-muted text-sm mt-1">
              Connectez-vous pour payer{" "}
              <strong>{formatCents(session.amount_cents)}</strong> en plusieurs fois
              chez {merchantName}.
            </p>
          </div>

          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sensei-bright/10 text-sensei-bright flex items-center justify-center mx-auto mb-5">
              <IconShield className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-sensei-ink mb-2">
              Connexion requise
            </h2>
            <p className="text-sm text-sensei-muted mb-6">
              Connectez-vous ou créez un compte Sensei pour finaliser votre paiement en plusieurs fois.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                search={{ next: `/checkout?token=${token}` } as never}
                className="w-full py-3.5 bg-sensei-bright text-white font-bold rounded-xl hover:bg-sensei-blue transition-all text-sm text-center"
              >
                Se connecter
              </Link>
              <Link
                to="/signup"
                search={{ next: `/checkout?token=${token}` } as never}
                className="w-full py-3.5 bg-sensei-paper border border-sensei-line text-sensei-text font-semibold rounded-xl hover:border-sensei-bright hover:text-sensei-bright transition-all text-sm text-center"
              >
                Créer un compte Sensei
              </Link>
            </div>
          </Card>

          <p className="text-center text-xs text-sensei-muted mt-5">
            <a href={session.cancel_url} className="underline hover:text-sensei-bright">
              Retourner sur {merchantName}
            </a>
          </p>
        </div>
      </AppContainer>
    </div>
  );
}

function DeclinedCard({
  reasonCode,
  maxCents,
  score,
}: {
  reasonCode: string;
  maxCents: number;
  score: number;
}) {
  const messages: Record<string, string> = {
    score_too_low: `Votre score actuel (${score}) est insuffisant pour ce financement. Améliorez votre score en remboursant vos échéances existantes.`,
    amount_over_limit: `Ce montant dépasse votre plafond actuel de ${formatCents(maxCents)}. Réduisez le montant ou améliorez votre score.`,
  };

  return (
    <Card className="border-sensei-warn/40 mb-4">
      <div className="bg-sensei-warn/5 px-6 py-5 border-b border-sensei-warn/20 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-sensei-warn/15 text-sensei-warn flex items-center justify-center flex-shrink-0">
          <IconInfo className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sensei-ink">Financement non disponible</p>
          <Badge tone="warn">{reasonCode}</Badge>
        </div>
      </div>
      <div className="px-6 py-5">
        <p className="text-sensei-text text-sm leading-relaxed">
          {messages[reasonCode] ?? "Ce financement n'est pas disponible pour le moment."}
        </p>
        <Link
          to="/score"
          className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-sensei-bright hover:text-sensei-blue"
        >
          Voir mon score <IconArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Card>
  );
}

function SuccessScreen({
  merchantName,
  amountCents,
}: {
  merchantName?: string;
  amountCents: number;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sensei-paper to-white py-10 px-4 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-sensei-trust/15 text-sensei-trust flex items-center justify-center mx-auto mb-6">
          <IconCheck className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-sensei-ink mb-2">Financement confirmé</h1>
        <p className="text-sensei-muted mb-1">
          {formatCents(amountCents)} financés chez {merchantName ?? "le marchand"}.
        </p>
        <p className="text-sm text-sensei-muted">
          Redirection en cours vers le site du marchand…
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sensei-bright hover:underline"
          >
            Voir mon tableau de bord <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({
  title,
  body,
  cancelUrl,
}: {
  title: string;
  body: string;
  cancelUrl?: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sensei-paper to-white py-10 px-4 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-sensei-danger/10 text-sensei-danger flex items-center justify-center mx-auto mb-5">
          <IconInfo className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-sensei-ink mb-2">{title}</h1>
        <p className="text-sensei-muted text-sm mb-6">{body}</p>
        {cancelUrl && (
          <a
            href={cancelUrl}
            className="inline-flex items-center gap-2 px-5 py-3 bg-sensei-bright text-white font-bold rounded-xl hover:bg-sensei-blue transition-all text-sm"
          >
            Retourner au site <IconArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
