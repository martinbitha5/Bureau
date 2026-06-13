import { type FlightOffer, confirmBnplBooking } from "@sensei/api-client";
import { buildInstallments, decideBnpl, scoreToBand } from "@sensei/payments";
import { colors } from "@sensei/ui";
import { formatCents } from "@sensei/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../src/auth";
import { supabase } from "../src/supabase";

export default function Checkout() {
  const router = useRouter();
  const { session, appUser } = useAuth();
  const p = useLocalSearchParams();
  const origin = String(p.origin ?? "");
  const destination = String(p.destination ?? "");
  const departDate = String(p.departDate ?? "");
  const passengers = Number(p.passengers ?? 1);
  const cabin = (["economy", "premium", "business"].includes(String(p.cabin)) ? String(p.cabin) : "economy") as
    | "economy"
    | "premium"
    | "business";
  const carrier = String(p.carrier ?? "");
  const flightNumber = String(p.flightNumber ?? "");
  const providerOfferId = String(p.providerOfferId ?? "");
  const totalCents = Number(p.totalCents ?? 0);

  const [installmentCount, setInstallmentCount] = useState(4);
  const [busy, setBusy] = useState(false);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const score = appUser?.score ?? 620;
  const decision = useMemo(
    () => decideBnpl({ score, principalCents: totalCents, installmentCount }),
    [score, totalCents, installmentCount],
  );
  const schedule = useMemo(
    () => (decision.approved ? buildInstallments(decision.totalCents, decision.installmentCount, new Date()) : []),
    [decision],
  );

  async function onConfirm() {
    if (!session || !appUser) {
      router.push("/login");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const offer: FlightOffer = {
        providerOfferId,
        provider: "mock",
        totalCents,
        currency: "USD",
        expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
        segments: [
          {
            from: origin,
            to: destination,
            departAt: `${departDate}T08:00:00Z`,
            arriveAt: `${departDate}T12:00:00Z`,
            carrier,
            flightNumber,
          },
        ],
      };
      const result = await confirmBnplBooking(supabase, {
        userId: appUser.appUserId,
        score: appUser.score,
        installmentCount,
        search: { origin, destination, departDate, passengers, cabin },
        offer,
      });
      if (!result.bookingId) setError("Financement non disponible pour ce montant.");
      else setConfirmedRef(result.bookingId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.h1}>Paiement</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.muted}>
            {carrier} · {flightNumber}
          </Text>
          <Text style={styles.total}>{formatCents(totalCents)}</Text>
        </View>

        <Text style={styles.label}>Nombre d'échéances</Text>
        <View style={styles.seg}>
          {[3, 4].map((n) => (
            <Pressable
              key={n}
              style={[styles.segBtn, installmentCount === n && styles.segBtnActive]}
              onPress={() => setInstallmentCount(n)}
            >
              <Text style={[styles.segText, installmentCount === n && styles.segTextActive]}>{n}×</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.scoreLine}>
          Votre score : <Text style={{ fontWeight: "800" }}>{score}</Text> ({scoreToBand(score)})
        </Text>

        {decision.approved ? (
          <View style={styles.schedule}>
            {schedule.map((it, i) => (
              <View key={it.sequence} style={styles.schedRow}>
                <Text style={styles.muted}>
                  {i === 0 ? "Dû aujourd'hui" : `Échéance ${it.sequence} · ${it.dueDate}`}
                </Text>
                <Text style={styles.schedAmount}>{formatCents(it.amountCents)}</Text>
              </View>
            ))}
            <Text style={styles.noFees}>✓ Aucun frais. Le total reste identique.</Text>
          </View>
        ) : (
          <Text style={styles.declined}>⚠ Financement non disponible pour ce montant.</Text>
        )}

        {error && <Text style={styles.declined}>⚠ {error}</Text>}

        {confirmedRef ? (
          <Text style={styles.confirmed}>Réservation confirmée ✓ (#{confirmedRef.slice(0, 8)})</Text>
        ) : (
          <Pressable
            style={[styles.btn, (busy || !decision.approved) && styles.btnDisabled]}
            onPress={onConfirm}
            disabled={busy || !decision.approved}
          >
            <Text style={styles.btnText}>
              {!session ? "Se connecter pour réserver" : busy ? "…" : "Confirmer la réservation"}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  h1: { fontSize: 24, fontWeight: "800", color: colors.ink, marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 18 },
  muted: { color: colors.muted },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  total: { fontSize: 18, fontWeight: "800", color: colors.ink },
  label: { color: colors.muted, fontSize: 13, marginTop: 16, marginBottom: 6 },
  seg: { flexDirection: "row", gap: 8 },
  segBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  segBtnActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  segText: { fontWeight: "700", color: colors.text },
  segTextActive: { color: "#fff" },
  scoreLine: { marginTop: 16, color: colors.text },
  schedule: { marginTop: 14, backgroundColor: colors.paper, borderRadius: 12, padding: 14 },
  schedRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  schedAmount: { fontWeight: "700", color: colors.ink },
  noFees: { color: colors.trust, fontWeight: "600", marginTop: 8, fontSize: 13 },
  declined: { color: colors.danger, fontWeight: "600", marginTop: 12 },
  confirmed: {
    marginTop: 16,
    backgroundColor: "rgba(30,142,90,0.1)",
    color: colors.trust,
    fontWeight: "700",
    textAlign: "center",
    padding: 12,
    borderRadius: 10,
    overflow: "hidden",
  },
  btn: { backgroundColor: colors.blueBright, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 18 },
  btnDisabled: { backgroundColor: colors.line },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
