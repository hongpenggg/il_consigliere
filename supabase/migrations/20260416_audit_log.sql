-- ============================================================
-- Audit logging table for security-relevant actions
-- ============================================================

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  resource text not null default 'unknown',
  outcome text not null check (outcome in ('success', 'failure', 'denied')),
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_log_user_id_created_at
  on public.audit_log using btree (user_id, created_at desc);

create index if not exists idx_audit_log_action_created_at
  on public.audit_log using btree (action, created_at desc);

alter table public.audit_log enable row level security;

drop policy if exists "Users can view their own audit logs" on public.audit_log;
create policy "Users can view their own audit logs"
  on public.audit_log for select
  using (auth.uid() = user_id);

create or replace function public.audit_log_table_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
begin
  target_user_id := coalesce(new.user_id, old.user_id);
  insert into public.audit_log (user_id, action, resource, outcome, metadata)
  values (
    target_user_id,
    lower(tg_table_name) || '_' || lower(tg_op),
    tg_table_name,
    'success',
    jsonb_build_object('operation', tg_op)
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_saves on public.saves;
create trigger trg_audit_saves
after insert or update or delete on public.saves
for each row execute function public.audit_log_table_change();

drop trigger if exists trg_audit_game_instances on public.game_instances;
create trigger trg_audit_game_instances
after insert or update or delete on public.game_instances
for each row execute function public.audit_log_table_change();

drop trigger if exists trg_audit_story_events on public.story_events;
create trigger trg_audit_story_events
after insert or update or delete on public.story_events
for each row execute function public.audit_log_table_change();

create or replace function public.audit_auth_users_change()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_log (user_id, action, resource, outcome, metadata)
    values (new.id, 'auth_sign_up', 'auth.users', 'success', '{}'::jsonb);
    return new;
  end if;

  if tg_op = 'UPDATE'
     and new.last_sign_in_at is distinct from old.last_sign_in_at
     and new.last_sign_in_at is not null then
    insert into public.audit_log (user_id, action, resource, outcome, metadata)
    values (new.id, 'auth_sign_in', 'auth.users', 'success', '{}'::jsonb);
  end if;

  return new;
end;
$$;

do $$
begin
  begin
    drop trigger if exists trg_audit_auth_users on auth.users;
    create trigger trg_audit_auth_users
    after insert or update on auth.users
    for each row execute function public.audit_auth_users_change();
  exception
    when insufficient_privilege then
      raise notice 'Skipping auth.users audit trigger due to insufficient privilege';
  end;
end;
$$;
