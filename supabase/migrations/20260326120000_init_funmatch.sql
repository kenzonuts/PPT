-- Fun Match: players, teams, team_members + RLS + public roster RPC
-- Jalankan via Supabase CLI: supabase db push / link project, atau tempel di SQL Editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  riot_id text not null,
  rank text not null,
  contact text not null,
  availability text not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  constraint players_riot_id_key unique (riot_id)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  constraint team_members_one_team_per_player unique (player_id)
);

create index if not exists team_members_team_id_idx on public.team_members (team_id);
create index if not exists team_members_player_id_idx on public.team_members (player_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.players enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- Publik boleh mendaftar (insert saja; tidak boleh baca kolom sensitif langsung)
create policy "Allow anon insert players"
  on public.players
  for insert
  to anon
  with check (true);

-- Tanpa policy SELECT untuk anon pada players / teams / team_members:
-- akses baca publik hanya lewat fungsi SECURITY DEFINER di bawah.

-- ---------------------------------------------------------------------------
-- Roster publik (tanpa kontak / ketersediaan / catatan)
-- ---------------------------------------------------------------------------

create or replace function public.get_live_roster ()
returns table (
  membership_id uuid,
  team_id uuid,
  team_name text,
  team_created_at timestamptz,
  player_id uuid,
  player_name text,
  riot_id text,
  rank text
)
language sql
security definer
set search_path = public
as $$
  select
    tm.id,
    t.id,
    t.name,
    t.created_at,
    p.id,
    p.name,
    p.riot_id,
    p.rank
  from public.teams t
  left join public.team_members tm on tm.team_id = t.id
  left join public.players p on p.id = tm.player_id
  order by t.created_at asc nulls last, p.name asc nulls last;
$$;

revoke all on function public.get_live_roster () from public;
grant execute on function public.get_live_roster () to anon;
grant execute on function public.get_live_roster () to authenticated;

comment on function public.get_live_roster is
  'Pembagian tim untuk tampilan publik; hindari expose kolom sensitif players.';
