"use client";

import type { ReactNode } from "react";
import styles from "./popupTemplate.module.css";

type PopupTemplateProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function PopupTemplate({ open, title, onClose, children }: PopupTemplateProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
