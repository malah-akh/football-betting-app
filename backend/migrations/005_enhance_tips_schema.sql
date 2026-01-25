-- Add new columns for enhanced tip data
ALTER TABLE tips 
ADD COLUMN IF NOT EXISTS market TEXT NOT NULL DEFAULT 'Match Winner',
ADD COLUMN IF NOT EXISTS stake INTEGER NOT NULL DEFAULT 1 CHECK (stake >= 1 AND stake <= 10),
ADD COLUMN IF NOT EXISTS confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
ADD COLUMN IF NOT EXISTS bookmaker TEXT,
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}'::jsonb;

-- Comment on columns
COMMENT ON COLUMN tips.market IS 'The betting market (e.g., 1X2, Over/Under)';
COMMENT ON COLUMN tips.stake IS 'Stake recommendation from 1 to 10';
COMMENT ON COLUMN tips.confidence IS 'Confidence score from 0 to 100';
COMMENT ON COLUMN tips.content IS 'JSONB structure for detailed analysis, stats, etc.';
