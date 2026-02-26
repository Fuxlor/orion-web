import { Metadata } from "next";
import DashboardOrStandalone from "@/components/dashboardOrStandalone";
import { LogsProvider } from "@/contexts/logsContext";
import { ProjectsProvider } from "@/contexts/projectsContext";
import { ErrorProvider } from "@/contexts/errorContext";

export const metadata: Metadata = {
  title: "Orion - Dashboard",
  description: "Manage your logs",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorProvider>
      <LogsProvider>
        <ProjectsProvider>
          <DashboardOrStandalone>{children}</DashboardOrStandalone>
        </ProjectsProvider>
      </LogsProvider>
    </ErrorProvider>
  );
}
