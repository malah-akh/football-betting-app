
-- FAVORITES
create table public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  match_id uuid references public.matches(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, match_id)
);

-- Favorites RLS
alter table public.favorites enable row level security;
create policy "Users can view own favorites." on public.favorites for select using (auth.uid() = user_id);
create policy "Users can add favorites." on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can remove favorites." on public.favorites for delete using (auth.uid() = user_id);
