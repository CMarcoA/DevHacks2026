"use client";

import { PopupTemplate } from "@/components/ui/popupTemplate";

type CapturePopupPhase3Props = {
  open: boolean;
  onClose: () => void;
};

export function CapturePopupPhase3({ open, onClose }: CapturePopupPhase3Props) {
  return (
    <PopupTemplate open={open} onClose={onClose} title="">
      <div className="space-y-6 py-8 text-center">
        <p className="text-4xl text-slate-800">Transcribing ... Building your plan</p>
        <p className="text-sm text-slate-600">Audio capture complete</p>
      </div>
    </PopupTemplate>
  );
}
