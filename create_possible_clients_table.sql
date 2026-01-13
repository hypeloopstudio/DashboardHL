-- Create the table for Potential Clients
create table if not exists "PosiblesClientes" (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  instagram_url text not null,
  status text check (status in ('Sin contactar', 'Contactado', 'Rechazado', 'Concretado')) default 'Sin contactar',
  username text,
  profile_pic_url text,
  scraped_data jsonb
);

-- Enable Row Level Security
alter table "PosiblesClientes" enable row level security;

-- Create a policy that allows everything for authenticated users
-- (Adjust this if you need stricter permissions)
create policy "Enable all for authenticated users" 
on "PosiblesClientes" 
for all 
to authenticated 
using (true) 
with check (true);
