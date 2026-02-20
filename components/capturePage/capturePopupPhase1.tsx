"use client";

import { PopupTemplate } from "@/components/ui/popupTemplate";

type CapturePopupPhase1Props = {
  open: boolean;
  onClose: () => void;
};

export function CapturePopupPhase1({ open, onClose }: CapturePopupPhase1Props) {
  return (
    <PopupTemplate open={open} onClose={onClose} title="Choose Project to add checkpoint">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Capture flow starts here. Next we will add the project dropdown and checkpoint name
          input.
        </p>
        <div className="flex justify-end">
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
