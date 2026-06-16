import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "./-search";

export const Route = createFileRoute("/")({
  component: SearchPage,
});
