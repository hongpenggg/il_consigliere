-- Story/tutorial progress tracking columns.
-- Safe/idempotent migration.

alter table if exists public.user_progress
  add column if not exists tutorial_completed boolean not null default false,
  add column if not exists tutorial_phase text not null default 'chapter0',
  add column if not exists story_mode_started boolean not null default false,
  add column if not exists story_chapter integer not null default 1,
  add column if not exists story_step integer not null default 0,
  add column if not exists story_path jsonb not null default '[]'::jsonb,
  add column if not exists story_ending text,
  add column if not exists story_world jsonb,
  add column if not exists resource_snapshot jsonb;

alter table if exists public.game_instances
  add column if not exists progress_snapshot jsonb;
