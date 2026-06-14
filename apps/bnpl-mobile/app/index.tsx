import {
  bnplPlansOptions,
  creditProfileOptions,
  payInstallment,
  queryKeys,
} from "@sensei/api-client";
import { colors } from "@sensei/ui";
import { formatCents } from "@sensei/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../src/auth";
import { supabase } from "../src/supabase";

interface Installment {
  id: string;
  sequence: number;
  amount_cents: number;
  due_date: string;
  status: string;
}
interface Plan {
  id: string;
  total_cents: number;
  status: string;
  installments: Installment[];
}

const STATUS: Record<string, string> = {
  active: "En cours",
  completed: "Soldé",
  defaulted: "En défaut",
  cancelled: "Annulé",
};
const STATUS_COLORS: Record<string, string> = {
  active: colors.blueBright,
  completed: colors.trust,
  defaulted: colors.danger,
  cancelled: colors.muted,
};

export default function Plans() {
  const { session, appUser, loading } = useAuth();
  const qc = useQueryClient();
  const userId = appUser?.appUserId ?? "";
  const [toast, setToast] = useState<string | null>(null);

  const { data: plans } = useQuery({ ...bnplPlansOptions(supabase, userId), enabled: !!userId });
  const { data: profile } = useQuery({ ...creditProfileOptions(supabase, userId), enabled: !!userId });

  const mutation = useMutation({
    mutationFn: (installmentId: string) => payInstallment(supabase, installmentId),
    onSuccess: (res) => {
      if (res.newScore != null) setToast(`Paiement reçu. Votre score : ${res.newScore}`);
      qc.invalidateQueries({ queryKey: queryKeys.bnplPlans(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.creditProfile(userId) });
    },
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!session) return <Redirect href="/login" />;

  const typedPlans = (plans ?? []) as unknown as Plan[];
  const score = (profile?.current_score as number) ?? appUser?.score;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.head}>
        <Text style={styles.h1}>Mes paiements</Text>
        {score != null && (
          <View style={styles.scorePill}>
            <Text style={styles.scorePillText}>
              Score : <Text style={styles.scoreVal}>{score}</Text>
            </Text>
          </View>
        )}
      </View>

      {toast && <Text style={styles.toast}>{toast}</Text>}
      {typedPlans.length === 0 && (
        <Text style={styles.muted}>Aucun plan. Réservez un vol en BNPL pour commencer.</Text>
      )}

      {typedPlans.map((plan) => {
        const installments = [...plan.installments].sort((a, b) => a.sequence - b.sequence);
        const next = installments.find((i) => i.status !== "paid");
        const paidCount = installments.filter((i) => i.status === "paid").length;
        const progress = installments.length ? (paidCount / installments.length) * 100 : 0;
        const statusColor = STATUS_COLORS[plan.status] ?? colors.blueBright;
        return (
          <View key={plan.id} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.total}>{formatCents(plan.total_cents)}</Text>
              <View style={[styles.statusChip, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{STATUS[plan.status] ?? plan.status}</Text>
              </View>
            </View>
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: statusColor }]} />
              </View>
              <Text style={styles.progressText}>
                {paidCount}/{installments.length} payées
              </Text>
            </View>
            {installments.map((inst) => {
              const isPaid = inst.status === "paid";
              const isNext = next?.id === inst.id;
              const isPaying = mutation.isPending && mutation.variables === inst.id;
              return (
                <View key={inst.id} style={styles.instRow}>
                  <View>
                    <Text style={styles.instLabel}>Échéance {inst.sequence}</Text>
                    <Text style={styles.muted}>{new Date(inst.due_date).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.instRight}>
                    <Text style={styles.amount}>{formatCents(inst.amount_cents)}</Text>
                    {isPaid ? (
                      <Text style={styles.paid}>✓ Payée</Text>
                    ) : isNext ? (
                      <Pressable
                        style={styles.payBtn}
                        disabled={mutation.isPending}
                        onPress={() => mutation.mutate(inst.id)}
                      >
                        <Text style={styles.payText}>{isPaying ? "…" : "Payer"}</Text>
                      </Pressable>
                    ) : (
                      <Text style={styles.muted}>—</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  h1: { fontSize: 24, fontWeight: "800", color: colors.ink },
  scorePill: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  scorePillText: { color: colors.text },
  scoreVal: { color: colors.trust, fontWeight: "800" },
  toast: {
    backgroundColor: "rgba(30,142,90,0.1)",
    color: colors.trust,
    fontWeight: "600",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    overflow: "hidden",
  },
  muted: { color: colors.muted },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    marginBottom: 14,
  },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  total: { fontSize: 18, fontWeight: "800", color: colors.ink },
  statusChip: { backgroundColor: colors.blueBright, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  instRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.paper,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  instLabel: { fontWeight: "600", color: colors.ink },
  instRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  amount: { fontWeight: "700", color: colors.ink },
  paid: { color: colors.trust, fontWeight: "700" },
  payBtn: { backgroundColor: colors.blueBright, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  payText: { color: "#fff", fontWeight: "700" },
});
