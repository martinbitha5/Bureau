import { creditProfileOptions, creditScoreEventsOptions } from "@sensei/api-client";
import { colors } from "@sensei/ui";
import { useQuery } from "@tanstack/react-query";
import { Link, Redirect } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../src/auth";
import { supabase } from "../src/supabase";

const SCORE_MIN = 300;
const SCORE_MAX = 850;
const REASONS: Record<string, string> = {
  on_time_payment: "Paiement à l'heure",
  late_payment: "Paiement en retard",
  bnpl_completed: "Financement soldé",
  bnpl_default: "Défaut de paiement",
  new_inquiry: "Nouvelle consultation",
};
const BANDS: Record<string, string> = {
  poor: "Faible",
  fair: "Correct",
  good: "Bon",
  very_good: "Très bon",
  excellent: "Excellent",
};
const BAND_COLORS: Record<string, string> = {
  poor: colors.danger,
  fair: colors.warn,
  good: colors.trust,
  very_good: colors.blueBright,
  excellent: colors.blue,
};
const FACTORS = [
  { name: "Régularité des paiements", weight: "35%", body: "Le facteur le plus important. Payer à l'heure fait progresser votre score." },
  { name: "Engagements en cours", weight: "30%", body: "Un endettement maîtrisé rassure les prêteurs." },
  { name: "Ancienneté", weight: "15%", body: "Plus votre historique est long et régulier, plus votre score est solide." },
];

export default function Score() {
  const { session, appUser, loading } = useAuth();
  const userId = appUser?.appUserId ?? "";
  const { data: profile } = useQuery({ ...creditProfileOptions(supabase, userId), enabled: !!userId });
  const { data: events } = useQuery({ ...creditScoreEventsOptions(supabase, userId), enabled: !!userId });

  if (loading) return <Centered><ActivityIndicator /></Centered>;
  if (!session) return <Redirect href="/login" />;
  if (!profile) return <Centered><ActivityIndicator /></Centered>;

  const score = profile.current_score as number;
  const band = profile.score_band as string;
  const pct = ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;
  const bandColor = BAND_COLORS[band] ?? colors.warn;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.h1}>Mon score Sensei</Text>

      <View style={styles.card}>
        <Text style={[styles.score, { color: bandColor }]}>{score}</Text>
        <View style={[styles.chip, { backgroundColor: bandColor }]}>
          <Text style={styles.chipText}>{BANDS[band] ?? band}</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%`, backgroundColor: bandColor }]} />
          <View style={[styles.marker, { left: `${pct}%` }]} />
        </View>
        <View style={styles.scale}>
          <Text style={styles.scaleText}>{SCORE_MIN}</Text>
          <Text style={styles.scaleText}>{SCORE_MAX}</Text>
        </View>
        <Link href="/report" asChild>
          <Pressable>
            <Text style={styles.link}>Voir le détail de mon rapport →</Text>
          </Pressable>
        </Link>
      </View>

      <Text style={styles.h2}>Ce qui fait bouger votre score</Text>
      {FACTORS.map((f) => (
        <View key={f.name} style={styles.factor}>
          <View style={styles.factorHead}>
            <Text style={styles.factorName}>{f.name}</Text>
            <Text style={styles.factorWeight}>{f.weight}</Text>
          </View>
          <Text style={styles.muted}>{f.body}</Text>
        </View>
      ))}

      <Text style={styles.h2}>Historique</Text>
      {(!events || events.length === 0) && (
        <Text style={styles.muted}>Aucun événement. Vos remboursements feront évoluer votre score.</Text>
      )}
      {events?.map((e) => {
        const delta = (e.new_score as number) - (e.previous_score as number);
        return (
          <View key={e.id as string} style={styles.event}>
            <View>
              <Text style={styles.eventReason}>{REASONS[e.reason_code as string] ?? String(e.reason_code)}</Text>
              <Text style={styles.muted}>{new Date(e.created_at as string).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.delta, { color: delta >= 0 ? colors.trust : colors.danger }]}>
              {delta >= 0 ? `+${delta}` : delta}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper },
  h1: { fontSize: 24, fontWeight: "800", color: colors.ink, marginBottom: 16 },
  h2: { fontSize: 17, fontWeight: "700", color: colors.ink, marginTop: 24, marginBottom: 10 },
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 22 },
  score: { fontSize: 52, fontWeight: "800", color: colors.ink },
  chip: {
    alignSelf: "flex-start",
    backgroundColor: colors.warn,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  chipText: { color: "#fff", fontWeight: "700" },
  track: { height: 10, borderRadius: 999, backgroundColor: colors.line, marginTop: 18, justifyContent: "center" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999 },
  marker: {
    position: "absolute",
    top: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: colors.ink,
    marginLeft: -9,
  },
  scale: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  scaleText: { color: colors.muted, fontSize: 12 },
  link: { color: colors.blue, fontWeight: "700", marginTop: 18 },
  muted: { color: colors.muted },
  factor: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 10,
  },
  factorHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  factorName: { fontWeight: "600", color: colors.ink },
  factorWeight: { fontWeight: "800", color: colors.blueBright },
  event: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventReason: { fontWeight: "600", color: colors.ink },
  delta: { fontWeight: "800", fontSize: 16 },
});
