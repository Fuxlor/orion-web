import { MOCK_PROJECTS } from "@/lib/projects";

// Placeholder – log sources would come from API per project
const MOCK_SOURCES = [
  { id: "1", name: "Production", type: "Application" },
  { id: "2", name: "Staging", type: "Application" },
  { id: "3", name: "Development", type: "Application" },
];

export default async function LogSourcesPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const project = MOCK_PROJECTS.find((p) => p.name === name);
  return (
    <div>
      Log sources of the project {project?.label}
    </div>
  );
}
