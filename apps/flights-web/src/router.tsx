import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { RootLayout } from "./components/Layout";
import type { DetailsSearch } from "./routes/details";
import { DetailsPage } from "./routes/details";
import { CustomisePage } from "./routes/customise";
import { ManagePage } from "./routes/manage";
import { ProtectPage } from "./routes/protect";
import { ResultsPage, type ResultsSearch } from "./routes/results";
import { SearchPage } from "./routes/search";
import { SummaryPage } from "./routes/summary";

const rootRoute = createRootRoute({ component: RootLayout });

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SearchPage,
});

const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/results",
  component: ResultsPage,
  validateSearch: (s: Record<string, unknown>): ResultsSearch => ({
    origin: String(s.origin ?? "FIH"),
    destination: String(s.destination ?? "JNB"),
    departDate: String(s.departDate ?? ""),
    returnDate: String(s.returnDate ?? ""),
    tripType: s.tripType === "round" ? "round" : "oneway",
    passengers: Number(s.passengers ?? 1),
    cabin: (["economy", "premium", "business"].includes(String(s.cabin))
      ? String(s.cabin)
      : "economy") as ResultsSearch["cabin"],
  }),
});

/** Paramètres de vol partagés par /details → /customise → /protect → /summary. */
function validateFlightSearch(s: Record<string, unknown>): DetailsSearch {
  return {
    origin: String(s.origin ?? ""),
    destination: String(s.destination ?? ""),
    departDate: String(s.departDate ?? ""),
    returnDate: String(s.returnDate ?? ""),
    tripType: s.tripType === "round" ? "round" : "oneway",
    passengers: Number(s.passengers ?? 1),
    cabin: (["economy", "premium", "business"].includes(String(s.cabin))
      ? String(s.cabin)
      : "economy") as DetailsSearch["cabin"],
    carrier: String(s.carrier ?? ""),
    flightNumber: String(s.flightNumber ?? ""),
    providerOfferId: String(s.providerOfferId ?? ""),
    totalCents: Number(s.totalCents ?? 0),
    departTime: String(s.departTime ?? ""),
    arriveTime: String(s.arriveTime ?? ""),
  };
}

const detailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/details",
  component: DetailsPage,
  validateSearch: validateFlightSearch,
});

const customiseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customise",
  component: CustomisePage,
  validateSearch: validateFlightSearch,
});

const protectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/protect",
  component: ProtectPage,
  validateSearch: validateFlightSearch,
});

const summaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/summary",
  component: SummaryPage,
  validateSearch: validateFlightSearch,
});

const manageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manage",
  component: ManagePage,
});

const routeTree = rootRoute.addChildren([
  searchRoute,
  resultsRoute,
  detailsRoute,
  customiseRoute,
  protectRoute,
  summaryRoute,
  manageRoute,
]);

export const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
