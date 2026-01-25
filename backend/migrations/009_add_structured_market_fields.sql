-- Add structured market fields for better analytics and settlement
-- Migration: 009_add_structured_market_fields.sql

ALTER TABLE tips
ADD COLUMN IF NOT EXISTS line numeric,                -- For Over/Under (2.5) or Handicap (-1.5)
ADD COLUMN IF NOT EXISTS side text,                   -- 'Home', 'Over', 'Under', etc.
ADD COLUMN IF NOT EXISTS implied_probability numeric, -- 1 / Decimal Odds
ADD COLUMN IF NOT EXISTS roi numeric;                 -- (Return - Stake) / Stake * 100

-- Add comment explaining usage
COMMENT ON COLUMN tips.line IS 'The numerical line for the market (e.g., 2.5 for Over/Under, -0.5 for Handicap)';
COMMENT ON COLUMN tips.side IS 'The side of the bet selected (e.g., "Over", "Home", "Away")';
COMMENT ON COLUMN tips.implied_probability IS 'The probability implied by the bookmaker odds at release (1/Odds)';
COMMENT ON COLUMN tips.roi IS 'The Return on Investment percentage for this specific settled tip';
