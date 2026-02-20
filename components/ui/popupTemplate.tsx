"use client";

import type { ReactNode } from "react";

type PopupTemplateProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function PopupTemplate({ open, title, onClose, children }: PopupTemplateProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
      <div className="w-full max-w-3xl rounded bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-4xl font-medium text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
