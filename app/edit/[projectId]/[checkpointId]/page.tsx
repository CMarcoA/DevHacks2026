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

type OutputCheckpoint = {
  assignedTo?: string;
  todos?: unknown[];
};

type OutputPayload = {
  projectId?: string | number;
  checkpoints?: OutputCheckpoint[];
};

const normalizeTokens = (value: string): string[] =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const editDistance = (a: string, b: string): number => {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i += 1) dp[i][0] = i;
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
};

const tokensLikelyMatch = (left: string, right: string): boolean => {
  if (left === right) return true;
  if (left.includes(right) || right.includes(left)) return true;
  if (left.length >= 4 && right.length >= 4 && editDistance(left, right) <= 1) return true;
  return false;
};

const namesLikelyMatch = (memberName: string, assignedTo: string): boolean => {
  const memberTokens = normalizeTokens(memberName);
  const assignedTokens = normalizeTokens(assignedTo);
  if (!memberTokens.length || !assignedTokens.length) return false;

  const memberJoined = memberTokens.join(" ");
  const assignedJoined = assignedTokens.join(" ");
  if (memberJoined === assignedJoined) return true;
  if (memberJoined.includes(assignedJoined) || assignedJoined.includes(memberJoined)) return true;

  const matchedMemberTokens = memberTokens.filter((memberToken) =>
    assignedTokens.some((assignedToken) => tokensLikelyMatch(memberToken, assignedToken))
  ).length;
  const matchedAssignedTokens = assignedTokens.filter((assignedToken) =>
    memberTokens.some((memberToken) => tokensLikelyMatch(memberToken, assignedToken))
  ).length;

  if (matchedMemberTokens === 0 || matchedAssignedTokens === 0) return false;

  const memberCoverage = matchedMemberTokens / memberTokens.length;
  const assignedCoverage = matchedAssignedTokens / assignedTokens.length;
  return memberCoverage >= 0.5 || assignedCoverage >= 0.5;
};

export default function EditPage() {
  const params = useParams<{ projectId: string; checkpointId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>(() => loadProjectsFromStorage());
  const [outputData, setOutputData] = useState<OutputPayload | null>(null);
  const [outputTasksByMember, setOutputTasksByMember] = useState<Record<string, Task[]> | null>(null);
  const [loadedOutputFile, setLoadedOutputFile] = useState<string | null>(null);

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

  useEffect(() => {
    const baseCheckpoint = checkpoint ?? draftCheckpoint;
    const outputFile = baseCheckpoint?.outputFile;
    if (!project || !outputFile) {
      return;
    }

    let active = true;
    const loadOutput = async () => {
      try {
        const response = await fetch(`/api/output-json?file=${encodeURIComponent(outputFile)}`);
        if (!response.ok) return;
        const payload = await response.json();
        const data = payload?.data as OutputPayload;
        if (!active || !data) return;
        setLoadedOutputFile(outputFile);
        setOutputData(data);

        const mappedTasks = Object.fromEntries(
          project.members.map((member) => {
            const matched = Array.isArray(data.checkpoints)
              ? data.checkpoints.find(
                  (item) =>
                    typeof item?.assignedTo === "string" &&
                    namesLikelyMatch(member.name, item.assignedTo)
                )
              : null;
            const todos = Array.isArray(matched?.todos)
              ? matched.todos.filter((todo): todo is string => typeof todo === "string")
              : [];
            return [
              member.id,
              todos.map((text) => ({
                id: `task-${Math.random().toString(36).slice(2, 10)}`,
                text,
                dueDate: null,
                completed: false,
              })),
            ];
          })
        );
        setOutputTasksByMember(mappedTasks);
      } catch {
        if (!active) return;
        setLoadedOutputFile(null);
        setOutputData(null);
        setOutputTasksByMember(null);
      }
    };

    void loadOutput();
    return () => {
      active = false;
    };
  }, [checkpoint, draftCheckpoint, project]);

  const resolvedCheckpoint = useMemo<Checkpoint | null>(() => {
    const base = checkpoint ?? draftCheckpoint;
    if (!base) return null;
    if (base.outputFile && loadedOutputFile !== base.outputFile) return base;
    if (!outputTasksByMember) return base;
    return { ...base, tasksByMember: outputTasksByMember };
  }, [checkpoint, draftCheckpoint, loadedOutputFile, outputTasksByMember]);

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
    if (project && resolvedCheckpoint?.outputFile) {
      const outputProjectId = outputData?.projectId ?? project.id;
      const outputPayload: OutputPayload = {
        projectId: outputProjectId,
        checkpoints: project.members.map((member) => ({
          assignedTo: member.name,
          todos: (tasksByMember[member.id] ?? []).map((task) => task.text),
        })),
      };
      void fetch("/api/output-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: resolvedCheckpoint.outputFile,
          data: outputPayload,
        }),
      });
    }
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
