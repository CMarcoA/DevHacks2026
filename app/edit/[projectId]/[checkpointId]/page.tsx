"use client";

import { EditCheckpointPage } from "@/components/editPage/editCheckpointPage";
import {
  PROJECTS_STORAGE_KEY,
  loadProjectsFromStorage,
  saveProjectsToStorage,
} from "@/projectData/projectPersistence";
import type { Checkpoint, Project, Task } from "@/types/projectTypes";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function EditPage() {
  const params = useParams<{ projectId: string; checkpointId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>(() => loadProjectsFromStorage());

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key === PROJECTS_STORAGE_KEY) {
        setProjects(loadProjectsFromStorage());
      }
    };
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  const projectId = params?.projectId ?? "";
  const checkpointId = params?.checkpointId ?? "";
  const project = projects.find((candidate) => candidate.id === projectId);
  const checkpoint = project?.checkpoints.find((candidate) => candidate.id === checkpointId);

  const draftCheckpoint = useMemo<Checkpoint | null>(() => {
    if (!project || checkpointId !== "draft") return null;
    return {
      id: "draft",
      name: searchParams.get("checkpointName")?.trim() || "New Checkpoint",
      createdAt: new Date().toISOString().slice(0, 10),
      tasksByMember: Object.fromEntries(project.members.map((member) => [member.id, []])),
    };
  }, [checkpointId, project, searchParams]);

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

  const handleFinishEdit = (tasksByMember: Record<string, Task[]>) => {
    const nextProjects = projects.map((candidateProject) => {
      if (candidateProject.id !== project.id) return candidateProject;

      if (checkpointId === "draft") {
        return {
          ...candidateProject,
          checkpoints: [
            {
              id: `checkpoint-${Math.random().toString(36).slice(2, 10)}`,
              name: resolvedCheckpoint.name,
              createdAt: resolvedCheckpoint.createdAt,
              tasksByMember,
            },
            ...candidateProject.checkpoints,
          ],
        };
      }

      return {
        ...candidateProject,
        checkpoints: candidateProject.checkpoints.map((candidateCheckpoint) =>
          candidateCheckpoint.id === checkpointId
            ? { ...candidateCheckpoint, tasksByMember }
            : candidateCheckpoint
        ),
      };
    });

    setProjects(nextProjects);
    saveProjectsToStorage(nextProjects);
    router.push("/");
  };

  return (
    <EditCheckpointPage
      project={project}
      checkpoint={resolvedCheckpoint}
      onFinishEdit={handleFinishEdit}
    />
  );
}
