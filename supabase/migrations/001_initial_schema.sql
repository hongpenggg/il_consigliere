-- ============================================================
-- IL CONSIGLIERE — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── saves ───────────────────────────────────────────────────────────────────
-- Stores named game save slots per user.
create table if not exists saves (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  slot_name    text not null,
  player_stats jsonb not null,
  chapter      integer not null default 1,
  play_time    integer not null default 0,   -- seconds of total play time
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists saves_user_id_idx on saves(user_id);

alter table saves enable row level security;

create policy "Users can manage their own saves"
  on saves for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── user_progress ──────────────────────────────────────────────────────────
-- Tracks per-user game progress (one row per user).
create table if not exists user_progress (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  current_chapter integer not null default 1,
  total_play_time integer not null default 0,   -- seconds
  last_active     timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

alter table user_progress enable row level security;

create policy "Users can manage their own progress"
  on user_progress for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── territories ─────────────────────────────────────────────────────────────
-- Per-user territory state (overrides the in-memory defaults from the store).
create table if not exists territories (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  territory_key    text not null,           -- matches Territory.id e.g. 't1'
  influence        integer not null default 0 check (influence between 0 and 100),
  controller       text not null default 'Player',
  weekly_income    integer not null default 0,
  resistance_level integer not null default 1 check (resistance_level between 1 and 5),
  updated_at       timestamptz not null default now(),
  unique (user_id, territory_key)
);

create index if not exists territories_user_id_idx on territories(user_id);

alter table territories enable row level security;

create policy "Users can manage their own territories"
  on territories for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── family_members ──────────────────────────────────────────────────────────
-- Per-user family member loyalty state.
create table if not exists family_members (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  member_key   text not null,               -- matches FamilyMember.id e.g. 'f1'
  loyalty      integer not null default 50 check (loyalty between 0 and 100),
  familiarity  integer not null default 0  check (familiarity between 0 and 100),
  status       text not null default 'active'
                 check (status in ('active','compromised','eliminated','unknown')),
  updated_at   timestamptz not null default now(),
  unique (user_id, member_key)
);

create index if not exists family_members_user_id_idx on family_members(user_id);

alter table family_members enable row level security;

create policy "Users can manage their own family members"
  on family_members for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── ledger_entries ──────────────────────────────────────────────────────────
-- Financial transaction log per user.
create table if not exists ledger_entries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount      bigint not null default 0,
  type        text not null
                check (type in ('income','expense','bribe','tribute','penalty','investment')),
  territory   text,
  created_at  timestamptz not null default now()
);

create index if not exists ledger_entries_user_id_idx on ledger_entries(user_id);
create index if not exists ledger_entries_created_at_idx on ledger_entries(created_at desc);

alter table ledger_entries enable row level security;

create policy "Users can manage their own ledger"
  on ledger_entries for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── story_events ────────────────────────────────────────────────────────────
-- Narrative history: every StoryEvent seen by the user.
create table if not exists story_events (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  content    text not null,
  choices    jsonb not null default '[]',
  chapter    integer not null default 1,
  speaker    text,
  dialogue   text,
  created_at timestamptz not null default now()
);

create index if not exists story_events_user_id_idx   on story_events(user_id);
create index if not exists story_events_chapter_idx   on story_events(chapter);
create index if not exists story_events_created_at_idx on story_events(created_at desc);

alter table story_events enable row level security;

create policy "Users can manage their own story events"
  on story_events for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Enable Realtime ─────────────────────────────────────────────────────────
-- Required for useRealtime.ts to receive live updates.
alter publication supabase_realtime add table story_events;
alter publication supabase_realtime add table ledger_entries;
alter publication supabase_realtime add table territories;
alter publication supabase_realtime add table family_members;

-- ─── updated_at trigger helper ───────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger saves_updated_at
  before update on saves
  for each row execute procedure update_updated_at();

create trigger territories_updated_at
  before update on territories
  for each row execute procedure update_updated_at();

create trigger family_members_updated_at
  before update on family_members
  for each row execute procedure update_updated_at();

-- ─── Add play_time if upgrading an existing saves table ──────────────────────
-- Safe to run even if the column already exists (idempotent).
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'saves' and column_name = 'play_time'
  ) then
    alter table saves add column play_time integer not null default 0;
  end if;
end
$$;
