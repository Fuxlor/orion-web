import { MOCK_PROJECTS } from "@/lib/projects";

export default async function ProjectAlertsPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const project = MOCK_PROJECTS.find((p) => p.name === name);
  return (
    <div>
      Alerts of the project {project?.label}
    </div>
  );
}
