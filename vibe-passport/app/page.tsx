"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/feed" : "/login");
  }, [user, loading, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="animate-pulse font-display text-lg italic text-lavender-soft">
        stamping in…
      </div>
    </div>
  );
}
