"use client";

import { PopupTemplate } from "@/components/ui/popupTemplate";
import { useEffect, useRef, useState } from "react";

type CapturePopupPhase2Props = {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onAudioCaptured: (audioBlob: Blob) => void;
  onRecordingCompleted: () => void;
};

export function CapturePopupPhase2({
  open,
  onClose,
  onBack,
  onAudioCaptured,
  onRecordingCompleted,
}: CapturePopupPhase2Props) {
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "stopped">(
    "idle"
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const stopTracks = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      stopTracks();
    };
  }, []);

  const startRecording = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      alert("Audio capture is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const preferredType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType: preferredType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        onAudioCaptured(audioBlob);
        setRecordingState("stopped");
        stopTracks();
        onRecordingCompleted();
      };

      recorder.start();
      setRecordingState("recording");
    } catch (error) {
      console.error("Unable to start recording:", error);
      alert("Microphone access was denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (recordingState === "recording") {
      stopRecording();
      return;
    }
    startRecording();
  };

  const helperText =
    recordingState === "recording"
      ? "Recording... press the button again to stop."
      : "Press button to start recording";

  return (
    <PopupTemplate open={open} onClose={onClose} title="What's on your mind?">
      <div className="space-y-8 py-2 text-center">
        <button
          type="button"
          onClick={toggleRecording}
          className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-slate-700 text-6xl text-white hover:bg-slate-800"
          aria-label="Start voice recording"
        >
          🎤
        </button>

        <p className="text-sm text-slate-700">{helperText}</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={recordingState === "recording"}
            className="rounded px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Back
          </button>
        </div>
      </div>
    </PopupTemplate>
  );
}
