import { colors } from "@sensei/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/auth";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.ink },
            headerTintColor: "#fff",
            headerTitle: "Sensei Credit",
          }}
        />
      </QueryClientProvider>
    </AuthProvider>
  );
}
