
import { MOCK_PROJECTS, MOCK_LOG_SOURCES } from "@/lib/projects";

export default async function SourceLogsPage({
  params,
}: {
  params: Promise<{ name: string; sourceName: string }>;
}) {
  const { name, sourceName } = await params;
  const project = MOCK_PROJECTS.find((p) => p.name === name);
  const source = MOCK_LOG_SOURCES.find((s) => s.name === sourceName);
  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-2">
        Logs — {project?.label} / {source?.label ?? sourceName}
      </h1>
      <p className="text-[var(--text-secondary)]">
        Logs from the {source?.label ?? sourceName} source.
      </p>
    </div>
  );
}
