'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  username: string | null
  isLoading: boolean
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  username: null,
  isLoading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => false
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()

    if (!error && data) setUsername(data.username)
  }

const signUp = async (email: string, password: string, username: string) => {
  setIsLoading(true);
  try {
    // 1. First check if username exists
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('username', username);

    if (count && count > 0) {
      throw new Error('Username already taken');
    }

    // 2. Sign up with email/password
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (authError) throw authError;

    // 3. Create profile (simplified - no updated_at needed)
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username
          // Don't need to manually set created_at or updated_at
          // They'll be set automatically by the database
        });

      if (profileError) throw profileError;
      setUsername(username);
    }
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      if (user) await fetchUserProfile(user.id)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
        return false
      }
      setUser(null)
      setUsername(null)
      return true
    } catch (error) {
      console.error('Logout failed:', error)
      return false
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUsername(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      username,
      isLoading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)