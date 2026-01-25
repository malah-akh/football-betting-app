export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string
          id: string
          match_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          country: string | null
          external_id: number
          id: number
          is_active: boolean | null
          last_form_updated_at: string | null
          logo_url: string | null
          name: string
        }
        Insert: {
          country?: string | null
          external_id: number
          id?: number
          is_active?: boolean | null
          last_form_updated_at?: string | null
          logo_url?: string | null
          name: string
        }
        Update: {
          country?: string | null
          external_id?: number
          id?: number
          is_active?: boolean | null
          last_form_updated_at?: string | null
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_form: string | null
          away_team: Json
          external_id: number
          home_form: string | null
          home_team: Json
          id: string
          last_updated_at: string | null
          league_id: number | null
          raw_data: Json | null
          referee: string | null
          round: string | null
          score: Json | null
          start_time: string
          status: string
          venue: Json | null
        }
        Insert: {
          away_form?: string | null
          away_team: Json
          external_id: number
          home_form?: string | null
          home_team: Json
          id?: string
          last_updated_at?: string | null
          league_id?: number | null
          raw_data?: Json | null
          referee?: string | null
          round?: string | null
          score?: Json | null
          start_time: string
          status: string
          venue?: Json | null
        }
        Update: {
          away_form?: string | null
          away_team?: Json
          external_id?: number
          home_form?: string | null
          home_team?: Json
          id?: string
          last_updated_at?: string | null
          league_id?: number | null
          raw_data?: Json | null
          referee?: string | null
          round?: string | null
          score?: Json | null
          start_time?: string
          status?: string
          venue?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["external_id"]
          },
        ]
      }
      odds: {
        Row: {
          away_win: number | null
          draw: number | null
          home_win: number | null
          id: string
          match_id: string
          provider: string
          updated_at: string | null
        }
        Insert: {
          away_win?: number | null
          draw?: number | null
          home_win?: number | null
          id?: string
          match_id: string
          provider: string
          updated_at?: string | null
        }
        Update: {
          away_win?: number | null
          draw?: number | null
          home_win?: number | null
          id?: string
          match_id?: string
          provider?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "odds_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      picks: {
        Row: {
          created_at: string
          id: string
          match_id: string
          odds: number
          selection: string
          stake: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          odds: number
          selection: string
          stake?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          odds?: number
          selection?: string
          stake?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "picks_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          currency: string | null
          email: string | null
          full_name: string | null
          id: string
          is_premium: boolean | null
          role: string | null
          starting_bankroll: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          current_period_end: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_premium?: boolean | null
          role?: string | null
          starting_bankroll?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_premium?: boolean | null
          role?: string | null
          starting_bankroll?: number | null
        }
        Relationships: []
      }
      tips: {
        Row: {
          analysis: string | null
          bookmaker: string | null
          closing_odds: number | null
          confidence: number
          content: Json | null
          created_at: string
          id: string
          implied_probability: number | null
          is_premium: boolean | null
          line: number | null
          market: string
          match_id: string
          odds: number
          real_probability: number | null
          roi: number | null
          selection: string
          side: string | null
          stake: number
          status: string | null
          value_edge: number | null
        }
        Insert: {
          analysis?: string | null
          bookmaker?: string | null
          closing_odds?: number | null
          confidence?: number
          content?: Json | null
          created_at?: string
          id?: string
          implied_probability?: number | null
          is_premium?: boolean | null
          line?: number | null
          market?: string
          match_id: string
          odds: number
          real_probability?: number | null
          roi?: number | null
          selection: string
          side?: string | null
          stake?: number
          status?: string | null
          value_edge?: number | null
        }
        Update: {
          analysis?: string | null
          bookmaker?: string | null
          closing_odds?: number | null
          confidence?: number
          content?: Json | null
          created_at?: string
          id?: string
          implied_probability?: number | null
          is_premium?: boolean | null
          line?: number | null
          market?: string
          match_id?: string
          odds?: number
          real_probability?: number | null
          roi?: number | null
          selection?: string
          side?: string | null
          stake?: number
          status?: string | null
          value_edge?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tips_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
