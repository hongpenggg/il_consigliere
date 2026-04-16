-- ============================================================
-- Audit logging table for security-relevant actions
-- ============================================================

create table if not exists public.audit_log (
  id uuid primary key default uuid_generate_v4(),
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

drop policy if exists "Users can insert their own audit logs" on public.audit_log;
create policy "Users can insert their own audit logs"
  on public.audit_log for insert
  with check (auth.uid() = user_id);
