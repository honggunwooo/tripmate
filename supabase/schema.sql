-- TripMate anonymous demo storage.
-- These policies make saved trips visible and editable to anyone with the app URL.
-- Do not store personal or private information in this demo table.

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  city text not null,
  days integer not null check (days between 1 and 5),
  taste text not null default '',
  plan jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.trips enable row level security;

drop policy if exists "Anyone can read trips" on public.trips;
create policy "Anyone can read trips" on public.trips
  for select to anon using (true);

drop policy if exists "Anyone can save trips" on public.trips;
create policy "Anyone can save trips" on public.trips
  for insert to anon with check (true);

drop policy if exists "Anyone can edit trips" on public.trips;
create policy "Anyone can edit trips" on public.trips
  for update to anon using (true) with check (true);

drop policy if exists "Anyone can delete trips" on public.trips;
create policy "Anyone can delete trips" on public.trips
  for delete to anon using (true);

grant select, insert, update, delete on public.trips to anon;
