import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  merchantPayoutsOptions,
  merchantProfileOptions,
  merchantSessionsOptions,
} from "@sensei/api-client";
import type { MerchantCheckoutSession } from "@sensei/api-client";
import { formatCents } from "@sensei/utils";
import { useAuth } from "../auth";
import { supabase } from "../supabase";
import {
  AppContainer,
  Badge,
  Card,
  cx,
  EmptyState,
  IconClipboard,
  IconPhone,
  InfoNote,
  Money,
  PageHeader,
  PrimaryButton,
  Spinner,
  SuccessToast,
} from "../components";

export const Route = createFileRoute("/merchant/terminal")({
  component: TerminalPage,
});

const STATUS_TONE: Record<string, "bright" | "trust" | "warn" | "muted" | "danger"> = {
  pending: "warn",
  authorized: "bright",
  expired: "muted",
  cancelled: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  authorized: "Autorisée",
  expired: "Expirée",
  cancelled: "Annulée",
};

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0 bg-sensei-paper border border-sensei-line rounded-xl px-4 py-2.5 font-mono text-xs text-sensei-text truncate">
        {value}
      </div>
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
  );
}

function SessionRow({
  s,
  onCapture,
  capturing,
}: {
  s: MerchantCheckoutSession;
  onCapture: (sessionId: string) => void;
  capturing: boolean;
}) {
  const link = `${window.location.origin}/checkout?token=${s.token}`;

  return (
    <div className="px-5 py-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-sensei-ink truncate">{s.order_ref}</p>
          <p className="text-xs text-sensei-muted mt-0.5">
            {new Date(s.created_at).toLocaleString("fr-CD", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-bold text-sensei-ink tabular-nums">
            <Money cents={s.amount_cents} />
          </span>
          <Badge tone={STATUS_TONE[s.status] ?? "muted"}>{STATUS_LABEL[s.status] ?? s.status}</Badge>
        </div>
      </div>

      {s.status === "pending" && <CopyField value={link} />}

      {s.status === "authorized" && (
        <button
          type="button"
          onClick={() => onCapture(s.id)}
          disabled={capturing}
          className="self-start px-4 py-2 bg-sensei-trust text-white text-xs font-bold rounded-lg hover:bg-sensei-trust/90 disabled:opacity-50 transition-all"
        >
          {capturing ? "Finalisation…" : "Finaliser la vente"}
        </button>
      )}
    </div>
  );
}

function TerminalPage() {
  const { appUser } = useAuth();
  const userId = appUser?.appUserId ?? "";
  const qc = useQueryClient();

  const { data: merchant } = useQuery({
    ...merchantProfileOptions(supabase, userId),
    enabled: !!userId,
  });
  const merchantId = merchant?.id ?? "";

  const { data: sessions = [], isLoading } = useQuery({
    ...merchantSessionsOptions(supabase, merchantId),
    enabled: !!merchantId,
  });

  const terminalSessions = sessions.filter((s) => s.metadata_json?.source === "virtual_terminal");

  const [amount, setAmount] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [newLink, setNewLink] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [capturingId, setCapturingId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      const amountCents = Math.round(parseFloat(amount.replace(",", ".")) * 100);
      const { data, error } = await supabase.functions.invoke("merchant-terminal", {
        body: { action: "create", amountCents, orderRef: orderRef.trim() || undefined, customerNote },
      });
      if (error || !data?.checkoutUrl) throw error ?? new Error("creation_failed");
      return data as { checkoutUrl: string };
    },
    onSuccess: (data) => {
      setNewLink(data.checkoutUrl);
      setAmount("");
      setOrderRef("");
      setCustomerNote("");
      qc.invalidateQueries({ queryKey: ["merchant", "sessions", merchantId] });
    },
    onError: () => setToast("Erreur lors de la création du lien. Réessayez."),
  });

  const captureMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      setCapturingId(sessionId);
      const { data, error } = await supabase.functions.invoke("merchant-terminal", {
        body: { action: "capture", sessionId },
      });
      if (error) throw error;
      return data as { payout: { netAmountCents: number } | null };
    },
    onSuccess: (data) => {
      setCapturingId(null);
      qc.invalidateQueries({ queryKey: ["merchant", "sessions", merchantId] });
      qc.invalidateQueries({ queryKey: ["merchant", "payouts", merchantId] });
      const net = data.payout?.netAmountCents;
      setToast(net != null ? `Vente finalisée — ${formatCents(net)} net versé.` : "Vente finalisée.");
    },
    onError: () => {
      setCapturingId(null);
      setToast("Erreur lors de la finalisation. Réessayez.");
    },
  });

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    setNewLink(null);
    setToast(null);
    createMutation.mutate();
  }

  const amountValid = parseFloat(amount.replace(",", ".")) > 0;

  return (
    <AppContainer>
      <PageHeader
        title="Terminal virtuel"
        subtitle="Créez un lien de paiement pour une vente par téléphone ou en personne."
      />

      {toast && (
        <div className="mb-5">
          <p className="text-sm text-sensei-danger font-semibold">{toast}</p>
        </div>
      )}

      {/* Nouvelle vente */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-sensei-bright/10 text-sensei-bright flex items-center justify-center">
            <IconPhone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-sensei-ink">Nouvelle vente</p>
            <p className="text-xs text-sensei-muted">
              Partagez le lien généré avec le client (WhatsApp, SMS manuel…).
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-sensei-text">
                Montant (USD) <span className="text-sensei-danger">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex : 50.00"
                required
                className="w-full border border-sensei-line rounded-xl px-4 py-3 text-sm text-sensei-text bg-sensei-paper placeholder:text-sensei-muted/50 focus:ring-2 focus:ring-sensei-bright/30 focus:border-sensei-bright transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-sensei-text">
                Référence{" "}
                <span className="text-sensei-muted font-normal text-xs">(facultatif)</span>
              </label>
              <input
                type="text"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="Ex : VENTE-042"
                className="w-full border border-sensei-line rounded-xl px-4 py-3 text-sm text-sensei-text bg-sensei-paper placeholder:text-sensei-muted/50 focus:ring-2 focus:ring-sensei-bright/30 focus:border-sensei-bright transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-sensei-text">
              Note interne{" "}
              <span className="text-sensei-muted font-normal text-xs">(facultatif, non visible par le client)</span>
            </label>
            <input
              type="text"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Ex : Client M. Mbala, vente comptoir"
              className="w-full border border-sensei-line rounded-xl px-4 py-3 text-sm text-sensei-text bg-sensei-paper placeholder:text-sensei-muted/50 focus:ring-2 focus:ring-sensei-bright/30 focus:border-sensei-bright transition-all"
            />
          </div>

          <PrimaryButton type="submit" disabled={!amountValid || createMutation.isPending} className="self-start">
            {createMutation.isPending ? "Création…" : "Générer le lien de paiement"}
          </PrimaryButton>

          {newLink && (
            <>
              <SuccessToast>Lien créé — copiez-le et partagez-le avec le client.</SuccessToast>
              <CopyField value={newLink} />
            </>
          )}

          <InfoNote>
            Le lien expire après 24 h — partagez-le immédiatement avec le client.
          </InfoNote>
        </form>
      </Card>

      {/* Ventes du terminal */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-sensei-line">
          <p className="text-sm font-bold text-sensei-ink">Ventes du terminal</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-14">
            <Spinner className="w-5 h-5 text-sensei-bright animate-spin" />
          </div>
        ) : terminalSessions.length === 0 ? (
          <EmptyState
            icon={<IconPhone className="w-5 h-5" />}
            title="Aucune vente"
            body="Les ventes créées depuis ce terminal apparaîtront ici."
          />
        ) : (
          <div className="divide-y divide-sensei-line">
            {terminalSessions.map((s) => (
              <SessionRow
                key={s.id}
                s={s}
                onCapture={(id) => captureMutation.mutate(id)}
                capturing={capturingId === s.id}
              />
            ))}
          </div>
        )}
      </Card>
    </AppContainer>
  );
}
