"use client";

import { EmployeeTaskDropdown } from "@/components/ui/employeeTaskDropdown";
import type { Project } from "@/types/projectTypes";
import { useMemo, useState } from "react";
import "./projectCheckpointExplorer.css";

type ProjectCheckpointExplorerProps = {
  projects: Project[];
  onOpenCheckpointEdit?: (projectId: string, checkpointId: string) => void;
};

export function ProjectCheckpointExplorer({
  projects,
  onOpenCheckpointEdit,
}: ProjectCheckpointExplorerProps) {
  const [openProjectId, setOpenProjectId] = useState<string | null>(projects[0]?.id ?? null);
  const [openCheckpointKey, setOpenCheckpointKey] = useState<string | null>(null);
  const [openMemberByCheckpoint, setOpenMemberByCheckpoint] = useState<Record<string, string | null>>(
    {}
  );

  const orderedProjects = useMemo(() => projects, [projects]);

  return (
    <div className="project-explorer-list">
      {orderedProjects.map((project) => {
        const isProjectOpen = openProjectId === project.id;
        const checkpoints = [...project.checkpoints].reverse();

        return (
          <article key={project.id} className="project-explorer-card">
            <button
              type="button"
              className="project-explorer-card-header"
              onClick={() =>
                setOpenProjectId((prev) => (prev === project.id ? null : project.id))
              }
            >
              <div>
                <h2 className="project-explorer-title">{project.name}</h2>
                <p className="project-explorer-count">{project.checkpoints.length} checkpoints</p>
              </div>
              <span className="project-explorer-chevron">{isProjectOpen ? "v" : ">"}</span>
            </button>

            {isProjectOpen ? (
              <div className="project-explorer-checkpoints">
                {checkpoints.length ? (
                  checkpoints.map((checkpoint) => {
                    const checkpointKey = `${project.id}:${checkpoint.id}`;
                    const isCheckpointOpen = openCheckpointKey === checkpointKey;

                    return (
                      <div key={checkpoint.id} className="project-explorer-checkpoint">
                        <div className="project-explorer-checkpoint-header">
                          <button
                            type="button"
                            className="project-explorer-checkpoint-toggle"
                            onClick={() =>
                              setOpenCheckpointKey((prev) =>
                                prev === checkpointKey ? null : checkpointKey
                              )
                            }
                          >
                            <span>{checkpoint.name}</span>
                            <span>{isCheckpointOpen ? "v" : ">"}</span>
                          </button>
                          {onOpenCheckpointEdit ? (
                            <button
                              type="button"
                              className="project-explorer-open-edit"
                              onClick={() => onOpenCheckpointEdit(project.id, checkpoint.id)}
                            >
                              Open Edit
                            </button>
                          ) : null}
                        </div>

                        {isCheckpointOpen ? (
                          <div className="project-explorer-people">
                            {project.members.map((member) => (
                              <EmployeeTaskDropdown
                                key={member.id}
                                employeeName={member.name}
                                tasks={checkpoint.tasksByMember[member.id] ?? []}
                                open={openMemberByCheckpoint[checkpointKey] === member.id}
                                onToggle={() =>
                                  setOpenMemberByCheckpoint((prev) => ({
                                    ...prev,
                                    [checkpointKey]:
                                      prev[checkpointKey] === member.id ? null : member.id,
                                  }))
                                }
                                readOnly
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <p className="project-explorer-empty">No checkpoints yet.</p>
                )}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
