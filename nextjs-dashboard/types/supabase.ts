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
      flashcard_sets: {
        Row: {
          id: string
          title: string
          description: string | null
          slug: string
          user_id: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          slug: string
          user_id: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          slug?: string
          user_id?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      flashcards: {
        Row: {
          id: string
          question_text: string
          answer_text: string | null
          image_url: string | null
          order: number
          flashcard_set_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_text: string
          answer_text?: string | null
          image_url?: string | null
          order: number
          flashcard_set_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_text?: string
          answer_text?: string | null
          image_url?: string | null
          order?: number
          flashcard_set_id?: string
          created_at?: string
          updated_at?: string
        }
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
  }
} 