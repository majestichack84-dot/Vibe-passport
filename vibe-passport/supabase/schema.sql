-- Vibe Passport — Supabase schema
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run

-- ============================================================
-- 1. PROFILES  (display name for each auth.users row)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone signed in can read display names (needed to show names in the feed)
create policy "Profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can only create/update their own profile row
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- ============================================================
-- 2. STAMPS  (one row per upload: photo + audio + mood + place)
-- ============================================================
create table if not exists public.stamps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  user_name text not null,
  mood text not null,
  caption text not null default '',
  location_name text not null,
  lat double precision not null,
  lng double precision not null,
  photo_url text not null,
  audio_url text not null default '',
  created_at timestamptz not null default now()
);

alter table public.stamps enable row level security;

-- Every signed-in user can see every stamp — this is the shared global feed/map
create policy "Stamps are readable by authenticated users"
  on public.stamps for select
  to authenticated
  using (true);

-- Users can only create stamps under their own user_id
create policy "Users can insert their own stamps"
  on public.stamps for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can only delete their own stamps
create policy "Users can delete their own stamps"
  on public.stamps for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists stamps_created_at_idx on public.stamps (created_at desc);

-- Enable Realtime so the feed updates live when anyone posts
alter publication supabase_realtime add table public.stamps;

-- ============================================================
-- 3. STORAGE BUCKETS  (photos + audio clips)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('stamp-photos', 'stamp-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('stamp-audio', 'stamp-audio', true)
on conflict (id) do nothing;

-- Public read (so <img>/<audio> tags work without signed URLs)
create policy "Public read access to stamp photos"
  on storage.objects for select
  to public
  using (bucket_id = 'stamp-photos');

create policy "Public read access to stamp audio"
  on storage.objects for select
  to public
  using (bucket_id = 'stamp-audio');

-- Authenticated users can upload into their own folder: {user_id}/{filename}
create policy "Users can upload their own photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'stamp-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload their own audio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'stamp-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
