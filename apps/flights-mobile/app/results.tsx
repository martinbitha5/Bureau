import { flightSearchOptions } from "@sensei/api-client";
import { colors } from "@sensei/ui";
import { formatCents } from "@sensei/utils";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Results() {
  const router = useRouter();
  const p = useLocalSearchParams();
  const origin = String(p.origin ?? "FIH");
  const destination = String(p.destination ?? "JNB");
  const departDate = String(p.departDate ?? "");
  const passengers = Number(p.passengers ?? 1);
  const cabin = (["economy", "premium", "business"].includes(String(p.cabin)) ? String(p.cabin) : "economy") as
    | "economy"
    | "premium"
    | "business";

  const { data: offers, isLoading } = useQuery(
    flightSearchOptions({ origin, destination, departDate, passengers, cabin }),
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.h1}>Vols disponibles</Text>
      <Text style={styles.muted}>
        {origin} → {destination} · {passengers} voyageur{passengers > 1 ? "s" : ""}
      </Text>

      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} />}

      {offers?.map((offer) => {
        const seg = offer.segments[0]!;
        return (
          <View key={offer.providerOfferId} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.carrier}>{seg.carrier}</Text>
              <Text style={styles.route}>
                {seg.from} — Direct — {seg.to}
              </Text>
              <Text style={styles.muted}>{seg.flightNumber}</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 8 }}>
              <Text style={styles.price}>{formatCents(offer.totalCents)}</Text>
              <Pressable
                style={styles.btn}
                onPress={() =>
                  router.push({
                    pathname: "/checkout",
                    params: {
                      origin: seg.from,
                      destination: seg.to,
                      departDate,
                      passengers: String(passengers),
                      cabin,
                      carrier: seg.carrier,
                      flightNumber: seg.flightNumber,
                      providerOfferId: offer.providerOfferId,
                      totalCents: String(offer.totalCents),
                    },
                  })
                }
              >
                <Text style={styles.btnText}>Choisir</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  h1: { fontSize: 24, fontWeight: "800", color: colors.ink },
  muted: { color: colors.muted },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  carrier: { fontWeight: "700", color: colors.ink, fontSize: 15 },
  route: { fontSize: 16, fontWeight: "700", color: colors.ink, marginVertical: 4 },
  price: { fontSize: 18, fontWeight: "800", color: colors.ink },
  btn: { backgroundColor: colors.blueBright, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
});
