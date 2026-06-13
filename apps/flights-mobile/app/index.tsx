import { colors } from "@sensei/ui";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

type Cabin = "economy" | "premium" | "business";
const CABINS: { key: Cabin; label: string }[] = [
  { key: "economy", label: "Éco" },
  { key: "premium", label: "Premium" },
  { key: "business", label: "Affaires" },
];

export default function Search() {
  const router = useRouter();
  const [origin, setOrigin] = useState("FIH");
  const [destination, setDestination] = useState("JNB");
  const [departDate, setDepartDate] = useState("2026-08-15");
  const [passengers, setPassengers] = useState("1");
  const [cabin, setCabin] = useState<Cabin>("economy");

  function onSearch() {
    router.push({
      pathname: "/results",
      params: { origin, destination, departDate, passengers, cabin },
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.h1}>Où allez-vous ?</Text>
      <Text style={styles.sub}>Réservez votre vol et payez en plusieurs fois, sans frais cachés.</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Field label="Départ" value={origin} onChange={(v) => setOrigin(v.toUpperCase())} />
          <Field label="Arrivée" value={destination} onChange={(v) => setDestination(v.toUpperCase())} />
        </View>
        <Field label="Date de départ" value={departDate} onChange={setDepartDate} />
        <Field label="Voyageurs" value={passengers} onChange={setPassengers} keyboardNumeric />

        <Text style={styles.label}>Classe</Text>
        <View style={styles.seg}>
          {CABINS.map((c) => (
            <Pressable
              key={c.key}
              style={[styles.segBtn, cabin === c.key && styles.segBtnActive]}
              onPress={() => setCabin(c.key)}
            >
              <Text style={[styles.segText, cabin === c.key && styles.segTextActive]}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.btn} onPress={onSearch}>
          <Text style={styles.btnText}>Rechercher des vols</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboardNumeric,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardNumeric?: boolean;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        autoCapitalize="characters"
        keyboardType={keyboardNumeric ? "number-pad" : "default"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  h1: { fontSize: 28, fontWeight: "800", color: colors.ink },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 20 },
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 18 },
  row: { flexDirection: "row", gap: 12 },
  label: { color: colors.muted, fontSize: 13, marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
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
  btn: { backgroundColor: colors.blueBright, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 20 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
