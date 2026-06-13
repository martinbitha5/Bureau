import { colors } from "@sensei/ui";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../src/auth";

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) setError(error);
    else router.replace("/");
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Se connecter</Text>
      <Text style={styles.sub}>Un seul compte pour tout l'écosystème Sensei.</Text>

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Mot de passe</Text>
      <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

      {error && <Text style={styles.error}>⚠ {error}</Text>}

      <Pressable style={styles.btn} onPress={onSubmit} disabled={busy}>
        <Text style={styles.btnText}>{busy ? "…" : "Se connecter"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, backgroundColor: colors.paper, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "800", color: colors.ink },
  sub: { color: colors.muted, marginBottom: 20 },
  label: { color: colors.muted, fontSize: 13, marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  error: { color: colors.danger, marginTop: 12, fontWeight: "600" },
  btn: {
    backgroundColor: colors.blueBright,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 22,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
