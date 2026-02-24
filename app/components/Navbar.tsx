// app/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const Links = [
    { href: "/", text: "Home" },
    { href: "/genres", text: "Genres" },
    { href: "/lists", text: "Lists" },
    { href: "/about", text: "About" },
  ]

  // Search handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setShowDropdown(false)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.profile-dropdown')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showDropdown])

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', session.user.id)
          .single()
        
        setUsername(profile?.username || '')
        setAvatarUrl(profile?.avatar_url || '')
      }
      
      setIsLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUsername(profile?.username || '')
            setAvatarUrl(profile?.avatar_url || '')
          })
      } else {
        setUsername('')
        setAvatarUrl('')
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <nav>
      <div className="fixed bg-transparent py-1.5 px-4 w-full flex items-center z-50">
        {/* Logo */}
        <div>
          <Link href="/" style={{fontFamily: 'Playfair Display', fontSize: '35px'}} className="ml-4 text-white">
            AllBookd
          </Link>
        </div>

        {/* Nav links */}
        <div className="flex-1 flex justify-center">
          <ul className="flex space-x-14">
            {Links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{fontFamily: 'Inter', fontSize: '18px'}}
                  className="text-white font-bold px-4 py-2 rounded-md inline-block transition-transform duration-200 hover:scale-110"
                >
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Search and Auth */}
        <div className="ml-auto mr-4 flex gap-4 items-center">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search Books"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 py-2 rounded-xl text-white placeholder-gray-400 bg-white/5 backdrop-blur focus:outline-none w-64"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {isLoading ? (
            <div className="w-32 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          ) : user ? (
            <div className="relative profile-dropdown">
              {/* Profile Button - Clickable avatar with username below */}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex flex-col items-center gap-1 focus:outline-none group"
              >
                {/* Avatar Circle */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-base font-bold text-white shadow-lg overflow-hidden border-2 border-transparent group-hover:border-blue-400 transition-all">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(username || user.email || 'U')
                  )}
                </div>
                {/* Username */}
                <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                  @{username || user.email?.split('@')[0] || 'user'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Your Profile
                  </Link>
                  <Link
                    href="/lists"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Your Lists
                  </Link>
                  <div className="border-t border-neutral-800 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-neutral-800 hover:text-red-300 transition-colors w-full text-left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="bg-white/5 hover:bg-white/10 backdrop-blur px-4 py-2 rounded-xl text-sm text-white font-bold"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-white/5 hover:bg-white/10 backdrop-blur px-4 py-2 rounded-xl text-sm text-white font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}