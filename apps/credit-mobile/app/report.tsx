import { creditReportLinesOptions } from "@sensei/api-client";
import { colors } from "@sensei/ui";
import { formatCents } from "@sensei/utils";
import { useQuery } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../src/auth";
import { supabase } from "../src/supabase";

const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  current: { label: "À jour", bg: "#e3f3ea", fg: colors.trust },
  late: { label: "En retard", bg: "#fbeede", fg: colors.warn },
  disputed: { label: "Contesté", bg: "#f7e2e0", fg: colors.danger },
  closed: { label: "Clôturé", bg: "#eef1f5", fg: colors.muted },
};

interface ReportLine {
  id: string;
  category: string;
  description: string;
  amount_cents: number;
  status: string;
  created_at: string;
}

export default function Report() {
  const { session, appUser, loading } = useAuth();
  const userId = appUser?.appUserId ?? "";
  const { data } = useQuery({ ...creditReportLinesOptions(supabase, userId), enabled: !!userId });

  if (loading) return <Centered><ActivityIndicator /></Centered>;
  if (!session) return <Redirect href="/login" />;

  const lines = (data ?? []) as unknown as ReportLine[];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
      <Stack.Screen options={{ headerTitle: "Mon rapport" }} />
      <Text style={styles.h1}>Mon rapport de crédit</Text>
      <Text style={styles.muted}>Le détail de vos engagements déclarés.</Text>

      {lines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.muted}>Aucune ligne pour l'instant. Vos financements apparaîtront ici.</Text>
        </View>
      ) : (
        lines.map((line) => {
          const s = STATUS[line.status] ?? STATUS.closed;
          return (
            <View key={line.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cat}>{line.description || line.category}</Text>
                <Text style={styles.muted}>{new Date(line.created_at).toLocaleDateString()}</Text>
              </View>
              <View style={styles.end}>
                <Text style={styles.amount}>{formatCents(line.amount_cents)}</Text>
                <View style={[styles.chip, { backgroundColor: s.bg }]}>
                  <Text style={[styles.chipText, { color: s.fg }]}>{s.label}</Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper },
  h1: { fontSize: 24, fontWeight: "800", color: colors.ink, marginBottom: 4 },
  muted: { color: colors.muted },
  empty: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    marginTop: 16,
    alignItems: "center",
  },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cat: { fontWeight: "600", color: colors.ink },
  end: { alignItems: "flex-end", gap: 6 },
  amount: { fontWeight: "700", color: colors.ink },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  chipText: { fontWeight: "700", fontSize: 12 },
});
