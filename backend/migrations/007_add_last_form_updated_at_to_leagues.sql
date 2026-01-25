-- Add last_form_updated_at to leagues to track when we last fetched standings
alter table public.leagues
add column last_form_updated_at timestamp with time zone;
