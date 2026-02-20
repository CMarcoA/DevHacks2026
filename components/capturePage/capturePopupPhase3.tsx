"use client";

import { PopupTemplate } from "@/components/ui/popupTemplate";

type CapturePopupPhase3Props = {
  open: boolean;
  onClose: () => void;
};

export function CapturePopupPhase3({ open, onClose }: CapturePopupPhase3Props) {
  return (
    <PopupTemplate open={open} onClose={onClose} title="">
      <div className="flex min-h-[220px] items-center justify-center">
        <p className="text-4xl text-slate-800">Transcribing ... Building your plan</p>
      </div>
    </PopupTemplate>
  );
}
