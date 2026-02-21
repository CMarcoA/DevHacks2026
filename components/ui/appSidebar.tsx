"use client";

import "./appSidebar.css";

type AppSidebarProps = {
  onNewProject?: () => void;
  onCapture?: () => void;
  teammateCount?: number;
};

export function AppSidebar({ onNewProject, onCapture, teammateCount }: AppSidebarProps) {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-actions">
        <button type="button" onClick={onNewProject} className="app-sidebar-action-button">
          New Project
        </button>
        <button type="button" onClick={onCapture} className="app-sidebar-action-button">
          capture_button
        </button>
      </div>
      {typeof teammateCount === "number" ? (
        <p className="app-sidebar-meta">Teammates tracked: {teammateCount}</p>
      ) : null}
    </aside>
  );
}
