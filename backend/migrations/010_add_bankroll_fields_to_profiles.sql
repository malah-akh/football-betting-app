-- Add bankroll fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN starting_bankroll decimal default 1000,
ADD COLUMN currency text default 'EUR';
