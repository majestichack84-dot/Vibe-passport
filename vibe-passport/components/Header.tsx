"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-ink-border bg-ink/95 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl italic text-parchment">{title}</h1>
          {subtitle && <p className="text-xs text-parchment-muted">{subtitle}</p>}
        </div>
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-lavender-dim bg-ink-surface text-sm font-semibold text-lavender-soft"
        >
          {user?.name?.[0]?.toUpperCase() ?? "?"}
        </Link>
      </div>
    </header>
  );
}
