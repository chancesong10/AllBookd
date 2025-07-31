// app/lists/ListsContent.tsx
'use client'

import { useAuth } from '@/app/providers/auth-provider'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { WishlistItem } from '@/types/books'

export function ListsContent() {
  // All hooks called unconditionally at the top
  const { user, username, isLoading: isAuthLoading } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user && !isAuthLoading) {
      setError('Please log in to view your lists')
      setIsLoading(false)
      return
    }

    if (!user) return

    const loadWishlist = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('wishlist')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setItems(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wishlist')
      } finally {
        setIsLoading(false)
      }
    }

    loadWishlist()
  }, [user, isAuthLoading])

  if (isAuthLoading || isLoading) {
    return (
      <div className="bg-black text-white min-h-screen p-8">
        <h1 className="text-5xl font-bold mb-6">Your Wishlist</h1>
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-screen p-8">
        <h1 className="text-5xl font-bold mb-6">Your Wishlist</h1>
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-black text-white min-h-screen p-8">
      <h1 className="text-5xl font-bold mb-6">Your Wishlist</h1>

      {items.length === 0 ? (
        <p className="text-gray-400">
          No books yet—search and add some from the search page!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                className="bg-gray-900 rounded shadow overflow-hidden flex flex-col"
              >
                {thumb ? (
                  <img
                    src={thumb.replace(/^http:\/\//, 'https://')}
                    alt={item.title}
                    className="w-full h-[300px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[300px] bg-gray-800 flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-xl font-semibold mb-2 truncate">
                    {item.title}
                  </h2>
                  {authorsText && (
                    <p className="text-sm text-gray-400 mb-4 truncate">
                      {authorsText}
                    </p>
                  )}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="mt-auto bg-red-600 hover:bg-red-700 text-white py-2 rounded"
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

async function handleRemove(id: string) {
  try {
    await supabase.from('wishlist').delete().eq('id', id)
    window.location.reload()
  } catch (error) {
    alert('Failed to remove item')
  }
}