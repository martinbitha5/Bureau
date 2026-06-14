import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { RootLayout } from "./components/Layout";
import { ActivationPage } from "./routes/activation";
import { ApprendrePage } from "./routes/apprendre";
import { ConsentPage } from "./routes/consent";
import { EntreprisePage } from "./routes/entreprise";
import { FaqPage } from "./routes/faq";
import { HomePage } from "./routes/home";
import { LoginPage } from "./routes/login";
import { ProduitsPage } from "./routes/produits";
import { ReportPage } from "./routes/report";
import { ServicesPage } from "./routes/services";

const rootRoute = createRootRoute({ component: RootLayout });

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const entrepriseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/entreprise",
  component: EntreprisePage,
});

const produitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/produits",
  component: ProduitsPage,
});

const apprendreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apprendre",
  component: ApprendrePage,
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/services",
  component: ServicesPage,
});

const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faq",
  component: FaqPage,
});

const activationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/activation",
  component: ActivationPage,
});

const reportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/report",
  component: ReportPage,
});

const consentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/consent",
  component: ConsentPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  entrepriseRoute,
  produitsRoute,
  apprendreRoute,
  servicesRoute,
  faqRoute,
  activationRoute,
  reportRoute,
  consentRoute,
  loginRoute,
]);

export const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
