"use client";

import { PopupTemplate } from "@/components/ui/popupTemplate";
import type { NewMemberInput, NewProjectInput } from "@/types/projectTypes";
import { useState } from "react";

type NewProjectPopupProps = {
  open: boolean;
  onClose: () => void;
  onCreateProject: (payload: NewProjectInput) => void;
};

export function NewProjectPopup({ open, onClose, onCreateProject }: NewProjectPopupProps) {
  const [projectName, setProjectName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberPosition, setMemberPosition] = useState("");
  const [members, setMembers] = useState<NewMemberInput[]>([]);

  const reset = () => {
    setProjectName("");
    setMemberName("");
    setMemberPosition("");
    setMembers([]);
  };

  const closePopup = () => {
    reset();
    onClose();
  };

  const addTeammate = () => {
    if (!memberName.trim() || !memberPosition.trim()) return;
    setMembers((prev) => [
      ...prev,
      { name: memberName.trim(), position: memberPosition.trim() },
    ]);
    setMemberName("");
    setMemberPosition("");
  };

  const createProject = () => {
    if (!projectName.trim() || members.length === 0) return;
    onCreateProject({ name: projectName.trim(), members });
    closePopup();
  };

  return (
    <PopupTemplate open={open} onClose={closePopup} title="New Project">
      <div className="space-y-4">
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project Name"
          className="w-full rounded-full bg-slate-200 px-4 py-2 text-sm outline-none ring-[#127ea9] focus:ring-2"
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            placeholder="Add teammate: Name"
            className="rounded-full bg-slate-200 px-4 py-2 text-sm outline-none ring-[#127ea9] focus:ring-2"
          />
          <input
            value={memberPosition}
            onChange={(e) => setMemberPosition(e.target.value)}
            placeholder="Position"
            className="rounded-full bg-slate-200 px-4 py-2 text-sm outline-none ring-[#127ea9] focus:ring-2"
          />
          <button
            type="button"
            onClick={addTeammate}
            className="rounded bg-[#127ea9] px-4 py-2 text-sm font-semibold text-white"
          >
            Add
          </button>
        </div>

        <div className="max-h-40 space-y-2 overflow-y-auto rounded border border-slate-200 p-3">
          {members.length > 0 ? (
            members.map((member, index) => (
              <div
                key={`${member.name}-${index}`}
                className="flex items-center justify-between rounded bg-slate-100 px-3 py-2"
              >
                <span className="text-sm text-slate-700">
                  {member.name} - {member.position}
                </span>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
                  onClick={() => setMembers((prev) => prev.filter((_, i) => i !== index))}
                >
                  remove
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No teammates added yet.</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={closePopup}
            className="rounded px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={createProject}
            disabled={!projectName.trim() || members.length === 0}
            className="rounded bg-[#127ea9] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Create Project
          </button>
        </div>
      </div>
    </PopupTemplate>
  );
}
