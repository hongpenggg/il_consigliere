-- Align schema with app-side autosave payloads.
-- Safe/idempotent migration.

alter table if exists public.user_progress
  add column if not exists current_chapter integer not null default 1,
  add column if not exists total_play_time integer not null default 0,
  add column if not exists last_active timestamptz not null default now();

alter table if exists public.story_events
  add column if not exists speaker text,
  add column if not exists dialogue text;

