// app/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import ProfileContent from './ProfileContent'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        router.push('/login?redirectedFrom=/profile')
        return
      }
      
      setUser(session.user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login?redirectedFrom=/profile')
      } else if (session?.user) {
        setUser(session.user)
        setLoading(false)
      }
    })

    return () => subscription?.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-full bg-neutral-800 animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-8 w-48 bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-64 bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-96 bg-neutral-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return <ProfileContent user={user} />
}