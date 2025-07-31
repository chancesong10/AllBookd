'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { AuthContextType } from '@/types/auth'

const AuthContext = createContext<AuthContextType>({
  user: null,
  username: null,
  isLoading: true,
  signUp: async () => null,
  signIn: async () => null,
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

const signUp = async (email: string, password: string, username: string): Promise<User | null> => {
  setIsLoading(true);
  try {
    // 1. Normalize inputs
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();

    // 2. Check username availability
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('username', trimmedUsername);

    if (countError) throw countError;
    if (count) throw new Error('Username already taken');

    // 3. Create auth user (THIS MUST HAPPEN FIRST)
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: password.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { username: trimmedUsername } // Store username in auth metadata
      }
    });

    if (authError || !user) throw authError || new Error('User creation failed');

    // 4. Create profile WITH RETRY LOGIC (in case of timing issues)
    let retries = 3;
    while (retries > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id, // CRITICAL: Must match auth user ID
          email: normalizedEmail,
          username: trimmedUsername
        });

      if (!profileError) break; // Success!
      
      retries--;
      if (retries === 0) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(user.id);
        throw new Error('Failed to create profile after 3 attempts');
      }
      await new Promise(resolve => setTimeout(resolve, 300)); // Wait 300ms before retry
    }

    return user;
  } catch (error: unknown) {
    console.error('Signup error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Signup failed'
    );
  } finally {
    setIsLoading(false);
  }
};

const signIn = async (email: string, password: string): Promise<User | null> => {
  setIsLoading(true);
  try {
    // Normalize email and trim password
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Debug logging (remove in production)
    console.log('Attempting login with:', {
      email: normalizedEmail,
      passwordLength: trimmedPassword.length
    });

    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: trimmedPassword
    });

    if (error || !user) {
      // Enhanced error logging
      console.error('Login failed:', {
        error,
        userExists: !!user,
        emailConfirmed: user?.email_confirmed_at
      });
      throw error || new Error('Login failed');
    }

    // Verify email confirmation
    if (!user.email_confirmed_at) {
      // Resend confirmation email if not verified
      await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail
      });
      throw new Error('Email not verified - new verification sent');
    }

    // Check profile consistency
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile missing:', profileError);
      await supabase.auth.signOut();
      throw new Error('User profile missing - please contact support');
    }

    setUser(user);
    setUsername(profile.username);
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

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
  let mounted = true

  const getSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('Session error:', error)
    } finally {
      if (mounted) setIsLoading(false)
    }
  }

  getSession()

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
    }
  )

  return () => {
    mounted = false
    subscription?.unsubscribe()
  }
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