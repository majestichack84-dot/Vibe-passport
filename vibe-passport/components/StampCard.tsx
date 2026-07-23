"use client";

import { Stamp } from "@/lib/types";
import { getMood } from "@/lib/moods";

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function StampCard({ stamp }: { stamp: Stamp }) {
  const mood = getMood(stamp.mood);

  return (
    <article className="overflow-hidden rounded-stamp border border-ink-border bg-ink-raised">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stamp.photoUrl}
          alt={stamp.caption || `A moment in ${stamp.locationName}`}
          className="h-64 w-full object-cover"
        />
        <div
          className="absolute right-3 top-3 flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-xs font-semibold backdrop-blur"
          style={{ borderColor: mood.color, color: mood.color, backgroundColor: "rgba(21,12,32,0.7)" }}
        >
          <span>{mood.emoji}</span>
          <span>{mood.label}</span>
        </div>
      </div>

      <div className="space-y-2.5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-parchment">{stamp.userName}</p>
            <p className="font-mono text-[11px] text-parchment-muted">
              📍 {stamp.locationName}
            </p>
          </div>
          <span className="text-[11px] text-parchment-muted">{timeAgo(stamp.createdAt)}</span>
        </div>

        {stamp.caption && <p className="text-sm text-parchment/90">{stamp.caption}</p>}

        {stamp.audioUrl && (
          <audio controls src={stamp.audioUrl} className="h-9 w-full" />
        )}
      </div>
    </article>
  );
}
