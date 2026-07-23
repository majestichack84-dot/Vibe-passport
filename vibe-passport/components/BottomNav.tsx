"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/feed", label: "Feed", icon: FeedIcon },
  { href: "/map", label: "Map", icon: MapIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-ink-border bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-8 py-2">
        {TABS.slice(0, 1).map((tab) => (
          <NavLink key={tab.href} tab={tab} active={pathname === tab.href} />
        ))}

        <Link
          href="/upload"
          aria-label="Add a stamp"
          className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full border-4 border-ink bg-lavender shadow-stamp transition active:scale-95"
        >
          <PlusIcon />
        </Link>

        {TABS.slice(1).map((tab) => (
          <NavLink key={tab.href} tab={tab} active={pathname === tab.href} />
        ))}
      </div>
    </nav>
  );
}

function NavLink({
  tab,
  active,
}: {
  tab: { href: string; label: string; icon: (props: { active: boolean }) => JSX.Element };
  active: boolean;
}) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href}
      className="flex flex-col items-center gap-1 px-4 py-2 text-xs"
    >
      <Icon active={active} />
      <span className={active ? "text-lavender-soft" : "text-parchment-muted"}>
        {tab.label}
      </span>
    </Link>
  );
}

function FeedIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="4" rx="1.5" stroke={active ? "#D7C2FF" : "#A996C2"} strokeWidth="1.8" />
      <rect x="3" y="10" width="18" height="4" rx="1.5" stroke={active ? "#D7C2FF" : "#A996C2"} strokeWidth="1.8" />
      <rect x="3" y="16" width="18" height="4" rx="1.5" stroke={active ? "#D7C2FF" : "#A996C2"} strokeWidth="1.8" />
    </svg>
  );
}

function MapIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"
        stroke={active ? "#D7C2FF" : "#A996C2"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 4v14M15 6v14" stroke={active ? "#D7C2FF" : "#A996C2"} strokeWidth="1.8" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="#150C20" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
