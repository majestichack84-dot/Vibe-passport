"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { sendMagicLink, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/feed");
  }, [user, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Enter a valid email to get your passport.");
      return;
    }
    if (!trimmedName) {
      setError("Tell us what to call you.");
      return;
    }
    setError("");
    setSending(true);
    try {
      await sendMagicLink(trimmedEmail, trimmedName);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't send the magic link. Try again."
      );
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 flex h-20 w-20 rotate-[-6deg] items-center justify-center rounded-stamp border-2 border-lavender bg-ink-raised shadow-stamp">
          <span className="rotate-[6deg] text-3xl">✉️</span>
        </div>
        <h1 className="font-display text-2xl italic text-parchment">Check your inbox</h1>
        <p className="mt-2 text-sm text-parchment-muted">
          We sent a magic link to <span className="text-parchment">{email}</span>. Open it on
          this device to finish signing in.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm font-medium text-lavender-soft"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-12">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 rotate-[-6deg] items-center justify-center rounded-stamp border-2 border-lavender bg-ink-raised shadow-stamp">
          <span className="rotate-[6deg] font-display text-3xl italic text-lavender-soft">
            VP
          </span>
        </div>
        <h1 className="font-display text-4xl italic text-parchment">
          Vibe Passport
        </h1>
        <p className="mt-2 text-sm text-parchment-muted">
          Every mood gets a stamp. Every stamp gets a place on the map.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs uppercase tracking-wide text-parchment-muted">
            Name on your passport
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan"
            className="w-full rounded-xl border border-ink-border bg-ink-surface px-4 py-3 text-parchment placeholder:text-parchment-muted/50 focus:border-lavender"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-wide text-parchment-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@vibepassport.com"
            className="w-full rounded-xl border border-ink-border bg-ink-surface px-4 py-3 text-parchment placeholder:text-parchment-muted/50 focus:border-lavender"
          />
        </div>

        {error && <p className="text-sm text-coral">{error}</p>}

        <button
          type="submit"
          disabled={sending}
          className="mt-2 w-full rounded-xl bg-lavender py-3.5 font-semibold text-ink transition active:scale-[0.98] disabled:opacity-60"
        >
          {sending ? "Sending link…" : "Email me a magic link"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-parchment-muted">
        No password needed — we'll email you a one-tap sign-in link.
      </p>
    </div>
  );
}
