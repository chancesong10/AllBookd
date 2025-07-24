'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const { user, username, isLoading, signOut } = useAuth()

  const Links = [
    { href: "/", text: "Home" },
    { href: "/books", text: "Books" },
    { href: "/lists", text: "Lists" },
    { href: "/about", text: "About" },
  ]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleLogout = async () => {
    const success = await signOut()
    if (success) {
      router.push('/')
      router.refresh()
    }
  }

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
                <span className="text-gray-300">{user.email}</span>
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