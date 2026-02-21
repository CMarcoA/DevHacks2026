import type { ReactNode } from "react";
import "./editingPageBox.css";

type EditingPageBoxProps = {
  title: string;
  checkpointName: string;
  assignmentDate: string;
  onFinishEdit: () => void;
  children: ReactNode;
};

export function EditingPageBox({
  title,
  checkpointName,
  assignmentDate,
  onFinishEdit,
  children,
}: EditingPageBoxProps) {
  return (
    <section className="editing-page-box-panel">
      <header className="editing-page-box-header">
        <div>
          <h1 className="editing-page-box-title">{title}</h1>
          <p className="editing-page-box-subtitle">{checkpointName}</p>
          <p className="editing-page-box-subtitle">Assignment date: {assignmentDate}</p>
        </div>
        <button
          type="button"
          onClick={onFinishEdit}
          className="editing-page-box-finish-button"
        >
          Finish Edit
        </button>
      </header>
      <p className="editing-page-box-section-label">Your team&apos;s tasks:</p>
      <div className="editing-page-box-content">{children}</div>
    </section>
  );
}
