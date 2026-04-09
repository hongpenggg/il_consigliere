-- ============================================================
-- IL CONSIGLIERE - Seed public tables for existing auth users
-- Run in Supabase SQL Editor after migrations.
-- Idempotent: safe to re-run.
-- ============================================================

-- Ensure required extension exists
create extension if not exists "pgcrypto";

-- 1) user_progress defaults
insert into public.user_progress (
  user_id,
  player_stats,
  chapter,
  tutorial_completed,
  tutorial_phase,
  story_mode_started,
  story_chapter,
  story_step,
  story_path,
  story_world,
  resource_snapshot
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
  1,
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
  ),
  jsonb_build_object(
    'cash', 1200000,
    'racketsActive', 5,
    'racketsCompromised', 1,
    'soldiersAvailable', 12,
    'soldiersUnavailable', 2
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
  user_id, territory_id, influence, controller, updated_at
)
select u.id, t.territory_id, t.influence, t.controller, now()
from auth.users u
cross join (
  values
    ('t1', 88, 'Genovese'),
    ('t2', 45, 'Contested'),
    ('t3', 12, 'Moretti Clan'),
    ('t4', 60, 'Player'),
    ('t5', 75, 'Player'),
    ('t6', 55, 'Contested'),
    ('t7', 30, 'Capone Network')
) as t(territory_id, influence, controller)
on conflict (user_id, territory_id) do nothing;

-- 4) family_members defaults
insert into public.family_members (
  user_id, name, role, loyalty, status
)
select u.id, f.name, f.role, f.loyalty, f.status
from auth.users u
cross join (
  values
    ('Vincenzo Ricci', 'Informant / Capo', 85, 'active'),
    ('Mayor Moretti', 'Political Puppet', 42, 'active'),
    ('Carlo Esposito', 'Enforcer', 91, 'active'),
    ('Sofia Ricci', 'Intelligence Officer', 78, 'active')
) as f(name, role, loyalty, status)
where not exists (
  select 1
  from public.family_members fm
  where fm.user_id = u.id
    and fm.name = f.name
);

-- 5) saves default slot
insert into public.saves (
  user_id, slot_name, player_stats, chapter, play_time, created_at
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
  now()
from auth.users u
on conflict (user_id, slot_name) do nothing;

-- 6) minimal ledger seed
insert into public.ledger_entries (user_id, description, amount, type, created_at)
select u.id, 'Weekly Tribute – Sicily', 45200, 'tribute', now()
from auth.users u
where not exists (
  select 1
  from public.ledger_entries le
  where le.user_id = u.id
    and le.description = 'Weekly Tribute – Sicily'
);

-- 7) minimal story event seed
insert into public.story_events (user_id, content, choices, chapter, created_at)
select
  u.id,
  'Autumn 1947. The Don is sick, the Commission is circling, and the docks are contested.',
  jsonb_build_array(
    jsonb_build_object('id', 'A', 'text', 'Secure the docks quietly', 'label', 'Lower heat, slower gains'),
    jsonb_build_object('id', 'C', 'text', 'Escalate and intimidate rivals', 'label', 'Higher control, higher heat')
  ), 1,
  now()
from auth.users u
where not exists (
  select 1 from public.story_events se where se.user_id = u.id
);
