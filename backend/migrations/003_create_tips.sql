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
