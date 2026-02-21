"use client";

import { PopupTemplate } from "@/components/ui/popupTemplate";
import type { Project } from "@/types/projectTypes";
import { useMemo, useState } from "react";

type DeleteProjectPopupProps = {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  onDeleteProject: (projectId: string) => void;
};

export function DeleteProjectPopup({
  open,
  onClose,
  projects,
  onDeleteProject,
}: DeleteProjectPopupProps) {
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const resolvedSelectedProjectId = useMemo(() => {
    if (selectedProjectId && projects.some((project) => project.id === selectedProjectId)) {
      return selectedProjectId;
    }
    return projects[0]?.id ?? "";
  }, [projects, selectedProjectId]);

  const handleDelete = () => {
    if (!resolvedSelectedProjectId) return;
    const targetProject = projects.find((project) => project.id === resolvedSelectedProjectId);
    if (!targetProject) return;

    const confirmed = window.confirm(
      `Delete "${targetProject.name}" and all checkpoints/tasks in it?`
    );
    if (!confirmed) return;

    onDeleteProject(targetProject.id);
    onClose();
  };

  return (
    <PopupTemplate open={open} onClose={onClose} title="Delete Project">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">Choose which project to delete.</p>

        <label className="block text-sm font-medium text-slate-700" htmlFor="delete-project-select">
          Delete which project
        </label>
        <select
          id="delete-project-select"
          value={resolvedSelectedProjectId}
          onChange={(event) => setSelectedProjectId(event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-[#127ea9] focus:ring-2"
          disabled={projects.length === 0}
        >
          {projects.length ? (
            projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))
          ) : (
            <option value="">No projects available</option>
          )}
        </select>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!resolvedSelectedProjectId}
            className="rounded bg-[#c2410c] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </PopupTemplate>
  );
}
