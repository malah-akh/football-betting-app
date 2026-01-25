-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Linked to Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  is_premium boolean default false,
  role text default 'user', -- 'user' or 'admin'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LEAGUES
create table public.leagues (
  id serial primary key,
  external_id integer unique not null,
  name text not null,
  country text,
  logo_url text,
  is_active boolean default true
);

-- MATCHES
create table public.matches (
  id uuid default uuid_generate_v4() primary key,
  external_id integer unique not null,
  start_time timestamp with time zone not null,
  status text not null, -- 'SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED'
  home_team jsonb not null, -- { "id": 123, "name": "Chelsea", "logo": "url" }
  away_team jsonb not null, -- { "id": 456, "name": "Arsenal", "logo": "url" }
  league_id integer references public.leagues(external_id),
  score jsonb, -- { "home": 2, "away": 1 }
  raw_data jsonb, -- Full provider response for debugging
  last_updated_at timestamp with time zone default now()
);

-- ODDS (Simplified)
create table public.odds (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references public.matches(id) on delete cascade not null,
  provider text not null,
  home_win decimal,
  draw decimal,
  away_win decimal,
  updated_at timestamp with time zone default now()
);

-- PICKS (User Bets)
create table public.picks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  match_id uuid references public.matches(id) not null,
  selection text not null, -- 'HOME_WIN', 'DRAW', 'AWAY_WIN'
  odds decimal not null,
  stake decimal default 0,
  status text default 'PENDING', -- 'PENDING', 'WON', 'LOST', 'VOID'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES

-- Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Matches / Leagues / Odds (Public Read, Admin Write)
alter table public.matches enable row level security;
create policy "Matches are viewable by everyone." on public.matches for select using (true);
-- Note: Service Role (Backend) bypasses RLS, so explicit write policy isn't strictly needed if using Service Role key
-- but good for safety if we ever have admin users logging in.

alter table public.leagues enable row level security;
create policy "Leagues are viewable by everyone." on public.leagues for select using (true);

alter table public.odds enable row level security;
create policy "Odds are viewable by everyone." on public.odds for select using (true);

-- Picks (Private)
alter table public.picks enable row level security;
create policy "Users can view own picks." on public.picks for select using (auth.uid() = user_id);
create policy "Users can create picks." on public.picks for insert with check (auth.uid() = user_id);
create policy "Users can update own picks (e.g. stake)." on public.picks for update using (auth.uid() = user_id);

-- TRIGGER: Auto-create Profile on Signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- Create TIPS table for Admin Mission Control

create table public.tips (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references public.matches(id) not null,
  selection text not null, -- e.g. "Arsenal to Win", "Over 2.5 Goals"
  odds decimal not null,
  analysis text,
  is_premium boolean default true,
  status text default 'PENDING', -- 'PENDING', 'WON', 'LOST', 'VOID'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Tips
alter table public.tips enable row level security;

-- Everyone can view tips (filtering by is_premium will happen in frontend/backend logic, 
-- but strictly speaking, row level security might hide premium tips content if we wanted to result to strict security. 
-- For now, "Public tips are viewable by everyone" is easier, and we hide content in UI if user is not premium).
create policy "Tips are viewable by everyone." on public.tips for select using (true);

-- Only admins can insert/update/delete tips. 
-- Note: 'admin' role check relies on the user's profile role.
create policy "Admins can manage tips." on public.tips for all using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
// Drop existing policy if it exists (for idempotency)
drop policy if exists "Admins can manage tips." on public.tips;

// Re-create policy to ensure it's not recursive or causing deadlocks
create policy "Admins can manage tips." on public.tips for all using (
  auth.uid() in (
    select id from public.profiles where role = 'admin'
  )
);
