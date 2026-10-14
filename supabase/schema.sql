-- TripMate user accounts and private trip storage.

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  city text not null,
  days integer not null check (days between 1 and 5),
  taste text not null default '',
  plan jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.trips
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.trips enable row level security;

-- Remove the earlier anonymous demo policies if they were installed.
drop policy if exists "Anyone can read trips" on public.trips;
drop policy if exists "Anyone can save trips" on public.trips;
drop policy if exists "Anyone can edit trips" on public.trips;
drop policy if exists "Anyone can delete trips" on public.trips;

drop policy if exists "Users can read their trips" on public.trips;
create policy "Users can read their trips" on public.trips
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can save their trips" on public.trips;
create policy "Users can save their trips" on public.trips
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can edit their trips" on public.trips;
create policy "Users can edit their trips" on public.trips
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their trips" on public.trips;
create policy "Users can delete their trips" on public.trips
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.trips from anon;
grant select, insert, update, delete on public.trips to authenticated;
