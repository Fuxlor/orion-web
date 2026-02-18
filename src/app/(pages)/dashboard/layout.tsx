import { Metadata } from "next";
import DashboardShell from "@/components/dashboardShell";
import { LogsProvider } from "@/contexts/logsContext";

export const metadata: Metadata = {
  title: "Orion - Dashboard",
  description: "Manage your logs",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LogsProvider><DashboardShell>{children}</DashboardShell></LogsProvider>;
}
