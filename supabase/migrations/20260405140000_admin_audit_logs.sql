-- Admin audit trail (service role only from app; no public policies)

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_email text not null,
  actor_display_name text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  changes jsonb not null default '{}'::jsonb
);

create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs (created_at desc);

alter table public.admin_audit_logs enable row level security;
