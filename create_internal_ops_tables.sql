-- Internal Ops Tables

-- 1. InternalTasks (Task Board)
create table if not exists "InternalTasks" (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  column_id text not null check (column_id in ('todo', 'doing', 'done')),
  position integer default 0
);

-- 2. SharedAssets (Prompts, Passwords, Templates)
create table if not exists "SharedAssets" (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text not null check (type in ('prompts', 'passwords', 'templates')),
  title text not null, -- For Prompts/Templates titles, or Service name for Passwords
  content text, -- Prompt text, Password credentials, or Description
  link text -- For Templates or Tools
);

-- 3. UpdateLogs
create table if not exists "UpdateLogs" (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  user_email text -- To display who posted it
);

-- 4. InternalTools
create table if not exists "InternalTools" (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  link text not null
);

-- Enable RLS
alter table "InternalTasks" enable row level security;
alter table "SharedAssets" enable row level security;
alter table "UpdateLogs" enable row level security;
alter table "InternalTools" enable row level security;

-- Policies (Allow all for authenticated users)

-- InternalTasks
create policy "Enable all for authenticated users" on "InternalTasks"
  for all to authenticated
  using (true)
  with check (true);

-- SharedAssets
create policy "Enable all for authenticated users" on "SharedAssets"
  for all to authenticated
  using (true)
  with check (true);

-- UpdateLogs
create policy "Enable all for authenticated users" on "UpdateLogs"
  for all to authenticated
  using (true)
  with check (true);

-- InternalTools
create policy "Enable all for authenticated users" on "InternalTools"
  for all to authenticated
  using (true)
  with check (true);
