-- Game instances table
-- One row per user; upserted on every meaningful state change.
-- On reload, the app fetches this row to restore the active game.

create table if not exists public.game_instances (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  player_stats jsonb not null,
  status      text not null default 'active' check (status in ('active', 'concluded')),
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),

  -- Each user has at most one active game (enforced at upsert via onConflict:'user_id')
  -- If you want multiple concurrent games, remove this unique constraint.
  unique (user_id)
);

-- Row-level security: users can only read/write their own instance.
alter table public.game_instances enable row level security;

create policy "Users can view own instance"
  on public.game_instances for select
  using (auth.uid() = user_id);

create policy "Users can upsert own instance"
  on public.game_instances for insert
  with check (auth.uid() = user_id);

create policy "Users can update own instance"
  on public.game_instances for update
  using (auth.uid() = user_id);
