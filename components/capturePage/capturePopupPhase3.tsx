"use client";

import { PopupTemplate } from "@/components/ui/popupTemplate";

type CapturePopupPhase3Props = {
  open: boolean;
  onClose: () => void;
  onGoToEdit: () => void;
  canGoToEdit: boolean;
};

export function CapturePopupPhase3({
  open,
  onClose,
  onGoToEdit,
  canGoToEdit,
}: CapturePopupPhase3Props) {
  return (
    <PopupTemplate open={open} onClose={onClose} title="">
      <div className="space-y-6 py-8 text-center">
        <p className="text-4xl text-slate-800">Transcribing ... Building your plan</p>
        <p className="text-sm text-slate-600">Audio capture complete</p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onGoToEdit}
            disabled={!canGoToEdit}
            className="rounded bg-[#127ea9] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Open Edit Page
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </PopupTemplate>
  );
}
