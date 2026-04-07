-- Multi-warehouse, service access gating, dimensional pricing, vendor-photos RLS, vendor approval gating

-- 1. vendor_warehouses
create table if not exists public.vendor_warehouses (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  address text not null,
  lat double precision,
  lng double precision,
  pincode text,
  is_primary boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_vendor_warehouses_vendor on public.vendor_warehouses(vendor_id);
alter table public.vendor_warehouses enable row level security;

drop policy if exists "vendor manages own warehouses" on public.vendor_warehouses;
create policy "vendor manages own warehouses" on public.vendor_warehouses
  for all to authenticated
  using (vendor_id = auth.uid())
  with check (vendor_id = auth.uid());

drop policy if exists "admin full warehouses" on public.vendor_warehouses;
create policy "admin full warehouses" on public.vendor_warehouses
  for all to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

drop policy if exists "public read warehouses" on public.vendor_warehouses;
create policy "public read warehouses" on public.vendor_warehouses
  for select to anon, authenticated using (true);

-- 2. vendor_service_access
create table if not exists public.vendor_service_access (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references auth.users(id) on delete cascade,
  service text not null check (service in ('rental','venue','crew','essentials')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_at timestamptz default now(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  unique (vendor_id, service)
);
alter table public.vendor_service_access enable row level security;

drop policy if exists "vendor reads own service access" on public.vendor_service_access;
create policy "vendor reads own service access" on public.vendor_service_access
  for select to authenticated using (vendor_id = auth.uid());

drop policy if exists "vendor requests service" on public.vendor_service_access;
create policy "vendor requests service" on public.vendor_service_access
  for insert to authenticated with check (vendor_id = auth.uid());

drop policy if exists "admin manages service access" on public.vendor_service_access;
create policy "admin manages service access" on public.vendor_service_access
  for all to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- 3. dimensional pricing on vendor_inventory
alter table public.vendor_inventory
  add column if not exists price_per_length numeric,
  add column if not exists price_per_width numeric,
  add column if not exists price_per_height numeric,
  add column if not exists max_length numeric,
  add column if not exists max_width numeric,
  add column if not exists max_height numeric;

-- 4. vendor-photos storage RLS (vendor folder = auth.uid())
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('vendor-photos','vendor-photos', true)
  on conflict (id) do nothing;
end $$;

drop policy if exists "vendor photos public read" on storage.objects;
create policy "vendor photos public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'vendor-photos');

drop policy if exists "vendor photos vendor insert" on storage.objects;
create policy "vendor photos vendor insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'vendor-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "vendor photos vendor update" on storage.objects;
create policy "vendor photos vendor update" on storage.objects
  for update to authenticated
  using (bucket_id = 'vendor-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "vendor photos vendor delete" on storage.objects;
create policy "vendor photos vendor delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'vendor-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- 5. default vendor_status to 'pending' for new vendors
alter table public.profiles alter column vendor_status set default 'pending';
