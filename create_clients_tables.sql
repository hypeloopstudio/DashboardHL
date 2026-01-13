-- Create the Clients table
create table if not exists "Clients" (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text,
  phone text,
  website text,
  service_type text,
  amount_charged numeric,
  notes text
);

-- Create the ClientFiles table
create table if not exists "ClientFiles" (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references "Clients"(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size integer
);

-- Enable Row Level Security (safe to run multiple times)
alter table "Clients" enable row level security;
alter table "ClientFiles" enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Enable all for authenticated users" on "Clients";
drop policy if exists "Enable all for authenticated users" on "ClientFiles";

-- Policies for Clients
create policy "Enable all for authenticated users" 
on "Clients" 
for all 
to authenticated 
using (true) 
with check (true);

-- Policies for ClientFiles
create policy "Enable all for authenticated users" 
on "ClientFiles" 
for all 
to authenticated 
using (true) 
with check (true);
