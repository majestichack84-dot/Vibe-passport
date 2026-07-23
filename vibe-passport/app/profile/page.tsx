"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { fetchStamps } from "@/lib/store";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [myStampCount, setMyStampCount] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchStamps()
      .then((all) => setMyStampCount(all.filter((s) => s.userId === user.id).length))
      .catch(() => setMyStampCount(0));
  }, [user]);

  if (loading || !user) return null;

  return (
    <>
      <Header title="Profile" />

      <main className="flex-1 px-5 py-6">
        <div className="flex flex-col items-center rounded-stamp border border-ink-border bg-ink-raised p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-lavender bg-ink-surface text-xl font-semibold text-lavender-soft">
            {user.name[0]?.toUpperCase()}
          </div>
          <h2 className="mt-3 font-display text-2xl italic text-parchment">{user.name}</h2>
          <p className="text-sm text-parchment-muted">{user.email}</p>

          <div className="mt-4 rounded-full border border-lavender-dim px-4 py-1.5 text-sm text-lavender-soft">
            {myStampCount === null
              ? "Loading…"
              : `${myStampCount} stamp${myStampCount === 1 ? "" : "s"} collected`}
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace("/login");
          }}
          className="mt-6 w-full rounded-xl border border-coral py-3 font-semibold text-coral transition active:scale-[0.98]"
        >
          Log out
        </button>
      </main>

      <BottomNav />
    </>
  );
}
