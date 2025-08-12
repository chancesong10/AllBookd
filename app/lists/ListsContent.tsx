// app/lists/ListsContent.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { WishlistItem } from '@/types/books'
import { User } from '@supabase/supabase-js'

export function ListsContent() {
  const [user, setUser] = useState<User | null>(null)
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (!session?.user) {
        setError('Please log in to view your lists')
        setIsLoading(false)
        return
      }

      // Load wishlist if user is authenticated
      try {
        const { data, error: fetchError } = await supabase
          .from('wishlist')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setItems(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wishlist')
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const handleRemove = async (id: string) => {
    try {
      await supabase.from('wishlist').delete().eq('id', id)
      // Optimistically update UI instead of full reload
      setItems(prevItems => prevItems.filter(item => item.id !== id))
    } catch (error) {
      alert('Failed to remove item')
    }
  }

  if (isLoading) {
    return (
      <div className="pt-24 p-6 text-white bg-black min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-24 p-6 text-white bg-black min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
        <div className="bg-red-900/50 p-4 rounded-lg mb-4">
          <p className="text-red-300">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 p-6 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>

      {items.length === 0 ? (
        <p className="text-gray-400">No books yet—search and add some from the search page!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {items.map((item) => {
            const thumb = item.thumbnail?.trim()
            const authorsText = Array.isArray(item.authors)
              ? item.authors.join(', ')
              : typeof item.authors === 'string'
              ? item.authors
              : ''

            return (
              <div
                key={item.id}
                className="bg-gray-900 p-2 rounded shadow flex flex-col h-full hover:shadow-lg transition-shadow"
              >
                <div className="mt-2 w-full h-60">
                  {thumb ? (
                    <img
                      src={thumb.replace(/^http:\/\//, 'https://')}
                      alt={item.title}
                      className="w-full h-full object-contain rounded mb-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                      No cover available
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-md font-semibold mb-1 line-clamp-2">
                      {item.title}
                    </h2>
                    {authorsText && (
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {authorsText}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white py-1.5 text-sm rounded w-full transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}