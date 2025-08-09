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

  const persistAuthState = (user: User | null) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('sb:user', JSON.stringify({
          user,
          expiresAt: Date.now() + 3600 * 1000 
        }))
      } else {
        localStorage.removeItem('sb:user')
      }
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setUsername(data.username)
        return data.username
      }
      return null
    } catch (error) {
      console.error('Profile fetch error:', error)
      return null
    }
  }

  const signUp = async (email: string, password: string, username: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { username }
        }
      });

      if (error || !user) throw error || new Error('Signup failed');

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          username
        });

      if (profileError) throw profileError;

      persistAuthState(user);
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error || !user) throw error || new Error('Login failed');

      const username = await fetchUserProfile(user.id);
      persistAuthState(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

const signOut = async (): Promise<boolean> => {
  setIsLoading(true);
  try {
    // 1. First clear Supabase auth session
    const { error } = await supabase.auth.signOut();
    
    // 2. Then clear local state
    setUser(null);
    setUsername(null);
    
    // 3. Clean up storage carefully
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb:user');
      // Clear specific Supabase tokens
      localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`);
      document.cookie = 'sb-auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    // Ensure state is cleared even if Supabase fails
    setUser(null);
    setUsername(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb:user');
    }
    return false;
  } finally {
    setIsLoading(false);
  }
};


    useEffect(() => {
      let mounted = true;
      let subscription: any;

      const initializeAuth = async () => {

        if (typeof window !== 'undefined') {
          const savedSession = localStorage.getItem('sb:user');
          if (savedSession) {
            try {
              const { user, expiresAt } = JSON.parse(savedSession);
              if (expiresAt > Date.now()) {
                setUser(user);
                await fetchUserProfile(user.id);
              }
            } catch (e) {
              localStorage.removeItem('sb:user');
            }
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
          persistAuthState(session.user);
        }


        subscription = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            if (event === 'SIGNED_IN' && session?.user) {
              setUser(session.user);
              await fetchUserProfile(session.user.id);
              persistAuthState(session.user);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setUsername(null);
              persistAuthState(null);
            }
          }
        ).data.subscription;

        setIsLoading(false);
      };

      initializeAuth();

      return () => {
        mounted = false;
        subscription?.unsubscribe();
      };
    }, []);

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