# Vibe Passport

A mobile-first, dark-purple "stamp your mood" app built with Next.js 14 (App Router) + TypeScript + Tailwind CSS, backed by **Supabase** (Postgres + Auth + Storage + Realtime).

## Features

- **Email login** — real magic-link auth via Supabase Auth. No passwords.
- **Upload a stamp** — photo + an optional 5-second voice snippet (`MediaRecorder`, hard-capped at 5s) + mood + caption, uploaded to Supabase Storage.
- **Shared feed** — every stamp from every signed-in user, newest first, updating live via Supabase Realtime when anyone posts.
- **Real reverse geocoding** — "Use my current location" reads GPS coordinates and resolves them to a real "City, Country" string automatically (editable).
- **World map** — every stamp plotted as a pin (equirectangular lat/lng projection); tap a pin for details.

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
3. Copy `.env.local.example` to `.env.local` and fill both values in:

   ```bash
   cp .env.local.example .env.local
   ```

## 2. Set up the database + storage

Open **SQL Editor** in the Supabase dashboard, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates:

- `profiles` table (display name per user) with RLS
- `stamps` table (photo/audio URLs, mood, caption, location, lat/lng) with RLS, and adds it to the `supabase_realtime` publication so the feed updates live
- `stamp-photos` and `stamp-audio` public storage buckets, with policies so users can only upload into their own `user_id/` folder, but anyone signed in can read

## 3. Enable email magic links

In **Authentication → Providers**, Email should already be enabled by default. In **Authentication → URL Configuration**, add your dev URL (`http://localhost:3000`) and your deployed URL to **Redirect URLs** so the magic link can send people back to the app.

By default Supabase rate-limits its built-in test SMTP fairly aggressively — fine for development, but plug in a real SMTP provider (Postmark, Resend, SES, etc.) under **Project Settings → Auth → SMTP Settings** before shipping to real users.

## 4. Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Best viewed at mobile width (the layout caps at `max-w-md` and centers on larger screens).

## How auth + profiles work

Supabase's OTP/magic-link flow only needs an email — there's no signup step to also collect a display name. To keep the one-step login UX, the login form stashes the name you type in `localStorage` before sending the link; once you click the link and `onAuthStateChange` fires with a session, `lib/auth.tsx` creates (or loads) a row in `profiles` using that stashed name. If you open the link on a different device, it falls back to your email's local-part as the name.

## Reverse geocoding

`lib/geocode.ts` calls BigDataCloud's free, keyless, CORS-enabled client-side reverse geocode endpoint to turn `{ lat, lng }` into `"City, Country"`. It's fine for demo/low-volume traffic; swap in Google Geocoding or Mapbox if you need higher accuracy, rate limits, or SLAs.

## Project structure

```
app/
  layout.tsx         Root layout, fonts, AuthProvider
  page.tsx            Redirects to /feed or /login
  login/page.tsx       Magic-link email login
  feed/page.tsx         Shared feed (Supabase + Realtime)
  upload/page.tsx        New stamp form (Storage upload + geocoding)
  map/page.tsx            World map of all stamps
  profile/page.tsx         User profile + logout
components/
  BottomNav.tsx, Header.tsx, MoodPicker.tsx, PhotoPicker.tsx,
  AudioRecorder.tsx, StampCard.tsx, WorldMap.tsx
lib/
  supabase.ts          Supabase client
  auth.tsx              Auth context (magic link + profiles)
  store.ts               Stamps: fetch / create / realtime subscribe
  geocode.ts              Reverse geocoding helper
  types.ts, moods.ts
supabase/
  schema.sql            Tables, RLS policies, storage buckets — run once
```

## Design system

Dark aubergine-purple palette (`ink`, `lavender`, `coral`, `parchment` in `tailwind.config.ts`), Fraunces (display/italic) + Inter (body) + IBM Plex Mono (coordinates/timestamps), passport-stamp visual motif (rotated badges, circular seals, stamp-in animation).

## Notes

- Microphone and camera access require HTTPS in production (localhost is fine for dev).
- All stamps are visible to every signed-in user by design (RLS policy `Stamps are readable by authenticated users`) — that's what makes this a shared, public passport rather than a private journal.
