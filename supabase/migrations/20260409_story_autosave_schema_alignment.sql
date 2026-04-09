-- Align schema with app-side autosave payloads.
-- Safe/idempotent migration.

alter table if exists public.user_progress
  add column if not exists current_chapter integer,
  -- Maintained for compatibility with existing client payload shape.
  add column if not exists total_play_time integer,
  add column if not exists last_active timestamptz;

update public.user_progress
set
  current_chapter = coalesce(current_chapter, 1),
  total_play_time = coalesce(total_play_time, 0),
  last_active = coalesce(last_active, now())
where
  current_chapter is null
  or total_play_time is null
  or last_active is null;

alter table if exists public.user_progress
  alter column current_chapter set default 1,
  alter column total_play_time set default 0,
  alter column last_active set default now();

alter table if exists public.user_progress
  alter column current_chapter set not null,
  alter column total_play_time set not null,
  alter column last_active set not null;

alter table if exists public.story_events
  add column if not exists speaker text,
  add column if not exists dialogue text;
