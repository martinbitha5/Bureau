import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { AudienceProvider } from "./audience";
import { AuthProvider } from "./auth";
import { I18nProvider } from "./i18n";
import { router } from "./router";
import "@sensei/ui/tokens.css";
import "./styles.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <AudienceProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </AuthProvider>
      </AudienceProvider>
    </I18nProvider>
  </React.StrictMode>,
);
