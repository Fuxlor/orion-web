import { Metadata } from "next";
import { DashboardOrStandalone } from "@/components/dashboard/index";
import { LogsProvider } from "@/contexts/logsContext";
import { ProjectsProvider } from "@/contexts/projectsContext";
import { ErrorProvider } from "@/contexts/errorContext";
import { ProjectProvider } from "@/contexts/projectContext";
import { Toaster } from "@/components/ui/sonner";

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
            <Toaster />
          </LogsProvider>
        </ProjectProvider>
      </ProjectsProvider>
    </ErrorProvider>
  );
}
