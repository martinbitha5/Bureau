import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { RootLayout } from "./components/Layout";
import { CheckoutPage, type CheckoutSearch } from "./routes/checkout";
import { LoginPage } from "./routes/login";
import { ResultsPage, type ResultsSearch } from "./routes/results";
import { SearchPage } from "./routes/search";

const rootRoute = createRootRoute({ component: RootLayout });

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SearchPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/results",
  component: ResultsPage,
  validateSearch: (s: Record<string, unknown>): ResultsSearch => ({
    origin: String(s.origin ?? "FIH"),
    destination: String(s.destination ?? "JNB"),
    departDate: String(s.departDate ?? ""),
    passengers: Number(s.passengers ?? 1),
    cabin: (["economy", "premium", "business"].includes(String(s.cabin))
      ? String(s.cabin)
      : "economy") as ResultsSearch["cabin"],
  }),
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
  validateSearch: (s: Record<string, unknown>): CheckoutSearch => ({
    origin: String(s.origin ?? ""),
    destination: String(s.destination ?? ""),
    departDate: String(s.departDate ?? ""),
    passengers: Number(s.passengers ?? 1),
    cabin: (["economy", "premium", "business"].includes(String(s.cabin))
      ? String(s.cabin)
      : "economy") as CheckoutSearch["cabin"],
    carrier: String(s.carrier ?? ""),
    flightNumber: String(s.flightNumber ?? ""),
    providerOfferId: String(s.providerOfferId ?? ""),
    totalCents: Number(s.totalCents ?? 0),
  }),
});

const routeTree = rootRoute.addChildren([searchRoute, loginRoute, resultsRoute, checkoutRoute]);

export const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
