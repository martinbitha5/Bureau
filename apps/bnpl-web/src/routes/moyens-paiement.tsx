import {
  addPaymentMethod,
  paymentMethodsOptions,
  queryKeys,
  removePaymentMethod,
  setDefaultPaymentMethod,
} from "@sensei/api-client";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../auth";
import {
  AppContainer,
  Badge,
  Card,
  EmptyState,
  IconLock,
  IconPlus,
  IconTrash,
  IconWallet,
  InfoNote,
  MOBILE_MONEY_PROVIDERS,
  MobileMoneyAvatar,
  PageHeader,
  PrimaryButton,
  RequireAuth,
  Spinner,
  SuccessToast,
  cx,
} from "../components";
import { useI18n } from "../i18n";
import { supabase } from "../supabase";

export const Route = createFileRoute("/moyens-paiement")({
  component: () => (
    <RequireAuth>
      <MoyensPaiementPage />
    </RequireAuth>
  ),
});

function MoyensPaiementPage() {
  const { t } = useI18n();
  const { appUser } = useAuth();
  const userId = appUser?.appUserId ?? "";
  const qc = useQueryClient();

  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ── Form state ───────────────────────────────────────────────────────────
  const [provider, setProvider] = useState<(typeof MOBILE_MONEY_PROVIDERS)[number]>("mpesa");
  const [phone, setPhone] = useState("");
  const [makeDefault, setMakeDefault] = useState(false);

  // ── Query ────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    ...paymentMethodsOptions(supabase, userId),
    enabled: !!userId,
  });
  const methods = data ?? [];

  // ── Mutations ────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: () =>
      addPaymentMethod(supabase, { userId, provider, phone, makeDefault }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.paymentMethods(userId) });
      const msg = makeDefault ? t("methods.addedDefault") : t("methods.added");
      setToast(msg);
      setPhone("");
      setMakeDefault(false);
      setShowAdd(false);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (methodId: string) => setDefaultPaymentMethod(supabase, userId, methodId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.paymentMethods(userId) });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (methodId: string) => removePaymentMethod(supabase, methodId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.paymentMethods(userId) });
    },
  });

  function handleRemove(methodId: string) {
    if (!window.confirm(t("methods.removeConfirm"))) return;
    removeMutation.mutate(methodId);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    addMutation.mutate();
  }

  const showAddForm = showAdd || (!isLoading && methods.length === 0);

  return (
    <AppContainer>
      <PageHeader
        title={t("methods.title")}
        subtitle={t("methods.subtitle")}
        action={
          !showAddForm ? (
            <PrimaryButton onClick={() => setShowAdd(true)}>
              <IconPlus className="w-4 h-4" />
              {t("methods.add")}
            </PrimaryButton>
          ) : undefined
        }
      />

      {/* Toast succès */}
      {toast && (
        <SuccessToast>
          {toast}
        </SuccessToast>
      )}

      {/* Liste des moyens de paiement */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="w-6 h-6 text-sensei-bright animate-spin" />
        </div>
      ) : methods.length > 0 ? (
        <div className="space-y-3 mb-6">
          {methods.map((pm) => (
            <Card key={pm.id} className="px-4 py-4">
              <div className="flex items-center gap-4">
                <MobileMoneyAvatar provider={pm.provider} size={44} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sensei-ink text-sm">
                      {t(`methods.provider.${pm.provider}`)}
                    </span>
                    {pm.is_default && (
                      <Badge tone="trust">{t("methods.default")}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-sensei-muted mt-0.5">
                    {t(`methods.providerSub.${pm.provider}`)}
                    {" · "}
                    {pm.masked_identifier}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!pm.is_default && (
                    <button
                      type="button"
                      onClick={() => setDefaultMutation.mutate(pm.id)}
                      disabled={setDefaultMutation.isPending}
                      className={cx(
                        "text-xs font-semibold text-sensei-bright hover:text-sensei-blue transition-colors disabled:opacity-50",
                      )}
                    >
                      {t("methods.setDefault")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(pm.id)}
                    disabled={removeMutation.isPending}
                    aria-label={t("methods.remove")}
                    className="p-1.5 text-sensei-muted hover:text-sensei-danger transition-colors disabled:opacity-50 rounded-lg hover:bg-sensei-danger/5"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : !showAddForm ? (
        <EmptyState
          icon={<IconWallet className="w-7 h-7" />}
          title={t("methods.empty")}
          body={t("methods.emptyBody")}
          action={
            <PrimaryButton onClick={() => setShowAdd(true)}>
              <IconPlus className="w-4 h-4" />
              {t("methods.add")}
            </PrimaryButton>
          }
        />
      ) : null}

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <Card className="p-5 mb-6" as="section">
          <h2 className="font-bold text-sensei-ink mb-4 text-base">
            {t("methods.addTitle")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Opérateur */}
            <div>
              <label className="block text-sm font-semibold text-sensei-ink mb-1.5">
                {t("methods.provider")}
              </label>
              <select
                value={provider}
                onChange={(e) =>
                  setProvider(e.target.value as (typeof MOBILE_MONEY_PROVIDERS)[number])
                }
                className="w-full border border-sensei-line rounded-xl px-3.5 py-2.5 text-sm text-sensei-ink bg-white focus:outline-none focus:ring-2 focus:ring-sensei-bright/30 focus:border-sensei-bright transition-all"
              >
                {MOBILE_MONEY_PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {t(`methods.provider.${p}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Numéro */}
            <div>
              <label className="block text-sm font-semibold text-sensei-ink mb-1.5">
                {t("methods.phone")}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+243…"
                required
                className="w-full border border-sensei-line rounded-xl px-3.5 py-2.5 text-sm text-sensei-ink placeholder:text-sensei-muted bg-white focus:outline-none focus:ring-2 focus:ring-sensei-bright/30 focus:border-sensei-bright transition-all"
              />
              <p className="text-xs text-sensei-muted mt-1.5">{t("methods.phoneHint")}</p>
            </div>

            {/* Défaut */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={makeDefault}
                onChange={(e) => setMakeDefault(e.target.checked)}
                className="w-4 h-4 rounded border-sensei-line text-sensei-bright focus:ring-sensei-bright/30"
              />
              <span className="text-sm text-sensei-ink">{t("methods.makeDefault")}</span>
            </label>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <PrimaryButton type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4 animate-spin" />
                    {t("methods.saving")}
                  </>
                ) : (
                  t("methods.add")
                )}
              </PrimaryButton>
              {(showAdd && methods.length > 0) && (
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="text-sm font-semibold text-sensei-muted hover:text-sensei-ink transition-colors"
                >
                  {t("common.cancel")}
                </button>
              )}
            </div>
          </form>
        </Card>
      )}

      {/* Note sécurité */}
      <InfoNote>
        <span className="font-bold text-sensei-ink">{t("methods.secured")}</span>
        {" — "}
        {t("methods.securedBody")}
      </InfoNote>
    </AppContainer>
  );
}
