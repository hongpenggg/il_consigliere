import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_progress: {
        Row: {
          id: string
          user_id: string
          player_stats: Record<string, unknown>
          chapter: number
          created_at: string
          updated_at: string
        }
      }
      saves: {
        Row: {
          id: string
          user_id: string
          slot_name: string
          player_stats: Record<string, unknown>
          chapter: number
          created_at: string
        }
      }
      territories: {
        Row: {
          id: string
          user_id: string
          territory_id: string
          influence: number
          controller: string
          updated_at: string
        }
      }
      family_members: {
        Row: {
          id: string
          user_id: string
          name: string
          role: string
          loyalty: number
          status: string
        }
      }
      ledger_entries: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: number
          type: string
          created_at: string
        }
      }
      story_events: {
        Row: {
          id: string
          user_id: string
          content: string
          choices: Record<string, unknown>[]
          chapter: number
          created_at: string
        }
      }
    }
  }
}
