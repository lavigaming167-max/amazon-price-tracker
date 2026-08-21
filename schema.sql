-- Create waitlist table
create table waitlist (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  source text not null default 'direct',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable real-time (optional, but useful for development)
alter publication supabase_realtime add table waitlist;