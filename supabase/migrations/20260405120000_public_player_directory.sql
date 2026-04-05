-- Daftar pemain untuk publik: hanya nama & kontak (tanpa rank, riot_id, catatan).

create or replace function public.get_public_player_directory ()
returns table (
  id uuid,
  name text,
  contact text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.name,
    p.contact,
    p.created_at
  from public.players p
  order by p.created_at asc;
$$;

revoke all on function public.get_public_player_directory () from public;
grant execute on function public.get_public_player_directory () to anon;
grant execute on function public.get_public_player_directory () to authenticated;

comment on function public.get_public_player_directory is
  'Daftar seluruh pemain terdaftar untuk tampilan publik: nama dan kontak saja.';
