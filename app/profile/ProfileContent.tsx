// app/profile/ProfileContent.tsx
'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Types based on your actual database schema
interface Profile {
  id: string
  username: string
  email: string
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at?: string
}

interface WishlistItem {
  id: string
  user_id: string
  book_id: string
  title: string
  authors: string | null  // text field in DB
  thumbnail: string | null
  created_at: string
}

interface List {
  id: string
  user_id: string
  name: string
  created_at: string
}

interface ListItem {
  id: string
  list_id: string
  user_id: string
  book_id: string
  title: string
  authors: any // jsonb field
  thumbnail: string | null
  created_at: string
  lists?: {
    name: string
  }
}

interface ProfileContentProps {
  user: User
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({
    wishlistCount: 0,
    listsCount: 0,
    totalBooksInLists: 0
  })
  const [recentActivity, setRecentActivity] = useState<{
    wishlist: WishlistItem[]
    listItems: (ListItem & { lists?: { name: string } })[]
  }>({
    wishlist: [],
    listItems: []
  })

  useEffect(() => {
    console.log('Fetching profile for user:', user.id)
    fetchProfileData()
  }, [user])

  const fetchProfileData = async () => {
    setLoading(true)
    
    try {
      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      console.log('Profile data from DB:', profileData)
      
      if (profileError) {
        console.error('Error fetching profile:', profileError)
      }
      
      if (profileData) {
        setProfile(profileData)
        setUsername(profileData.username || '')
        setBio(profileData.bio || '')
      } else {
        // Try to create a profile using the email
        const defaultUsername = user.email?.split('@')[0] || 'user'
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: defaultUsername,
            email: user.email,
            created_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (insertError) {
          console.error('Error creating profile:', insertError)
        } else {
          console.log('Created new profile:', newProfile)
          setProfile(newProfile)
          setUsername(newProfile.username)
        }
      }

      // Get user stats
      const [wishlistCount, listsCount, totalBooksInLists] = await Promise.all([
        supabase.from('wishlist').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('lists').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('list_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ])
      
      setStats({
        wishlistCount: wishlistCount.count || 0,
        listsCount: listsCount.count || 0,
        totalBooksInLists: totalBooksInLists.count || 0
      })

      // Get recent activity
      const [wishlistRes, listItemsRes] = await Promise.all([
        supabase
          .from('wishlist')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('list_items')
          .select('*, lists(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      setRecentActivity({
        wishlist: wishlistRes.data || [],
        listItems: listItemsRes.data || []
      })

    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username,
          bio,
          email: user.email,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      setMessage('Profile updated successfully!')
      setIsEditing(false)
      setProfile(data)
    } catch (error: any) {
      console.error('Update error:', error)
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'U'
  }

  // Helper to format authors for display
  const formatAuthors = (authors: any) => {
    if (!authors) return 'Unknown Author'
    if (typeof authors === 'string') return authors
    if (Array.isArray(authors)) return authors.join(', ')
    return 'Unknown Author'
  }

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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 mb-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-start gap-8">
            
            {/* Left side: Avatar and basic info */}
            <div className="flex items-center gap-6 flex-1">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                  {getInitials(profile?.username || user.email?.split('@')[0] || 'U')}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-neutral-900" />
              </div>
              
              {/* Username and Email */}
              <div className="flex-1">
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-400 mb-1">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full md:w-96 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-400 mb-1">Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full md:w-96 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-blue-500"
                        placeholder="Tell us about your reading journey..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false)
                          setUsername(profile?.username || '')
                          setBio(profile?.bio || '')
                        }}
                        className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600"
                      >
                        Cancel
                      </button>
                    </div>
                    {message && (
                      <p className={message.includes('success') ? 'text-green-400' : 'text-red-400'}>
                        {message}
                      </p>
                    )}
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-2">
                      <h1 className="text-3xl font-bold">
                        @{profile?.username || user.email?.split('@')[0] || 'user'}
                      </h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-1.5 text-sm bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Profile
                      </button>
                    </div>
                    <p className="text-neutral-400">{user.email}</p>
                    <p className="text-sm text-neutral-500 mt-4">
                      Member since {profile?.created_at ? formatDate(profile.created_at) : formatDate(user.created_at)}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Right side: Bio in a mini box (only show when not editing) */}
            {!isEditing && (
              <div className="md:w-80">
                {profile?.bio ? (
                  <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-5 hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Bio</span>
                    </div>
                    <p className="text-neutral-300 text-sm leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                ) : (
                  <div className="bg-neutral-800/30 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Bio</span>
                    </div>
                    <p className="text-neutral-500 text-sm italic">
                      No bio yet. Click edit profile to add one.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-neutral-400 text-sm uppercase tracking-wider">Wishlist</h3>
              <span className="text-2xl group-hover:text-blue-400 transition-colors">♥</span>
            </div>
            <p className="text-3xl font-bold">{stats.wishlistCount}</p>
            <Link href="/lists#wishlist" className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block">
              View all →
            </Link>
          </div>
          
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-neutral-400 text-sm uppercase tracking-wider">Lists</h3>
              <span className="text-2xl group-hover:text-blue-400 transition-colors">📚</span>
            </div>
            <p className="text-3xl font-bold">{stats.listsCount}</p>
            <Link href="/lists" className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block">
              View all →
            </Link>
          </div>
          
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-neutral-400 text-sm uppercase tracking-wider">Total Books</h3>
              <span className="text-2xl group-hover:text-blue-400 transition-colors">📖</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalBooksInLists}</p>
            <p className="text-sm text-neutral-500 mt-2">Across all lists</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            {/* Recent Wishlist Items */}
            {recentActivity.wishlist.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-neutral-800/30 rounded-lg hover:bg-neutral-800 transition-colors">
                <div className="w-12 h-16 bg-neutral-700 rounded overflow-hidden flex-shrink-0">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title || ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                      No cover
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/book/${item.book_id}`} className="font-medium hover:text-blue-400 transition-colors">
                    {item.title || 'Unknown Title'}
                  </Link>
                  <p className="text-sm text-neutral-400">
                    Added to Wishlist • {formatDate(item.created_at)}
                  </p>
                </div>
              </div>
            ))}

            {/* Recent List Items */}
            {recentActivity.listItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-neutral-800/30 rounded-lg hover:bg-neutral-800 transition-colors">
                <div className="w-12 h-16 bg-neutral-700 rounded overflow-hidden flex-shrink-0">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title || ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                      No cover
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/book/${item.book_id}`} className="font-medium hover:text-blue-400 transition-colors">
                    {item.title || 'Unknown Title'}
                  </Link>
                  <p className="text-sm text-neutral-400">
                    Added to {item.lists?.name || 'a list'} • {formatDate(item.created_at)}
                  </p>
                </div>
              </div>
            ))}

            {recentActivity.wishlist.length === 0 && recentActivity.listItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-neutral-400">No recent activity yet.</p>
                <Link href="/search" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                  Start exploring books →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}