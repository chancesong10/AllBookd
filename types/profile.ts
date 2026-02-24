import { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  username: string
  email: string
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at?: string
}

export interface WishlistItem {
  id: string
  user_id: string
  book_id: string
  title: string
  authors: string | null
  thumbnail: string | null
  created_at: string
}

export interface List {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface ListItem {
  id: string
  list_id: string
  user_id: string
  book_id: string
  title: string
  authors: any
  thumbnail: string | null
  created_at: string
  lists?: {
    name: string
  }
}

export interface ProfileContentProps {
  user: User
}