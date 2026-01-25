export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          is_premium: boolean
          role: string
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_premium?: boolean
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_premium?: boolean
          role?: string
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          external_id: number
          start_time: string
          status: string
          home_team: Json
          away_team: Json
          league_id: number | null
          score: Json | null
          venue: string | null
          referee: string | null
          round: string | null
          home_form: string | null
          away_form: string | null
          raw_data: Json | null
          last_updated_at: string
        }
        Insert: {
          id?: string
          external_id: number
          start_time: string
          status: string
          home_team: Json
          away_team: Json
          league_id?: number | null
          score?: Json | null
          venue?: string | null
          referee?: string | null
          round?: string | null
          home_form?: string | null
          away_form?: string | null
          raw_data?: Json | null
          last_updated_at?: string
        }
        Update: {
          id?: string
          external_id?: number
          start_time?: string
          status?: string
          home_team?: Json
          away_team?: Json
          league_id?: number | null
          score?: Json | null
          venue?: string | null
          referee?: string | null
          round?: string | null
          home_form?: string | null
          away_form?: string | null
          raw_data?: Json | null
          last_updated_at?: string
        }
      }
      picks: {
        Row: {
          id: string
          user_id: string
          match_id: string
          selection: string
          odds: number
          stake: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_id: string
          selection: string
          odds: number
          stake?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_id?: string
          selection?: string
          odds?: number
          stake?: number
          status?: string
          created_at?: string
        }
      }
      tips: {
        Row: {
          id: string
          match_id: string
          selection: string
          odds: number
          analysis: string | null
          is_premium: boolean
          status: string
          created_at: string
          market: string
          stake: number
          confidence: number
          bookmaker: string | null
          content: Json
          real_probability: number | null
          value_edge: number | null
          closing_odds: number | null
          line: number | null
          side: string | null
          implied_probability: number | null
          roi: number | null
        }
        Insert: {
          id?: string
          match_id: string
          selection: string
          odds: number
          analysis?: string | null
          is_premium?: boolean
          status?: string
          created_at?: string
          market?: string
          stake?: number
          confidence?: number
          bookmaker?: string | null
          content?: Json
          real_probability?: number | null
          value_edge?: number | null
          closing_odds?: number | null
          line?: number | null
          side?: string | null
          implied_probability?: number | null
          roi?: number | null
        }
        Update: {
          id?: string
          match_id?: string
          selection?: string
          odds?: number
          analysis?: string | null
          is_premium?: boolean
          status?: string
          created_at?: string
          market?: string
          stake?: number
          confidence?: number
          bookmaker?: string | null
          content?: Json
          real_probability?: number | null
          value_edge?: number | null
          closing_odds?: number | null
          line?: number | null
          side?: string | null
          implied_probability?: number | null
          roi?: number | null
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          match_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_id?: string
          created_at?: string
        }
      }
    }
  }
}
