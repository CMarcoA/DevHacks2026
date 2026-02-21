"use client";

import { InlineEditableText } from "@/components/ui/inlineEditableText";
import type { Task } from "@/types/projectTypes";
import { useState } from "react";
import "./employeeTaskDropdown.css";

type EmployeeTaskDropdownProps = {
  employeeName: string;
  tasks: Task[];
  open: boolean;
  onToggle: () => void;
  onSaveChanges?: (tasks: Task[]) => void;
  readOnly?: boolean;
};

export function EmployeeTaskDropdown({
  employeeName,
  tasks,
  open,
  onToggle,
  onSaveChanges,
  readOnly = false,
}: EmployeeTaskDropdownProps) {
  const [draftTasks, setDraftTasks] = useState<Task[]>(tasks);

  const updateTask = (taskId: string, updater: (task: Task) => Task) => {
    setDraftTasks((prev) => prev.map((task) => (task.id === taskId ? updater(task) : task)));
  };

  return (
    <div className="employee-dropdown-wrapper">
      <button
        type="button"
        onClick={() => {
          if (!open) setDraftTasks(tasks);
          onToggle();
        }}
        className="employee-dropdown-toggle"
      >
        <span>{employeeName}</span>
        <span>{open ? "v" : ">"}</span>
      </button>

      {open ? (
        <div className="employee-dropdown-body">
          <p className="employee-dropdown-tasks-label">Tasks:</p>
          {draftTasks.map((task) => (
            <div key={task.id} className="employee-dropdown-task-block">
              <div className="employee-dropdown-task-row">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() =>
                    updateTask(task.id, (current) => ({
                      ...current,
                      completed: !current.completed,
                    }))
                  }
                  disabled={readOnly}
                  className="employee-dropdown-checkbox"
                />
                {readOnly ? (
                  <span className="employee-dropdown-task-text">{task.text}</span>
                ) : (
                  <InlineEditableText
                    value={task.text}
                    onSave={(value) =>
                      updateTask(task.id, (current) => ({
                        ...current,
                        text: value,
                      }))
                    }
                  />
                )}
              </div>
              <p className="employee-dropdown-deadline">deadline: {task.dueDate ?? "--/--/--"}</p>
            </div>
          ))}

          {!readOnly ? (
            <button
              type="button"
              onClick={() => onSaveChanges?.(draftTasks)}
              className="employee-dropdown-save-button"
            >
              Save changes
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
