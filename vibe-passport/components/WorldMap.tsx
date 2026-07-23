"use client";

import { useState } from "react";
import { Stamp } from "@/lib/types";
import { getMood } from "@/lib/moods";

// Equirectangular projection: convert lat/lng to % position on the map image
function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

export default function WorldMap({ stamps }: { stamps: Stamp[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = stamps.find((s) => s.id === activeId) ?? null;
  const activeMood = active ? getMood(active.mood) : null;

  return (
    <div className="relative w-full overflow-hidden rounded-stamp border border-ink-border bg-ink-surface">
      <div className="relative aspect-[2/1.15] w-full">
        {/* Base world map, re-tinted to fit the dark purple theme */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg"
          alt="World map"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          style={{ filter: "invert(1) sepia(1) hue-rotate(220deg) saturate(2.2) brightness(0.55)" }}
        />
        <div className="absolute inset-0 bg-ink/25" />

        {stamps.map((stamp) => {
          const { x, y } = project(stamp.lat, stamp.lng);
          const mood = getMood(stamp.mood);
          const isActive = activeId === stamp.id;
          return (
            <button
              key={stamp.id}
              onClick={() => setActiveId(isActive ? null : stamp.id)}
              aria-label={`${stamp.userName} in ${stamp.locationName}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span
                className={`block rounded-full border-2 transition ${isActive ? "h-4 w-4" : "h-3 w-3"}`}
                style={{
                  backgroundColor: mood.color,
                  borderColor: "#150C20",
                  boxShadow: isActive ? `0 0 0 6px ${mood.color}33` : "none",
                }}
              />
            </button>
          );
        })}
      </div>

      {active && activeMood && (
        <div className="flex items-center gap-3 border-t border-ink-border p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.photoUrl}
            alt=""
            className="h-12 w-12 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-parchment">
              {active.userName} · {activeMood.emoji} {activeMood.label}
            </p>
            <p className="truncate font-mono text-[11px] text-parchment-muted">
              {active.locationName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
