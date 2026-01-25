import { z } from "zod";

/**
 * Validates the structure of a match coming from the internal DB
 * This ensures strict typing when reading from Supabase
 */
export const InternalMatchSchema = z.object({
  id: z.string().uuid(),
  external_id: z.number().int(),
  start_time: z.string().datetime(),
  status: z.string(),
  venue: z.object({
    id: z.number().nullable(),
    name: z.string().nullable(),
    city: z.string().nullable()
  }).optional().nullable(),
  referee: z.string().nullable().optional(),
  round: z.string().nullable().optional(),
  home_form: z.string().nullable().optional(),
  away_form: z.string().nullable().optional(),
  league_id: z.number().int().optional(),
  home_team: z.object({
    id: z.number(),
    name: z.string(),
    logo: z.string().url()
  }),
  away_team: z.object({
    id: z.number(),
    name: z.string(),
    logo: z.string().url()
  }),
  score: z.object({
    home: z.number().nullable(),
    away: z.number().nullable()
  }).nullable().optional(),
  last_updated_at: z.string().datetime()
});

export type InternalMatch = z.infer<typeof InternalMatchSchema>;

/**
 * Schema for converting ExternalMatch to our DB format
 * Not strictly a validation of external API (which can vary), but a normalization target.
 */
export const InsertMatchSchema = z.object({
  external_id: z.number().int(),
  start_time: z.string(),
  status: z.string(),
  venue: z.object({
    id: z.number().nullable(),
    name: z.string().nullable(),
    city: z.string().nullable()
  }).optional().nullable(),
  home_form: z.string().nullable().optional(),
  away_form: z.string().nullable().optional(),
  referee: z.string().nullable().optional(),
  round: z.string().nullable().optional(),
  league_id: z.number().int(),
  home_team: z.object({
    id: z.number(),
    name: z.string(),
    logo: z.string()
  }),
  away_team: z.object({
    id: z.number(),
    name: z.string(),
    logo: z.string()
  }),
  score: z.object({
    home: z.number().nullable(),
    away: z.number().nullable()
  }),
  raw_data: z.any(),
  last_updated_at: z.string().datetime().optional()
});

export type InsertMatch = z.infer<typeof InsertMatchSchema>;

/**
 * Validates a Tip to ensure it meets our "Value Betting" criteria.
 */
export const TipSchema = z.object({
  id: z.string().uuid().optional(), // Optional for inserts
  match_id: z.string().uuid(),
  market: z.enum(["1X2", "Over/Under", "BTTS", "Asian Handicap", "Double Chance"]),
  selection: z.string().min(1),
  odds: z.number().positive(),
  
  // Money Management
  stake: z.number().int().min(1).max(10),
  
  // The Edge logic
  confidence: z.number().int().min(0).max(100),
  real_probability: z.number().min(0).max(1).optional(), // Optional initially, but recommended
  value_edge: z.number().optional(),
  
  // Content
  analysis: z.string().min(10, "Analysis must be substantive"), // Enforce explanation
  bookmaker: z.string().optional(),
  is_premium: z.boolean().default(true),
  status: z.enum(['PENDING', 'WON', 'LOST', 'VOID']).default('PENDING'),
  created_at: z.string().datetime().optional()
});

export type Tip = z.infer<typeof TipSchema>;
