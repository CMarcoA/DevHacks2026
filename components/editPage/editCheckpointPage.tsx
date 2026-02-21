"use client";

import { AppSidebar } from "@/components/ui/appSidebar";
import { EditingPageBox } from "@/components/ui/editingPageBox";
import { EmployeeTaskDropdown } from "@/components/ui/employeeTaskDropdown";
import type { Checkpoint, Project, Task } from "@/types/projectTypes";
import { useState } from "react";
import "./editCheckpointPage.css";

type EditCheckpointPageProps = {
  project: Project;
  checkpoint: Checkpoint;
  onFinishEdit: (tasksByMember: Record<string, Task[]>) => void;
};

export function EditCheckpointPage({ project, checkpoint, onFinishEdit }: EditCheckpointPageProps) {
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);
  const [tasksByMember, setTasksByMember] = useState<Record<string, Task[]>>(() =>
    JSON.parse(JSON.stringify(checkpoint.tasksByMember))
  );

  return (
    <div className="edit-page-shell">
      <AppSidebar />
      <main className="edit-page-main">
        <div className="edit-page-header-row">
          <p className="edit-page-user-text">Claudius Marco Andrew</p>
        </div>

        <EditingPageBox
          title={`[EDITING] ${project.name}`}
          checkpointName={checkpoint.name}
          assignmentDate={checkpoint.createdAt}
          onFinishEdit={() => onFinishEdit(tasksByMember)}
        >
          {project.members.map((member) => (
            <EmployeeTaskDropdown
              key={member.id}
              employeeName={member.name}
              tasks={tasksByMember[member.id] ?? []}
              open={openMemberId === member.id}
              onToggle={() =>
                setOpenMemberId((prev) => (prev === member.id ? null : member.id))
              }
              onSaveChanges={(tasks) => {
                setTasksByMember((prev) => ({
                  ...prev,
                  [member.id]: tasks,
                }));
                setOpenMemberId(null);
              }}
            />
          ))}
        </EditingPageBox>
      </main>
    </div>
  );
}
