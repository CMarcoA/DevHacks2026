import { EditCheckpointPage } from "@/components/editPage/editCheckpointPage";
import { initialProjectList } from "@/projectData/homeProjectData";
import type { Checkpoint } from "@/types/projectTypes";
import Link from "next/link";

type EditPageProps = {
  params: Promise<{ projectId: string; checkpointId: string }>;
  searchParams: Promise<{ checkpointName?: string }>;
};

export default async function EditPage({ params, searchParams }: EditPageProps) {
  const { projectId, checkpointId } = await params;
  const { checkpointName } = await searchParams;

  const project = initialProjectList.find((candidate) => candidate.id === projectId);
  const checkpoint = project?.checkpoints.find((candidate) => candidate.id === checkpointId);

  const draftCheckpoint: Checkpoint | null =
    project && checkpointId === "draft"
      ? {
          id: "draft",
          name: checkpointName?.trim() || "New Checkpoint",
          createdAt: new Date().toISOString().slice(0, 10),
          tasksByMember: Object.fromEntries(project.members.map((member) => [member.id, []])),
        }
      : null;

  const resolvedCheckpoint = checkpoint ?? draftCheckpoint;

  if (!project || !resolvedCheckpoint) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f6f8] p-4">
        <div className="rounded-xl bg-white p-6 text-center">
          <h1 className="m-0 text-2xl">Edit page not found</h1>
          <p className="mt-2 text-slate-600">
            The selected project or checkpoint could not be loaded.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block rounded bg-[#127ea9] px-4 py-2 font-semibold text-white no-underline"
          >
            Back to Project List
          </Link>
        </div>
      </div>
    );
  }

  return <EditCheckpointPage project={project} checkpoint={resolvedCheckpoint} />;
}
