"use client";

import { usePathname } from "next/navigation";
import { StandalonePageWrapper, DashboardShell } from "./index";

export default function DashboardOrStandalone({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isNewProject = pathname === "/dashboard/projects/new";

  if (isNewProject) {
    return <StandalonePageWrapper>{children}</StandalonePageWrapper>;
  }
  return <DashboardShell>{children}</DashboardShell>;
}
