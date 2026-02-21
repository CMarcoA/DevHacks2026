"use client";

import { CapturePopupPhase1 } from "@/components/capturePage/capturePopupPhase1";
import { CapturePopupPhase2 } from "@/components/capturePage/capturePopupPhase2";
import { CapturePopupPhase3 } from "@/components/capturePage/capturePopupPhase3";
import { DeleteCheckpointPopup } from "@/components/homePage/deleteCheckpointPopup";
import { DeleteProjectPopup } from "@/components/homePage/deleteProjectPopup";
import { NewProjectPopup } from "@/components/homePage/newProjectPopup";
import { ProjectCheckpointExplorer } from "@/components/homePage/projectCheckpointExplorer";
import { AppSidebar } from "@/components/ui/appSidebar";
import {
  getTeammatesFromProjects,
  PROJECTS_STORAGE_KEY,
  loadProjectsFromStorage,
  saveProjectsToStorage,
} from "@/projectData/projectPersistence";
import type { Member, NewProjectInput, Project } from "@/types/projectTypes";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type AiCheckpoint = {
  assignedTo?: string;
  todos?: unknown[];
};

type CaptureAiPayload = {
  checkpoints?: AiCheckpoint[];
} | null;

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

export default function Home() {
  const router = useRouter();
  const [projectList, setProjectList] = useState<Project[]>(() => loadProjectsFromStorage());
  const [newProjectPopupOpen, setNewProjectPopupOpen] = useState(false);
  const [deleteProjectPopupOpen, setDeleteProjectPopupOpen] = useState(false);
  const [checkpointDeleteTarget, setCheckpointDeleteTarget] = useState<{
    projectId: string;
    checkpointId: string;
  } | null>(null);
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [capturePhase, setCapturePhase] = useState<1 | 2 | 3>(1);
  const [selectedCaptureProjectId, setSelectedCaptureProjectId] = useState("");
  const [captureCheckpointName, setCaptureCheckpointName] = useState("");
  const [captureAudioBlob, setCaptureAudioBlob] = useState<Blob | null>(null);
  const [captureAiData, setCaptureAiData] = useState<CaptureAiPayload>(null);
  const [captureOutputFile, setCaptureOutputFile] = useState<string | null>(null);
  const [isCaptureProcessing, setIsCaptureProcessing] = useState(false);
  const [capturedCheckpointName, setCapturedCheckpointName] = useState("");
  const [captureCreatedTarget, setCaptureCreatedTarget] = useState<{
    projectId: string;
    checkpointId: string;
    checkpointName: string;
  } | null>(null);
  const teammateList = useMemo<Member[]>(() => getTeammatesFromProjects(projectList), [projectList]);

  useEffect(() => {
    setProjectList(loadProjectsFromStorage());
  }, []);

  useEffect(() => {
    saveProjectsToStorage(projectList);
  }, [projectList]);

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key === PROJECTS_STORAGE_KEY) {
        setProjectList(loadProjectsFromStorage());
      }
    };
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  const buildId = (prefix: string): string =>
    `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

  const handleCreateProject = (payload: NewProjectInput) => {
    const members: Member[] = payload.members.map((member) => ({
      id: buildId("member"),
      name: member.name,
      position: member.position,
    }));

    const project: Project = {
      id: buildId("project"),
      name: payload.name,
      members,
      checkpoints: [],
    };

    setProjectList((prev) => [project, ...prev]);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjectList((prev) => prev.filter((project) => project.id !== projectId));
    if (selectedCaptureProjectId === projectId) {
      setSelectedCaptureProjectId("");
    }
  };

  const handleDeleteCheckpoint = (projectId: string, checkpointId: string) => {
    setCheckpointDeleteTarget({ projectId, checkpointId });
  };

  const confirmDeleteCheckpoint = () => {
    if (!checkpointDeleteTarget) return;
    setProjectList((prev) =>
      prev.map((project) => {
        if (project.id !== checkpointDeleteTarget.projectId) return project;
        return {
          ...project,
          checkpoints: project.checkpoints.filter(
            (checkpoint) => checkpoint.id !== checkpointDeleteTarget.checkpointId
          ),
        };
      })
    );
    setCheckpointDeleteTarget(null);
  };

  const openCapturePopup = () => {
    setCapturePhase(1);
    setCaptureModalOpen(true);
    setCaptureAudioBlob(null);
    setCaptureAiData(null);
    setCaptureOutputFile(null);
    setIsCaptureProcessing(false);
    setCaptureCreatedTarget(null);
  };

  const closeCapturePopup = () => {
    setCaptureModalOpen(false);
    setCapturePhase(1);
    setCaptureAudioBlob(null);
    setCaptureAiData(null);
    setCaptureOutputFile(null);
    setIsCaptureProcessing(false);
    setCapturedCheckpointName("");
    setCaptureCreatedTarget(null);
  };

  const finalizeCaptureAudio = async (audioBlobOverride?: Blob) => {
    const blobToSave = audioBlobOverride ?? captureAudioBlob;
    if (!blobToSave) return;

    setCapturePhase(3);
    setIsCaptureProcessing(true);

    const extension = blobToSave.type.includes("mp3") ? "mp3" : "webm";
    const audioFile = new File(
      [blobToSave],
      `capture-${new Date().toISOString().replace(/[:.]/g, "-")}.${extension}`,
      { type: blobToSave.type || "audio/webm" }
    );

    try {
      const formData = new FormData();
      const selectedProject = projectList.find((project) => project.id === selectedCaptureProjectId);
      const captureContext = selectedProject
        ? {
            projectId: selectedProject.id,
            projectName: selectedProject.name,
            teammates: selectedProject.members.map((member) => ({
              name: member.name,
              position: member.position,
            })),
          }
        : null;
      formData.append("file", audioFile);
      if (captureContext) {
        formData.append("context", JSON.stringify(captureContext));
      }

      const response = await fetch("/api/save-captured-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload && typeof payload.error === "string"
            ? payload.error
            : `Failed to save audio (${response.status})`;
        throw new Error(message);
      }

      const payload = await response.json();
      setCapturedCheckpointName(captureCheckpointName.trim());
      setCaptureAiData(payload?.aiData ?? null);
      setCaptureOutputFile(typeof payload?.outputFile === "string" ? payload.outputFile : null);
    } catch (error) {
      console.error("Could not save captured audio:", error);
      alert("Audio was captured but could not be saved into audioFiles.");
    } finally {
      setIsCaptureProcessing(false);
    }
  };

  const createCheckpointFromCapture = () => {
    if (captureCreatedTarget) {
      return captureCreatedTarget;
    }

    if (!selectedCaptureProjectId) return null;

    const project = projectList.find((item) => item.id === selectedCaptureProjectId);
    if (!project) return null;

    const targetName = (capturedCheckpointName || captureCheckpointName).trim();
    if (!targetName) return null;
    const checkpointId = `checkpoint-${Math.random().toString(36).slice(2, 10)}`;

    const aiCheckpoints = Array.isArray(captureAiData?.checkpoints) ? captureAiData.checkpoints : [];
    const tasksByMember = Object.fromEntries(
      project.members.map((member) => {
        const aiMatch = aiCheckpoints.find(
          (item) =>
            typeof item?.assignedTo === "string" &&
            namesLikelyMatch(member.name, item.assignedTo)
        );
        const todos = Array.isArray(aiMatch?.todos)
          ? aiMatch.todos.filter((todo: unknown) => typeof todo === "string")
          : [];
        const tasks = todos.map((text: string) => ({
          id: `task-${Math.random().toString(36).slice(2, 10)}`,
          text,
          dueDate: null,
          completed: false,
        }));
        return [member.id, tasks];
      })
    );

    setProjectList((prev) =>
      prev.map((project) => {
        if (project.id !== selectedCaptureProjectId) return project;
        return {
          ...project,
          checkpoints: [
            {
              id: checkpointId,
              name: targetName,
              createdAt: new Date().toISOString().slice(0, 10),
              tasksByMember,
              outputFile: captureOutputFile,
            },
            ...project.checkpoints,
          ],
        };
      })
    );

    const target = { projectId: project.id, checkpointId, checkpointName: targetName };
    setCaptureCreatedTarget(target);
    return target;
  };

  const openEditFromCapture = () => {
    const createdCheckpoint = createCheckpointFromCapture();
    if (!createdCheckpoint) return;

    closeCapturePopup();
    router.push(`/edit/${createdCheckpoint.projectId}/${createdCheckpoint.checkpointId}`);
  };

  return (
    <div className="flex min-h-screen bg-[#f4f6f8] text-slate-900">
      <AppSidebar
        onNewProject={() => setNewProjectPopupOpen(true)}
        onDeleteProject={() => setDeleteProjectPopupOpen(true)}
        onCapture={openCapturePopup}
        teammateCount={teammateList.length}
      />

      <main className="w-full px-16 py-10">
        <div className="mb-6 flex items-center justify-end">
          <p className="text-sm text-slate-600">Claudius Marco Andrew</p>
        </div>

        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-5xl font-medium text-slate-900">Project List</h1>

          <ProjectCheckpointExplorer
            projects={projectList}
            onOpenCheckpointEdit={(projectId, checkpointId) =>
              router.push(`/edit/${projectId}/${checkpointId}`)
            }
            onDeleteCheckpoint={handleDeleteCheckpoint}
          />
        </div>
      </main>

      <NewProjectPopup
        open={newProjectPopupOpen}
        onClose={() => setNewProjectPopupOpen(false)}
        onCreateProject={handleCreateProject}
      />
      <DeleteProjectPopup
        open={deleteProjectPopupOpen}
        onClose={() => setDeleteProjectPopupOpen(false)}
        projects={projectList}
        onDeleteProject={handleDeleteProject}
      />
      <DeleteCheckpointPopup
        open={Boolean(checkpointDeleteTarget)}
        onClose={() => setCheckpointDeleteTarget(null)}
        onConfirm={confirmDeleteCheckpoint}
      />
      <CapturePopupPhase1
        open={captureModalOpen && capturePhase === 1}
        onClose={closeCapturePopup}
        onNext={() => setCapturePhase(2)}
        projectList={projectList}
        selectedProjectId={selectedCaptureProjectId}
        checkpointName={captureCheckpointName}
        onSelectedProjectChange={setSelectedCaptureProjectId}
        onCheckpointNameChange={setCaptureCheckpointName}
      />
      <CapturePopupPhase2
        open={captureModalOpen && capturePhase === 2}
        onBack={() => setCapturePhase(1)}
        onClose={closeCapturePopup}
        onAudioCaptured={(audioBlob) => {
          setCaptureAudioBlob(audioBlob);
          void finalizeCaptureAudio(audioBlob);
        }}
        onRecordingCompleted={() => {
          setCapturePhase(3);
        }}
      />
      <CapturePopupPhase3
        open={captureModalOpen && capturePhase === 3}
        onClose={closeCapturePopup}
        onGoToEdit={openEditFromCapture}
        canGoToEdit={Boolean(selectedCaptureProjectId) && !isCaptureProcessing}
      />
    </div>
  );
}
