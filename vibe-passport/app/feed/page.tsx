"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { fetchStamps, subscribeToNewStamps } from "@/lib/store";
import { Stamp } from "@/lib/types";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import StampCard from "@/components/StampCard";

export default function FeedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loadingStamps, setLoadingStamps] = useState(true);
  const [error, setError] = useState("");

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
      .catch(() => {
        if (active) setError("Couldn't load the feed. Pull to refresh.");
      })
      .finally(() => {
        if (active) setLoadingStamps(false);
      });

    // Live-update the feed when anyone (including other users) posts a stamp
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
      <Header title="Vibe Passport" subtitle={`Welcome back, ${user.name}`} />

      <main className="flex-1 space-y-4 px-4 py-4">
        {loadingStamps && (
          <p className="mt-16 text-center text-sm text-parchment-muted">Loading stamps…</p>
        )}

        {error && <p className="text-center text-sm text-coral">{error}</p>}

        {!loadingStamps && stamps.length === 0 && !error && (
          <div className="mt-16 text-center text-parchment-muted">
            <p className="font-display text-xl italic text-parchment">No stamps yet</p>
            <p className="mt-1 text-sm">Be the first to check in with a vibe.</p>
          </div>
        )}

        {stamps.map((stamp) => (
          <StampCard key={stamp.id} stamp={stamp} />
        ))}
      </main>

      <BottomNav />
    </>
  );
}
