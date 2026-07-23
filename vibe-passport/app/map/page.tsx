"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { fetchStamps, subscribeToNewStamps } from "@/lib/store";
import { Stamp } from "@/lib/types";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import WorldMap from "@/components/WorldMap";
import { MOODS } from "@/lib/moods";

export default function MapPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loadingStamps, setLoadingStamps] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    let active = true;
    fetchStamps()
      .then((data) => {
        if (active) setStamps(data);
      })
      .finally(() => {
        if (active) setLoadingStamps(false);
      });

    const unsubscribe = subscribeToNewStamps((newStamp) => {
      setStamps((prev) =>
        prev.some((s) => s.id === newStamp.id) ? prev : [newStamp, ...prev]
      );
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [user]);

  if (loading || !user) return null;

  return (
    <>
      <Header title="World Map" subtitle={`${stamps.length} stamps around the globe`} />

      <main className="flex-1 space-y-4 px-4 py-4">
        {loadingStamps ? (
          <p className="mt-16 text-center text-sm text-parchment-muted">Loading map…</p>
        ) : (
          <WorldMap stamps={stamps} />
        )}

        <div className="flex flex-wrap gap-2">
          {MOODS.map((mood) => (
            <span
              key={mood.key}
              className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]"
              style={{ borderColor: mood.color, color: mood.color }}
            >
              {mood.emoji} {mood.label}
            </span>
          ))}
        </div>
        <p className="text-center text-xs text-parchment-muted">
          Tap a pin to see who stamped that spot.
        </p>
      </main>

      <BottomNav />
    </>
  );
}
