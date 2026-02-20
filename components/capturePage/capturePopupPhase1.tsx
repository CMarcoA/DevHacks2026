"use client";

import { PopupTemplate } from "@/components/ui/popupTemplate";
import type { Project } from "@/types/projectTypes";

type CapturePopupPhase1Props = {
  open: boolean;
  onClose: () => void;
  projectList: Project[];
  selectedProjectId: string;
  checkpointName: string;
  onSelectedProjectChange: (projectId: string) => void;
  onCheckpointNameChange: (value: string) => void;
};

export function CapturePopupPhase1({
  open,
  onClose,
  projectList,
  selectedProjectId,
  checkpointName,
  onSelectedProjectChange,
  onCheckpointNameChange,
}: CapturePopupPhase1Props) {
  return (
    <PopupTemplate open={open} onClose={onClose} title="Choose Project to add checkpoint">
      <div className="space-y-4">
        <select
          value={selectedProjectId}
          onChange={(e) => onSelectedProjectChange(e.target.value)}
          className="w-full rounded-full bg-slate-200 px-4 py-2 text-sm text-slate-800 outline-none ring-[#127ea9] focus:ring-2"
        >
          <option value="">Project List</option>
          {projectList.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <input
          value={checkpointName}
          onChange={(e) => onCheckpointNameChange(e.target.value)}
          placeholder="Checkpoint name:"
          className="w-full rounded-full bg-slate-200 px-4 py-2 text-sm text-slate-800 outline-none ring-[#127ea9] focus:ring-2"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-[#127ea9] px-4 py-2 text-sm font-semibold text-white"
          >
            Close
          </button>
        </div>
      </div>
    </PopupTemplate>
  );
}
