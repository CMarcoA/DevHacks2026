"use client";

import type { ReactNode } from "react";
import "./popupTemplate.css";

type PopupTemplateProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function PopupTemplate({ open, title, onClose, children }: PopupTemplateProps) {
  if (!open) return null;

  return (
    <div className="popup-template-overlay">
      <div className="popup-template-panel">
        <div className="popup-template-header">
          <h2 className="popup-template-title">{title}</h2>
          <button type="button" onClick={onClose} className="popup-template-close-button">
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
