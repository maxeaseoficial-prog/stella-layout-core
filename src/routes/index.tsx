import { createFileRoute } from "@tanstack/react-router";
import { MatrizDashboard } from "@/features/dashboard/MatrizDashboard";

export const Route = createFileRoute("/")({
  component: MatrizDashboard,
});
