"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { createStamp } from "@/lib/store";
import { reverseGeocode } from "@/lib/geocode";
import { MoodKey } from "@/lib/types";
import Header from "@/components/Header";
import PhotoPicker from "@/components/PhotoPicker";
import AudioRecorder from "@/components/AudioRecorder";
import MoodPicker from "@/components/MoodPicker";

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [caption, setCaption] = useState("");
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  const useMyLocation = () => {
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        try {
          const place = await reverseGeocode(lat, lng);
          setLocationName(place);
        } catch {
          setError("Got your coordinates, but couldn't look up a place name — type one in.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError("Couldn't get your location — type it in manually below.");
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!photoFile) return setError("Add a photo first.");
    if (!mood) return setError("Pick a mood.");
    if (!locationName.trim()) return setError("Add a location name.");

    setError("");
    setSubmitting(true);
    try {
      await createStamp({
        userId: user.id,
        userName: user.name,
        photoFile,
        audioBlob,
        mood,
        caption: caption.trim(),
        locationName: locationName.trim(),
        lat: coords?.lat ?? Math.random() * 140 - 70,
        lng: coords?.lng ?? Math.random() * 360 - 180,
      });
      router.push("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post that stamp. Try again.");
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <>
      <Header title="New Stamp" subtitle="Capture the moment" />

      <main className="flex-1 space-y-5 px-4 py-4 pb-8">
        <PhotoPicker onPicked={(file) => setPhotoFile(file)} />

        <AudioRecorder onRecorded={(blob) => setAudioBlob(blob)} />

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-parchment-muted">Mood</p>
          <MoodPicker value={mood} onChange={setMood} />
        </div>

        <div>
          <label htmlFor="caption" className="mb-1.5 block text-xs uppercase tracking-wide text-parchment-muted">
            Caption (optional)
          </label>
          <input
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's the story?"
            className="w-full rounded-xl border border-ink-border bg-ink-surface px-4 py-3 text-parchment placeholder:text-parchment-muted/50 focus:border-lavender"
          />
        </div>

        <div>
          <label htmlFor="location" className="mb-1.5 block text-xs uppercase tracking-wide text-parchment-muted">
            Location name
          </label>
          <input
            id="location"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Lisbon, Portugal"
            className="w-full rounded-xl border border-ink-border bg-ink-surface px-4 py-3 text-parchment placeholder:text-parchment-muted/50 focus:border-lavender"
          />
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="mt-2 text-xs font-medium text-lavender-soft disabled:opacity-60"
          >
            {locating
              ? "Finding your spot…"
              : coords
              ? "📍 Location detected — edit above if needed"
              : "Use my current location"}
          </button>
        </div>

        {error && <p className="text-sm text-coral">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-xl bg-lavender py-3.5 font-semibold text-ink transition active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? "Stamping…" : "Stamp it"}
        </button>
      </main>
    </>
  );
}
