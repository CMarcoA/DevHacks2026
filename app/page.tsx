"use client";

import { CapturePopupPhase1 } from "@/components/capturePage/capturePopupPhase1";
import { CapturePopupPhase2 } from "@/components/capturePage/capturePopupPhase2";
import { CapturePopupPhase3 } from "@/components/capturePage/capturePopupPhase3";
import { NewProjectPopup } from "@/components/homePage/newProjectPopup";
import { initialProjectList, initialTeammateList } from "@/projectData/homeProjectData";
import type { Member, NewProjectInput, Project } from "@/types/projectTypes";
import { useState } from "react";

export default function Home() {
  const [projectList, setProjectList] = useState<Project[]>(initialProjectList);
  const [teammateList, setTeammateList] = useState<Member[]>(initialTeammateList);
  const [newProjectPopupOpen, setNewProjectPopupOpen] = useState(false);
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [capturePhase, setCapturePhase] = useState<1 | 2 | 3>(1);
  const [selectedCaptureProjectId, setSelectedCaptureProjectId] = useState("");
  const [captureCheckpointName, setCaptureCheckpointName] = useState("");

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
    setTeammateList((prev) => [...prev, ...members]);
  };

  const openCapturePopup = () => {
    setCapturePhase(1);
    setCaptureModalOpen(true);
  };

  const closeCapturePopup = () => {
    setCaptureModalOpen(false);
    setCapturePhase(1);
  };

  return (
    <div className="flex min-h-screen bg-[#f4f6f8] text-slate-900">
      <aside className="w-48 border-r border-slate-200 bg-[#e8eef2] p-3">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setNewProjectPopupOpen(true)}
            className="w-full bg-[#0f7ea9] px-3 py-2 text-left text-sm font-medium text-white"
          >
            New Project
          </button>
          <button
            type="button"
            onClick={openCapturePopup}
            className="w-full bg-[#0f7ea9] px-3 py-2 text-left text-sm font-medium text-white"
          >
            capture_button
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-600">Teammates tracked: {teammateList.length}</p>
      </aside>

      <main className="w-full px-16 py-10">
        <div className="mb-6 flex items-center justify-end">
          <p className="text-sm text-slate-600">Claudius Marco Andrew</p>
        </div>

        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-5xl font-medium text-slate-900">Project List</h1>

          <div className="space-y-4">
            {projectList.map((project) => {
              const checkpointsCount = project.checkpoints.length;
              const label = checkpointsCount === 1 ? "assessment" : "assessments";

              return (
                <article
                  key={project.id}
                  className="rounded-md bg-[#127ea9] px-5 py-4 text-white shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-semibold leading-tight">{project.name}</h2>
                      <p className="mt-3 text-xs text-sky-100">
                        {checkpointsCount} {label}
                      </p>
                    </div>
                    <span className="text-xl leading-none text-sky-100">⋮</span>
                  </div>
                </article>
              );
            })}
          </div>
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
        onStartRecording={() => {
          // Placeholder until voice capture is connected.
        }}
        onFinish={() => setCapturePhase(3)}
      />
      <CapturePopupPhase3
        open={captureModalOpen && capturePhase === 3}
        onClose={closeCapturePopup}
      />
    </div>
  );
}
