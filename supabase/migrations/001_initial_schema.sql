-- ============================================================
-- IL CONSIGLIERE — Initial Public Schema (canonical)
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- family_members
create table if not exists public.family_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  role text not null,
  loyalty integer not null default 50 check (loyalty between 0 and 100),
  status text not null default 'active' check (status in ('active', 'compromised', 'deceased'))
);

create index if not exists idx_family_members_user_id on public.family_members using btree (user_id);

-- ledger_entries
create table if not exists public.ledger_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null,
  amount bigint not null default 0,
  type text not null check (type in ('income', 'expense', 'bribe', 'tribute')),
  created_at timestamptz not null default now()
);

create index if not exists idx_ledger_entries_user_id on public.ledger_entries using btree (user_id);
create index if not exists idx_ledger_entries_created_at on public.ledger_entries using btree (created_at desc);

-- saves
create table if not exists public.saves (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slot_name text not null,
  player_stats jsonb not null default '{}'::jsonb,
  chapter integer not null default 1,
  created_at timestamptz not null default now(),
  play_time integer not null default 0,
  unique (user_id, slot_name)
);

create index if not exists idx_saves_user_id on public.saves using btree (user_id);

-- story_events
create table if not exists public.story_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  choices jsonb not null default '[]'::jsonb,
  chapter integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_story_events_user_id on public.story_events using btree (user_id);
create index if not exists idx_story_events_created_at on public.story_events using btree (created_at desc);

-- territories
create table if not exists public.territories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  territory_id text not null,
  influence integer not null default 0 check (influence between 0 and 100),
  controller text not null default 'neutral',
  updated_at timestamptz not null default now(),
  unique (user_id, territory_id)
);

create index if not exists idx_territories_user_id on public.territories using btree (user_id);

-- user_progress
create table if not exists public.user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  player_stats jsonb not null default '{}'::jsonb,
  chapter integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  tutorial_completed boolean not null default false,
  tutorial_phase text not null default 'chapter0',
  story_mode_started boolean not null default false,
  story_chapter integer not null default 1,
  story_step integer not null default 0,
  story_path jsonb not null default '[]'::jsonb,
  story_ending text,
  story_world jsonb,
  resource_snapshot jsonb
);

alter table public.family_members enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.saves enable row level security;
alter table public.story_events enable row level security;
alter table public.territories enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "Users can manage their own family members" on public.family_members;
create policy "Users can manage their own family members"
  on public.family_members for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own ledger" on public.ledger_entries;
create policy "Users can manage their own ledger"
  on public.ledger_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own saves" on public.saves;
create policy "Users can manage their own saves"
  on public.saves for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own story events" on public.story_events;
create policy "Users can manage their own story events"
  on public.story_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own territories" on public.territories;
create policy "Users can manage their own territories"
  on public.territories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own progress" on public.user_progress;
create policy "Users can manage their own progress"
  on public.user_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'story_events'
  ) then
    alter publication supabase_realtime add table public.story_events;
  end if;
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'ledger_entries'
  ) then
    alter publication supabase_realtime add table public.ledger_entries;
  end if;
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'territories'
  ) then
    alter publication supabase_realtime add table public.territories;
  end if;
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'family_members'
  ) then
    alter publication supabase_realtime add table public.family_members;
  end if;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_territories_updated_at on public.territories;
create trigger trg_territories_updated_at
before update on public.territories
for each row
execute function public.set_updated_at();

drop trigger if exists trg_user_progress_updated_at on public.user_progress;
create trigger trg_user_progress_updated_at
before update on public.user_progress
for each row
execute function public.set_updated_at();
