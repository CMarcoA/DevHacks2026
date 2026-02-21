"use client";

import { PopupTemplate } from "@/components/ui/popupTemplate";

type DeleteCheckpointPopupProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteCheckpointPopup({ open, onClose, onConfirm }: DeleteCheckpointPopupProps) {
  return (
    <PopupTemplate open={open} onClose={onClose} title="Delete Checkpoint">
      <div className="space-y-6">
        <p className="text-base text-slate-700">Delete Checkpoint?</p>
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
            onClick={onConfirm}
            className="rounded bg-[#c2410c] px-4 py-2 text-sm font-semibold text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </PopupTemplate>
  );
}
