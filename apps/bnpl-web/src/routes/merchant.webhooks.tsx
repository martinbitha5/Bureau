import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  merchantProfileOptions,
  merchantWebhookEventsOptions,
} from "@sensei/api-client";
import type { MerchantWebhookEvent } from "@sensei/api-client";
import { useAuth } from "../auth";
import { supabase } from "../supabase";
import {
  AppContainer,
  Badge,
  Card,
  EmptyState,
  IconCalendar,
  InfoNote,
  PageHeader,
  PrimaryButton,
  Spinner,
  SuccessToast,
  cx,
} from "../components";

export const Route = createFileRoute("/merchant/webhooks")({
  component: WebhooksPage,
});

const EVENT_TONE: Record<string, "bright" | "trust" | "warn" | "danger" | "muted"> = {
  delivered: "trust",
  pending: "warn",
  failed: "danger",
};

const EVENT_LABEL: Record<string, string> = {
  delivered: "Livré",
  pending: "En attente",
  failed: "Échec",
};

function EventRow({ ev }: { ev: MerchantWebhookEvent }) {
  return (
    <tr className="hover:bg-sensei-paper/40 transition-colors">
      <td className="px-5 py-3 text-xs font-mono text-sensei-text">{ev.event_type}</td>
      <td className="px-4 py-3">
        <Badge tone={EVENT_TONE[ev.status] ?? "muted"}>{EVENT_LABEL[ev.status] ?? ev.status}</Badge>
      </td>
      <td className="px-4 py-3 text-xs text-sensei-muted text-center">{ev.attempts}</td>
      <td className="px-5 py-3 text-xs text-sensei-muted whitespace-nowrap">
        {ev.delivered_at
          ? new Date(ev.delivered_at).toLocaleString("fr-CD", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : ev.last_attempt_at
          ? new Date(ev.last_attempt_at).toLocaleString("fr-CD", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"}
      </td>
    </tr>
  );
}

function WebhooksPage() {
  const { appUser } = useAuth();
  const userId = appUser?.appUserId ?? "";
  const qc = useQueryClient();

  const { data: merchant } = useQuery({
    ...merchantProfileOptions(supabase, userId),
    enabled: !!userId,
  });

  const merchantId = merchant?.id ?? "";
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    ...merchantWebhookEventsOptions(supabase, merchantId),
    enabled: !!merchantId,
  });

  const [webhookUrl, setWebhookUrl] = useState(merchant?.webhook_url ?? "");
  const [saving, setSaving] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Sync l'input si merchant arrive après le premier rendu
  if (merchant?.webhook_url && !webhookUrl) {
    setWebhookUrl(merchant.webhook_url);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNewSecret(null);

    const { data, error } = await supabase.functions.invoke("merchant-setup", {
      body: { action: "update_webhook", webhookUrl: webhookUrl.trim() || null },
    });

    setSaving(false);

    if (error || !data?.webhookSecret) {
      setToast("Erreur lors de la mise à jour. Réessayez.");
      return;
    }

    setNewSecret(data.webhookSecret as string);
    qc.invalidateQueries({ queryKey: ["merchant", "profile", userId] });
  }

  return (
    <AppContainer>
      <PageHeader
        title="Webhooks"
        subtitle="Recevez les événements de paiement sur votre serveur."
      />

      {toast && (
        <div className="mb-5">
          <p className="text-sm text-sensei-danger font-semibold">{toast}</p>
        </div>
      )}

      {/* Configuration */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-sensei-bright/10 text-sensei-bright flex items-center justify-center">
            <IconCalendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-sensei-ink">URL de destination</p>
            <p className="text-xs text-sensei-muted">
              Sensei envoie un POST HTTPS signé à chaque événement.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://votresite.cd/webhooks/sensei"
              className="flex-1 border border-sensei-line rounded-xl px-4 py-3 text-sm text-sensei-text bg-sensei-paper placeholder:text-sensei-muted/50 focus:ring-2 focus:ring-sensei-bright/30 focus:border-sensei-bright transition-all"
            />
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </PrimaryButton>
          </div>

          {newSecret && (
            <SuccessToast>
              Nouveau secret webhook généré. Copiez-le maintenant :{" "}
              <code className="font-mono text-xs bg-sensei-trust/10 px-2 py-0.5 rounded break-all">
                {newSecret}
              </code>
            </SuccessToast>
          )}

          <InfoNote>
            Chaque requête porte le header{" "}
            <code className="font-mono bg-sensei-paper px-1 rounded">X-Sensei-Signature: sha256=…</code>.
            Vérifiez la signature HMAC-SHA256 avec votre secret webhook avant de traiter l'événement.
          </InfoNote>
        </form>
      </Card>

      {/* Événements */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-sensei-line">
          <p className="text-sm font-bold text-sensei-ink">Événements récents</p>
        </div>

        {eventsLoading ? (
          <div className="flex items-center justify-center py-14">
            <Spinner className="w-5 h-5 text-sensei-bright animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={<IconCalendar className="w-5 h-5" />}
            title="Aucun événement"
            body="Les événements de paiement (CHECKOUT.AUTHORIZED, PAYMENT.CAPTURED, etc.) s'afficheront ici."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-sensei-line bg-sensei-paper/50">
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                    Événement
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-sensei-muted text-center">
                    Essais
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-sensei-muted">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sensei-line">
                {events.map((ev) => (
                  <EventRow key={ev.id} ev={ev} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Types d'événements */}
      <Card className="p-6 mt-6">
        <p className="text-sm font-bold text-sensei-ink mb-3">Types d'événements</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { type: "CHECKOUT.AUTHORIZED", desc: "L'acheteur a confirmé son plan de paiement." },
            { type: "PAYMENT.CAPTURED", desc: "Le paiement a été capturé par votre serveur." },
            { type: "PAYMENT.VOIDED", desc: "La session a été annulée avant capture." },
            { type: "PAYMENT.REFUNDED", desc: "Un remboursement a été émis." },
            { type: "PAYOUT.PAID", desc: "Le montant net de la vente vous a été versé." },
            { type: "PAYOUT.REVERSED", desc: "Une reprise a été émise suite à un remboursement." },
          ].map(({ type, desc }) => (
            <div
              key={type}
              className="bg-sensei-paper border border-sensei-line rounded-xl px-4 py-3"
            >
              <p className="text-xs font-mono font-bold text-sensei-ink">{type}</p>
              <p className="text-xs text-sensei-muted mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </AppContainer>
  );
}
