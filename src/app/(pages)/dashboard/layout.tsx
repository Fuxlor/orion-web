import { Metadata } from "next";
import DashboardShell from "@/components/dashboard-shell";

export const metadata: Metadata = {
  title: "Orion - Dashboard",
  description: "Manage your logs",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
