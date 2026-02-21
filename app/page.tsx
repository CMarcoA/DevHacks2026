"use client";

import { CapturePopupPhase1 } from "@/components/capturePage/capturePopupPhase1";
import { CapturePopupPhase2 } from "@/components/capturePage/capturePopupPhase2";
import { CapturePopupPhase3 } from "@/components/capturePage/capturePopupPhase3";
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

export default function Home() {
  const router = useRouter();
  const [projectList, setProjectList] = useState<Project[]>(() => loadProjectsFromStorage());
  const [newProjectPopupOpen, setNewProjectPopupOpen] = useState(false);
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [capturePhase, setCapturePhase] = useState<1 | 2 | 3>(1);
  const [selectedCaptureProjectId, setSelectedCaptureProjectId] = useState("");
  const [captureCheckpointName, setCaptureCheckpointName] = useState("");
  const [captureAudioBlob, setCaptureAudioBlob] = useState<Blob | null>(null);
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

  const openCapturePopup = () => {
    setCapturePhase(1);
    setCaptureModalOpen(true);
    setCaptureAudioBlob(null);
    setCaptureCreatedTarget(null);
  };

  const closeCapturePopup = () => {
    setCaptureModalOpen(false);
    setCapturePhase(1);
    setCaptureAudioBlob(null);
    setCapturedCheckpointName("");
    setCaptureCreatedTarget(null);
  };

  const finalizeCaptureAudio = async (audioBlobOverride?: Blob) => {
    const blobToSave = audioBlobOverride ?? captureAudioBlob;
    if (!blobToSave) return;

    setCapturePhase(3);

    const extension = blobToSave.type.includes("mp3") ? "mp3" : "webm";
    const audioFile = new File(
      [blobToSave],
      `capture-${new Date().toISOString().replace(/[:.]/g, "-")}.${extension}`,
      { type: blobToSave.type || "audio/webm" }
    );

    try {
      const formData = new FormData();
      formData.append("file", audioFile);

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

      await response.json();
      setCapturedCheckpointName(captureCheckpointName.trim());
    } catch (error) {
      console.error("Could not save captured audio:", error);
      alert("Audio was captured but could not be saved into audioFiles.");
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
              tasksByMember: Object.fromEntries(
                project.members.map((member) => [
                  member.id,
                  [
                    {
                      id: `task-${Math.random().toString(36).slice(2, 10)}`,
                      text: `Initial task for ${member.name}`,
                      dueDate: null,
                      completed: false,
                    },
                  ],
                ])
              ),
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
          />
        </div>
      </main>

      <NewProjectPopup
        open={newProjectPopupOpen}
        onClose={() => setNewProjectPopupOpen(false)}
        onCreateProject={handleCreateProject}
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
        canGoToEdit={Boolean(selectedCaptureProjectId)}
      />
    </div>
  );
}
