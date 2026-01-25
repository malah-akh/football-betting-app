-- Add referee and round to matches table
ALTER TABLE public.matches
ADD COLUMN referee text,
ADD COLUMN round text;
