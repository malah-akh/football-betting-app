-- Add form columns to matches table
ALTER TABLE public.matches
ADD COLUMN home_form text, -- e.g. "WWDLW"
ADD COLUMN away_form text; -- e.g. "LLDWL"
