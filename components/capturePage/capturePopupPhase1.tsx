"use client";

import { PopupTemplate } from "@/components/ui/popupTemplate";
import type { Project } from "@/types/projectTypes";
import styles from "./capturePopupPhase1.module.css";

type CapturePopupPhase1Props = {
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  projectList: Project[];
  selectedProjectId: string;
  checkpointName: string;
  onSelectedProjectChange: (projectId: string) => void;
  onCheckpointNameChange: (value: string) => void;
};

export function CapturePopupPhase1({
  open,
  onClose,
  onNext,
  projectList,
  selectedProjectId,
  checkpointName,
  onSelectedProjectChange,
  onCheckpointNameChange,
}: CapturePopupPhase1Props) {
  const canProceed = selectedProjectId.trim().length > 0 && checkpointName.trim().length > 0;

  return (
    <PopupTemplate open={open} onClose={onClose} title="Choose Project to add checkpoint">
      <div className={styles.content}>
        <select
          value={selectedProjectId}
          onChange={(e) => onSelectedProjectChange(e.target.value)}
          className={styles.projectSelect}
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
          className={styles.checkpointInput}
        />

        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            Close
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className={styles.nextButton}
          >
            Next
          </button>
        </div>
      </div>
    </PopupTemplate>
  );
}
