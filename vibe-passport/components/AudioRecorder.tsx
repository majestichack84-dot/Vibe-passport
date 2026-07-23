"use client";

import { useRef, useState, useEffect } from "react";

const MAX_SECONDS = 5;

export default function AudioRecorder({
  onRecorded,
}: {
  onRecorded: (blob: Blob, previewUrl: string) => void;
}) {
  const [status, setStatus] = useState<"idle" | "recording" | "done" | "error">("idle");
  const [secondsLeft, setSecondsLeft] = useState(MAX_SECONDS);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startRecording = async () => {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        onRecorded(blob, url);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setStatus("recording");
      setSecondsLeft(MAX_SECONDS);

      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            recorder.stop();
            setStatus("done");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setStatus("error");
      setErrorMsg("Mic access denied. Allow microphone access to record a vibe.");
    }
  };

  const retake = () => {
    setPreviewUrl("");
    setStatus("idle");
    setSecondsLeft(MAX_SECONDS);
  };

  return (
    <div className="rounded-2xl border border-ink-border bg-ink-surface p-4">
      {status !== "done" && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-parchment">5-second voice snippet</p>
            <p className="text-xs text-parchment-muted">
              {status === "recording" ? `Recording… ${secondsLeft}s left` : "Tap to record (optional)"}
            </p>
          </div>
          <button
            type="button"
            onClick={startRecording}
            disabled={status === "recording"}
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition ${
              status === "recording"
                ? "animate-pulse border-coral bg-coral/20"
                : "border-lavender bg-lavender/15"
            }`}
            aria-label="Record 5 second audio"
          >
            <span className={`h-4 w-4 rounded-full ${status === "recording" ? "bg-coral" : "bg-lavender"}`} />
          </button>
        </div>
      )}

      {status === "done" && previewUrl && (
        <div className="flex items-center justify-between gap-3">
          <audio controls src={previewUrl} className="h-9 w-full max-w-[190px]" />
          <button
            type="button"
            onClick={retake}
            className="whitespace-nowrap text-xs font-medium text-lavender-soft"
          >
            Retake
          </button>
        </div>
      )}

      {errorMsg && <p className="mt-2 text-xs text-coral">{errorMsg}</p>}
    </div>
  );
}
