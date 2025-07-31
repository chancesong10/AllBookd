import { User } from "@supabase/supabase-js"

export interface AuthContextType {
  user: User | null
  username: string | null
  isLoading: boolean
  signUp: (email: string, password: string, username: string) => Promise<User | null>
  signIn: (email: string, password: string) => Promise<User | null>
  signOut: () => Promise<boolean>
}