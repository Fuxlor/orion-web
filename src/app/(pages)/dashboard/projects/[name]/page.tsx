import { MOCK_PROJECTS } from "@/lib/projects";
import { notFound } from "next/navigation";

export default async function ProjectDashboardPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const project = MOCK_PROJECTS.find((p) => p.name === name);
  if (!project) {
    notFound();
  }
  return <div>Project Dashboard</div>;
}
