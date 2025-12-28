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
          username: string | null
          avatar_url: string | null
          total_playtime_seconds: number
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          total_playtime_seconds?: number
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          total_playtime_seconds?: number
          created_at?: string
        }
      }
      games: {
        Row: {
          id: string
          title: string
          console_type: 'SNES' | 'MEGA_DRIVE' | 'GBA'
          rom_url: string
          cover_url: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          console_type: string
          rom_url: string
          cover_url: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          console_type?: string
          rom_url?: string
          cover_url?: string
          description?: string | null
          created_at?: string
        }
      }
      user_saves: {
        Row: {
          id: string
          user_id: string
          game_id: string
          save_file_url: string
          last_played_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          save_file_url: string
          last_played_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          save_file_url?: string
          last_played_at?: string
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          title: string
          description: string
          icon: string
          metric_type: string
          threshold: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon: string
          metric_type: string
          threshold: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string
          metric_type?: string
          threshold?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
          is_featured: boolean
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
          is_featured?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
          is_featured?: boolean
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          game_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          created_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          game_id: string
          console_type: string
          started_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          console_type: string
          started_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          console_type?: string
          started_at?: string
          created_at?: string
        }
      }
    }
  }
}