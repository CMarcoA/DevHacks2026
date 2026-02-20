"use client";

import { PopupTemplate } from "@/components/ui/popupTemplate";

type CapturePopupPhase2Props = {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onStartRecording: () => void;
};

export function CapturePopupPhase2({
  open,
  onClose,
  onBack,
  onStartRecording,
}: CapturePopupPhase2Props) {
  return (
    <PopupTemplate open={open} onClose={onClose} title="What's on your mind?">
      <div className="space-y-8 py-2 text-center">
        <button
          type="button"
          onClick={onStartRecording}
          className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-slate-700 text-6xl text-white hover:bg-slate-800"
          aria-label="Start voice recording"
        >
          🎤
        </button>

        <p className="text-sm text-slate-700">Press button to start recording</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-[#127ea9] px-4 py-2 text-sm font-semibold text-white"
          >
            Close
          </button>
        </div>
      </div>
    </PopupTemplate>
  );
}
