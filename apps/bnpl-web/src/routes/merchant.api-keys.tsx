import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { merchantProfileOptions } from "@sensei/api-client";
import { useAuth } from "../auth";
import { supabase } from "../supabase";
import {
  AppContainer,
  Card,
  IconCard,
  IconClipboard,
  IconLock,
  IconWallet,
  InfoNote,
  PageHeader,
  PrimaryButton,
  SuccessToast,
  cx,
} from "../components";

export const Route = createFileRoute("/merchant/api-keys")({
  component: ApiKeysPage,
});

function CopyField({
  label,
  value,
  secret,
}: {
  label: string;
  value: string;
  secret?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const display = secret && !revealed ? "•".repeat(24) : value;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-bold uppercase tracking-wider text-sensei-muted">{label}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 bg-sensei-paper border border-sensei-line rounded-xl px-4 py-2.5 font-mono text-sm text-sensei-text truncate">
          {display}
        </div>
        {secret && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="flex-shrink-0 p-2.5 rounded-xl border border-sensei-line bg-white hover:bg-sensei-paper transition text-sensei-muted"
            title={revealed ? "Masquer" : "Afficher"}
          >
            <IconLock className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={copy}
          className={cx(
            "flex-shrink-0 p-2.5 rounded-xl border border-sensei-line bg-white hover:bg-sensei-paper transition",
            copied ? "text-sensei-trust" : "text-sensei-muted",
          )}
          title="Copier"
        >
          <IconClipboard className="w-4 h-4" />
        </button>
      </div>
      {copied && (
        <p className="text-xs text-sensei-trust font-semibold">Copié !</p>
      )}
    </div>
  );
}

function ApiKeysPage() {
  const { appUser } = useAuth();
  const userId = appUser?.appUserId ?? "";
  const qc = useQueryClient();

  const { data: merchant } = useQuery({
    ...merchantProfileOptions(supabase, userId),
    enabled: !!userId,
  });

  const [newSecretKey, setNewSecretKey] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleRegenerate() {
    if (
      !confirm(
        "Régénérer la clé secrète invalidera l'ancienne immédiatement. Continuer ?",
      )
    )
      return;

    setRegenerating(true);
    const { data, error } = await supabase.functions.invoke("merchant-setup", {
      body: { action: "regenerate_secret" },
    });
    setRegenerating(false);

    if (error || !data?.secretKey) {
      setToast("Erreur lors de la régénération. Réessayez.");
      return;
    }

    setNewSecretKey(data.secretKey as string);
    qc.invalidateQueries({ queryKey: ["merchant", "profile", userId] });
  }

  return (
    <AppContainer>
      <PageHeader
        title="Clés API"
        subtitle="Intégrez Sensei Pay sur votre site avec ces identifiants."
      />

      {toast && (
        <div className="mb-5">
          <p className="text-sm text-sensei-danger font-semibold">{toast}</p>
        </div>
      )}

      {/* Clé publique */}
      <Card className="p-6 mb-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-sensei-bright/10 text-sensei-bright flex items-center justify-center">
            <IconCard className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-sensei-ink">Clé publique</p>
            <p className="text-xs text-sensei-muted">Utilisée dans sensei.js / votre frontend.</p>
          </div>
        </div>
        {merchant?.api_key_public ? (
          <CopyField label="pk_live" value={merchant.api_key_public} />
        ) : (
          <p className="text-sm text-sensei-muted">
            Aucune clé — terminez la configuration du compte.
          </p>
        )}
      </Card>

      {/* Clé secrète */}
      <Card className="p-6 mb-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-sensei-warn/10 text-sensei-warn flex items-center justify-center">
            <IconLock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-sensei-ink">Clé secrète</p>
            <p className="text-xs text-sensei-muted">
              Côté serveur uniquement — ne jamais exposer dans le frontend.
            </p>
          </div>
        </div>

        {newSecretKey ? (
          <>
            <SuccessToast>Nouvelle clé générée — copiez-la maintenant, elle ne sera plus affichée.</SuccessToast>
            <CopyField label="sk_live (nouvelle)" value={newSecretKey} />
          </>
        ) : (
          <div className="bg-sensei-paper border border-sensei-line rounded-xl px-4 py-2.5 font-mono text-sm text-sensei-muted">
            {"•".repeat(48)}
          </div>
        )}

        <div className="mt-4">
          <PrimaryButton
            onClick={handleRegenerate}
            disabled={regenerating}
            className="bg-sensei-warn hover:bg-sensei-warn/80"
          >
            {regenerating ? "Génération…" : "Régénérer la clé secrète"}
          </PrimaryButton>
        </div>
      </Card>

      {/* Réglages de règlement */}
      <Card className="p-6 mb-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-sensei-trust/10 text-sensei-trust flex items-center justify-center">
            <IconWallet className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-sensei-ink">Réglages de règlement</p>
            <p className="text-xs text-sensei-muted">
              Comment et à quel taux vous êtes payé après chaque vente capturée.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-sensei-muted">
              Commission Sensei
            </p>
            <div className="bg-sensei-paper border border-sensei-line rounded-xl px-4 py-2.5 text-sm text-sensei-text">
              {merchant ? `${(merchant.commission_bps / 100).toFixed(2)} %` : "—"}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-sensei-muted">
              Compte de règlement
            </p>
            <div className="bg-sensei-paper border border-sensei-line rounded-xl px-4 py-2.5 text-sm text-sensei-text truncate">
              {merchant?.settlement_account ?? "Non configuré"}
            </div>
          </div>
        </div>

        <p className="text-xs text-sensei-muted mt-4">
          Le montant net de chaque vente (prix moins commission) y est versé au comptant, en une
          fois, dès la capture. Pour modifier ces réglages, contactez le support Sensei.
        </p>
      </Card>

      {/* Guide rapide */}
      <Card className="p-6">
        <p className="text-sm font-bold text-sensei-ink mb-3">Intégration rapide</p>
        <InfoNote>
          Ajoutez <code className="font-mono bg-sensei-paper px-1 rounded">sensei.js</code> à votre
          page produit, initialisez avec votre clé publique, et appelez{" "}
          <code className="font-mono bg-sensei-paper px-1 rounded">Sensei.checkout()</code> au clic
          sur « Payer en plusieurs fois ». Votre serveur finalise avec la clé secrète.
        </InfoNote>

        <pre className="mt-4 bg-sensei-ink text-white/80 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed">
{`<script src="https://cdn.sensei.cd/v1/sensei.js"></script>
<script>
  Sensei.init({ publicKey: '${merchant?.api_key_public ?? "pk_live_…"}' });

  document.getElementById('pay-btn').addEventListener('click', () => {
    Sensei.checkout({
      amount: 15000,          // centimes USD
      currency: 'USD',
      orderId: 'ORDER-001',
      returnUrl: 'https://monsite.cd/merci',
      cancelUrl:  'https://monsite.cd/annule',
    });
  });
</script>`}
        </pre>
      </Card>
    </AppContainer>
  );
}
