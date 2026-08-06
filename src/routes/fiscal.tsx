import { createFileRoute } from "@tanstack/react-router";
import { FiscalLayout } from "@/features/fiscal/FiscalLayout";

export const Route = createFileRoute("/fiscal")({
  component: FiscalLayout,
});
