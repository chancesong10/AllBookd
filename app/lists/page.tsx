// app/lists/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { removeFromWishlist } from '@/lib/removefromwishlist'

interface WishlistItem {
  id: string
  title: string
  authors: string[] | string | null
  thumbnail?: string | null
}

export default function ListsPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // define an async loader
    const loadWishlist = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading wishlist:', error)
      } else {
        setItems(data || [])
      }

      setLoading(false)
    }

    loadWishlist()
  }, [])

  const handleRemove = async (id: string) => {
    try {
      await removeFromWishlist(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch {
      alert('Could not remove that book.')
    }
  }

  if (loading) {
    return <p className="pt-24 p-6 text-white">Loading your wishlist…</p>
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
