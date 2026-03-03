import { Metadata } from "next";
import DashboardOrStandalone from "@/components/dashboardOrStandalone";
import { LogsProvider } from "@/contexts/logsContext";
import { ProjectsProvider } from "@/contexts/projectsContext";
import { ErrorProvider } from "@/contexts/errorContext";
import { ProjectProvider } from "@/contexts/projectContext";

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
      <ProjectsProvider>
        <ProjectProvider>
          <LogsProvider>
            <DashboardOrStandalone>{children}</DashboardOrStandalone>
          </LogsProvider>
        </ProjectProvider>
      </ProjectsProvider>
    </ErrorProvider>
  );
}
