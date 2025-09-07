'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const Links = [
    { href: "/", text: "Home" },
    { href: "/books", text: "Genres" },
    { href: "/lists", text: "Lists" },
    { href: "/about", text: "About" },
  ]

  // Search handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/')
      router.refresh() // Refresh the page to clear any cached user data
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  useEffect(() => {
    // Check current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
        
        setUsername(profile?.username || '')
      }
      
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUsername(profile?.username || '')
          })
      } else {
        setUsername('')
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  return (
    <nav>
      <div className="fixed bg-gray-900 p-4 w-full flex items-center z-50">
        {/* Logo */}
        <div>
          <Link href="/" className="ml-4 text-white text-2xl font-bold">
            AllBookd
          </Link>
        </div>

        {/* Nav links */}
        <div className="flex-1 flex justify-center">
          <ul className="flex space-x-4">
            {Links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-white px-4 py-2 rounded-md hover:bg-blue-800 transition"
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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search Books"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 py-2 rounded-xl bg-blue-950 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {isLoading ? (
            <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                {username && <span className="text-gray-300">@{username}</span>}
                <span className="text-gray-400">|</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm text-white"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm text-white"
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