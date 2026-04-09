-- ============================================================
-- IL CONSIGLIERE - Campaign content expansion seed
-- Run in Supabase SQL Editor after base migrations.
-- Idempotent: safe to re-run.
-- ============================================================

create extension if not exists "pgcrypto";

-- 1) Expanded cast / characters (family_members)
insert into public.family_members (user_id, name, role, loyalty, status)
select
  u.id,
  c.name,
  c.role,
  c.loyalty,
  c.status
from auth.users u
cross join (
  values
    ('Tommaso "The Notary" Bellini', 'Consigliere Archivist', 84, 'active'),
    ('Lucia Greco', 'Union Liaison', 73, 'active'),
    ('Raffaele Conti', 'Dock Boss', 66, 'active'),
    ('Bianca Rinaldi', 'Treasury Keeper', 81, 'active'),
    ('Father Angelo Vitale', 'Church Broker', 62, 'active'),
    ('Giorgio Mancini', 'Counter-Intel Specialist', 77, 'active'),
    ('Isabella Moretti', 'City Hall Intermediary', 58, 'active'),
    ('Paolo "Ash" Ferraro', 'Arson & Sabotage Crew Lead', 70, 'active'),
    ('Domenico Serra', 'Smuggling Quartermaster', 75, 'active'),
    ('Elena Bardi', 'Press Whisperer', 64, 'active')
) as c(name, role, loyalty, status)
where not exists (
  select 1
  from public.family_members fm
  where fm.user_id = u.id
    and fm.name = c.name
);

-- 2) Expanded ledger timeline
insert into public.ledger_entries (user_id, description, amount, type, created_at)
select
  u.id,
  l.description,
  l.amount,
  l.type::text,
  now() - l.offset_interval
from auth.users u
cross join (
  values
    ('Dock Protection Collections', 132500, 'income', interval '13 days'),
    ('Judicial "Facilitation" Payment', -28500, 'bribe', interval '12 days'),
    ('Back Taxes Settled Through Front Company', -19000, 'expense', interval '11 days'),
    ('Night Ferry Smuggling Cut', 84500, 'income', interval '10 days'),
    ('Tribute to Commission Delegation', -52000, 'tribute', interval '9 days'),
    ('Warehouse Fire Compensation', -16500, 'expense', interval '8 days'),
    ('Casino Route Revenue Share', 109000, 'income', interval '7 days'),
    ('Councilman Election "Support"', -34000, 'bribe', interval '6 days'),
    ('Recovered Debt from South Wharf', 47000, 'income', interval '5 days'),
    ('Emergency Legal Defense Fund', -26000, 'expense', interval '4 days'),
    ('Tribute from Palermo Cell', 61500, 'tribute', interval '3 days'),
    ('Black Market Medicine Margin', 38400, 'income', interval '2 days')
) as l(description, amount, type, offset_interval)
where not exists (
  select 1
  from public.ledger_entries le
  where le.user_id = u.id
    and le.description = l.description
    and le.amount = l.amount
    and le.type = l.type::text
);

-- 3) Expanded story campaign events (Suzerain-style branching prompts)
insert into public.story_events (user_id, content, choices, chapter, created_at)
select
  u.id,
  e.content,
  e.choices::jsonb,
  e.chapter,
  now() - e.offset_interval
from auth.users u
cross join (
  values
    (
      1,
      'Chapter 1 — The wake ends at dawn. Don Salvatore leaves you a sealed instruction: secure the docks before the Commission appoints a caretaker.',
      jsonb_build_array(
        jsonb_build_object('id', 'A', 'text', 'Cut a quiet deal with union stewards', 'label', 'Lower heat, slower control'),
        jsonb_build_object('id', 'B', 'text', 'Send enforcers to clear rival crews tonight', 'label', 'Fast control, high risk'),
        jsonb_build_object('id', 'C', 'text', 'Invite City Hall to mediate publicly', 'label', 'Political cover, costly favors')
      ),
      interval '12 days'
    ),
    (
      1,
      'Chapter 1 — A journalist prints your family name beside a murdered dock foreman. Your allies demand a response before noon.',
      jsonb_build_array(
        jsonb_build_object('id', 'A', 'text', 'Bribe the editor and bury the second edition', 'label', 'Cash loss, narrative control'),
        jsonb_build_object('id', 'B', 'text', 'Leak evidence blaming the Moretti clan', 'label', 'Rival pressure, credibility risk'),
        jsonb_build_object('id', 'C', 'text', 'Hold a public funeral and deny involvement', 'label', 'Legitimacy gain, uncertain outcome')
      ),
      interval '11 days'
    ),
    (
      2,
      'Chapter 2 — The Commission convenes in Naples. Three families question whether you should remain acting consigliere.',
      jsonb_build_array(
        jsonb_build_object('id', 'A', 'text', 'Offer tribute and request six months of autonomy', 'label', 'Stability now, future debt'),
        jsonb_build_object('id', 'B', 'text', 'Threaten to expose their offshore books', 'label', 'Power play, trust collapse'),
        jsonb_build_object('id', 'C', 'text', 'Propose a shared customs corridor', 'label', 'Diplomatic route, slower gains')
      ),
      interval '10 days'
    ),
    (
      2,
      'Chapter 2 — Your dock boss reports that military surplus is moving through your routes. The army captain wants deniability and a higher cut.',
      jsonb_build_array(
        jsonb_build_object('id', 'A', 'text', 'Accept his terms and secure escorts', 'label', 'Revenue gain, legal exposure'),
        jsonb_build_object('id', 'B', 'text', 'Replace him with your own loyal officer', 'label', 'Control gain, coup risk'),
        jsonb_build_object('id', 'C', 'text', 'Sabotage the shipment and blame communists', 'label', 'Heat spike, strategic reset')
      ),
      interval '9 days'
    ),
    (
      3,
      'Chapter 3 — A trusted captain confesses he has a gambling debt to the rival Vitale family. He begs for forgiveness and one last chance.',
      jsonb_build_array(
        jsonb_build_object('id', 'A', 'text', 'Cover the debt and bind him with favors', 'label', 'Loyalty gamble'),
        jsonb_build_object('id', 'B', 'text', 'Demote him publicly to set an example', 'label', 'Discipline gain, resentment'),
        jsonb_build_object('id', 'C', 'text', 'Turn him into a double agent', 'label', 'Intel gain, betrayal risk')
      ),
      interval '8 days'
    ),
    (
      3,
      'Chapter 3 — City Hall prepares an anti-corruption task force. Your name is absent, but your shell companies are not.',
      jsonb_build_array(
        jsonb_build_object('id', 'A', 'text', 'Sacrifice one company to protect the network', 'label', 'Short-term loss, long-term safety'),
        jsonb_build_object('id', 'B', 'text', 'Bribe the task force chief', 'label', 'Expensive silence'),
        jsonb_build_object('id', 'C', 'text', 'Mobilize union protests against the task force', 'label', 'Public pressure, media scrutiny')
      ),
      interval '7 days'
    ),
    (
      4,
      'Chapter 4 — Winter famine pushes desperate families toward your warehouses. Soldiers ask whether to open stores for free.',
      jsonb_build_array(
        jsonb_build_object('id', 'A', 'text', 'Distribute food and earn public goodwill', 'label', 'Goodwill up, cash down'),
        jsonb_build_object('id', 'B', 'text', 'Sell at a premium through intermediaries', 'label', 'Cash up, unrest risk'),
        jsonb_build_object('id', 'C', 'text', 'Prioritize only loyal neighborhoods', 'label', 'Faction loyalty up, city division')
      ),
      interval '6 days'
    ),
    (
      4,
      'Chapter 4 — The Vatican envoy offers legitimacy if you stop narcotics at the port. Your treasury warns this will halve income.',
      jsonb_build_array(
        jsonb_build_object('id', 'A', 'text', 'Accept the moral bargain', 'label', 'Legitimacy up, revenue down'),
        jsonb_build_object('id', 'B', 'text', 'Feign compliance and reroute shipments offshore', 'label', 'Balanced deception'),
        jsonb_build_object('id', 'C', 'text', 'Reject the envoy and double down on routes', 'label', 'Profit up, condemnation risk')
      ),
      interval '5 days'
    ),
    (
      5,
      'Chapter 5 — Intelligence confirms a planned assassination during your niece''s wedding. Cancelling the ceremony would look weak.',
      jsonb_build_array(
        jsonb_build_object('id', 'A', 'text', 'Proceed with layered security and decoys', 'label', 'Prestige maintained, casualties possible'),
        jsonb_build_object('id', 'B', 'text', 'Move the ceremony to a hidden chapel', 'label', 'Safety first, gossip surge'),
        jsonb_build_object('id', 'C', 'text', 'Stage a trap to eliminate rival shooters', 'label', 'Decisive strike, blood feud')
      ),
      interval '4 days'
    ),
    (
      5,
      'Chapter 5 — Your consigliere council splits: one bloc wants reform and legal fronts, the other demands expansion by force.',
      jsonb_build_array(
        jsonb_build_object('id', 'A', 'text', 'Announce a reform charter and legal transition', 'label', 'Modernization path'),
        jsonb_build_object('id', 'B', 'text', 'Fund a military push into rival districts', 'label', 'Empire path'),
        jsonb_build_object('id', 'C', 'text', 'Balance both through a dual command structure', 'label', 'Complex governance path')
      ),
      interval '3 days'
    ),
    (
      6,
      'Chapter 6 — Final Session. The Commission demands your doctrine for the next decade: fear, law, or family.',
      jsonb_build_array(
        jsonb_build_object('id', 'A', 'text', 'Fear: centralize violence under your seal', 'label', 'Tyrant ending trajectory'),
        jsonb_build_object('id', 'B', 'text', 'Law: convert power into institutions', 'label', 'Statesman ending trajectory'),
        jsonb_build_object('id', 'C', 'text', 'Family: decentralize and preserve tradition', 'label', 'Patriarch ending trajectory')
      ),
      interval '2 days'
    ),
    (
      6,
      'Epilogue Trigger — A sealed ledger surfaces naming every favor traded in your rise. Burn it, publish it, or auction it.',
      jsonb_build_array(
        jsonb_build_object('id', 'A', 'text', 'Burn it and erase the trail', 'label', 'Legacy protected, truth buried'),
        jsonb_build_object('id', 'B', 'text', 'Publish it and face judgment', 'label', 'Moral reckoning'),
        jsonb_build_object('id', 'C', 'text', 'Auction it to foreign intelligence', 'label', 'Power preserved, sovereignty lost')
      ),
      interval '1 day'
    )
) as e(chapter, content, choices, offset_interval)
where not exists (
  select 1
  from public.story_events se
  where se.user_id = u.id
    and se.chapter = e.chapter
    and se.content = e.content
);

-- 4) Realtime right-sizing recommendation:
-- Keep realtime only where live push UX exists.
-- Current app subscribes to: story_events, ledger_entries.
-- Optional: keep territories if/when live territory conflict updates are added.
do $$
begin
  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'family_members'
  ) then
    alter publication supabase_realtime drop table public.family_members;
  end if;

  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'territories'
  ) then
    alter publication supabase_realtime drop table public.territories;
  end if;

  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'saves'
  ) then
    alter publication supabase_realtime drop table public.saves;
  end if;

  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_progress'
  ) then
    alter publication supabase_realtime drop table public.user_progress;
  end if;

  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'game_instances'
  ) then
    alter publication supabase_realtime drop table public.game_instances;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'story_events'
  ) then
    alter publication supabase_realtime add table public.story_events;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ledger_entries'
  ) then
    alter publication supabase_realtime add table public.ledger_entries;
  end if;
end;
$$;
