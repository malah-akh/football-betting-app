-- Add value betting metrics to tips table
-- Supports the "Probability Thinking" core philosophy

ALTER TABLE tips 
ADD COLUMN IF NOT EXISTS real_probability DECIMAL CHECK (real_probability > 0 AND real_probability <= 1),
ADD COLUMN IF NOT EXISTS value_edge DECIMAL,
ADD COLUMN IF NOT EXISTS closing_odds DECIMAL;

COMMENT ON COLUMN tips.real_probability IS 'Our calculated probability derived from data (0.0 - 1.0)';
COMMENT ON COLUMN tips.value_edge IS 'The percentage specific edge calculated (e.g. 0.05 for 5%)';
COMMENT ON COLUMN tips.closing_odds IS 'The final odds when the market closed (for CLV tracking)';
