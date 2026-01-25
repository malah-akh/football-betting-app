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
