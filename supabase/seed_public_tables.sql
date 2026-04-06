-- ============================================================
-- IL CONSIGLIERE — Seed public tables for existing auth users
-- Run in Supabase SQL Editor after migrations.
-- Idempotent: safe to re-run.
-- ============================================================

-- Ensure required extension exists
create extension if not exists "pgcrypto";

-- 1) user_progress defaults
insert into public.user_progress (
  user_id,
  current_chapter,
  total_play_time,
  last_active,
  tutorial_completed,
  tutorial_phase,
  story_mode_started,
  story_chapter,
  story_step,
  story_path,
  story_world
)
select
  u.id,
  1,
  0,
  now(),
  false,
  'chapter0',
  false,
  1,
  0,
  '[]'::jsonb,
  jsonb_build_object(
    'world', 'Italy',
    'city', 'Sicily',
    'year', 1947,
    'season', 'Fall',
    'factions', jsonb_build_object(
      'familyLoyalty', 68,
      'donTrust', 62,
      'rivalTension', 55,
      'rivalRespect', 40,
      'commissionStanding', 48,
      'cityHallInfluence', 37,
      'cityHallExposure', 34,
      'lawHeat', 46,
      'notoriety', 44,
      'streetFear', 52,
      'streetGoodwill', 33
    ),
    'resources', jsonb_build_object(
      'cash', 1200000,
      'racketsActive', 5,
      'racketsCompromised', 1,
      'soldiersAvailable', 12,
      'soldiersUnavailable', 2,
      'favorsOwed', jsonb_build_array('Dock foreman in Red Hook'),
      'favorsHeld', jsonb_build_array('Ledger on Ward Boss Deluca')
    ),
    'philosophy', jsonb_build_object(
      'oldCodeVsNewBlood', 0,
      'violenceVsPolitics', 0,
      'familyFirstVsEmpireFirst', 0,
      'honorVsPragmatism', 0
    )
  )
from auth.users u
on conflict (user_id) do nothing;

-- 2) game_instances default snapshot (if missing)
insert into public.game_instances (
  user_id,
  player_stats,
  status,
  progress_snapshot,
  created_at,
  updated_at
)
select
  u.id,
  jsonb_build_object(
    'id', gen_random_uuid()::text,
    'name', 'Consigliere',
    'familyName', 'Corleone',
    'territory', 'italy',
    'affiliation', 'famiglia_del_brenta',
    'rank', 'Soldato',
    'wealth', 1200000,
    'loyalty', 75,
    'suspicion', 20,
    'heat', 30,
    'soldiers', 12,
    'territoryControl', 35,
    'diplomacy', 40
  ),
  'active',
  jsonb_build_object(
    'tutorialCompleted', false,
    'tutorialPhase', 'chapter0',
    'storyModeStarted', false,
    'storyChapter', 1,
    'storyStep', 0,
    'storyPath', jsonb_build_array(),
    'storyEnding', null
  ),
  now(),
  now()
from auth.users u
on conflict (user_id) do nothing;

-- 3) territories defaults
insert into public.territories (
  user_id, territory_key, influence, controller, weekly_income, resistance_level, updated_at
)
select u.id, t.territory_key, t.influence, t.controller, t.weekly_income, t.resistance_level, now()
from auth.users u
cross join (
  values
    ('t1', 88, 'Genovese', 45200, 2),
    ('t2', 45, 'Contested', 28000, 3),
    ('t3', 12, 'Moretti Clan', 12000, 5),
    ('t4', 60, 'Player', 38000, 2),
    ('t5', 75, 'Player', 85000, 3),
    ('t6', 55, 'Contested', 42000, 3),
    ('t7', 30, 'Capone Network', 65000, 4)
) as t(territory_key, influence, controller, weekly_income, resistance_level)
on conflict (user_id, territory_key) do nothing;

-- 4) family_members defaults
insert into public.family_members (
  user_id, member_key, loyalty, familiarity, status, updated_at
)
select u.id, f.member_key, f.loyalty, f.familiarity, f.status, now()
from auth.users u
cross join (
  values
    ('f1', 85, 25, 'active'),
    ('f2', 42, 60, 'active'),
    ('f3', 91, 80, 'active'),
    ('f4', 78, 55, 'active')
) as f(member_key, loyalty, familiarity, status)
on conflict (user_id, member_key) do nothing;

-- 5) saves default slot
insert into public.saves (
  user_id, slot_name, player_stats, chapter, play_time, created_at, updated_at
)
select
  u.id,
  'Autosave',
  jsonb_build_object(
    'id', gen_random_uuid()::text,
    'name', 'Consigliere',
    'familyName', 'Corleone',
    'territory', 'italy',
    'affiliation', 'famiglia_del_brenta',
    'rank', 'Soldato',
    'wealth', 1200000,
    'loyalty', 75,
    'suspicion', 20,
    'heat', 30,
    'soldiers', 12,
    'territoryControl', 35,
    'diplomacy', 40
  ),
  1,
  0,
  now(),
  now()
from auth.users u
on conflict do nothing;

-- 6) minimal ledger seed
insert into public.ledger_entries (user_id, description, amount, type, territory, created_at)
select u.id, 'Weekly Tribute – Sicily', 45200, 'tribute', 'Sicily', now()
from auth.users u
where not exists (
  select 1 from public.ledger_entries le where le.user_id = u.id
);

-- 7) minimal story event seed
insert into public.story_events (user_id, content, choices, chapter, speaker, dialogue, created_at)
select
  u.id,
  'Autumn 1947. The Don is sick, the Commission is circling, and the docks are contested.',
  jsonb_build_array(
    jsonb_build_object('id', 'A', 'text', 'Secure the docks quietly', 'label', 'Lower heat, slower gains'),
    jsonb_build_object('id', 'C', 'text', 'Escalate and intimidate rivals', 'label', 'Higher control, higher heat')
  ),
  1,
  'Command Center',
  'Begin your first counsel.',
  now()
from auth.users u
where not exists (
  select 1 from public.story_events se where se.user_id = u.id
);
