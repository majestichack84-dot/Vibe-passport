import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          location: string | null
          avatar_url: string | null
          tier: 'free' | 'pro'
          uploads_today: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      vibes: {
        Row: {
          id: string
          user_id: string
          audio_url: string
          photo_url: string
          vibe_type: 'peace' | 'joy' | 'chaos' | 'love' | 'tired' | 'hype'
          location: {
            city: string
            country_code: string
            latitude: number
            longitude: number
          }
          caption: string
          play_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['vibes']['Row'], 'id' | 'play_count' | 'created_at'>
        Update: Partial<Database['public']['Tables']['vibes']['Row']>
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          vibe_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['favorites']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['favorites']['Row']>
      }
    }
  }
}
