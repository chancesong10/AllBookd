'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface VolumeInfo {
  title: string
  authors?: string[]
  imageLinks?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    extraLarge?: string
  }
}

interface BookItem {
  id: string
  volumeInfo: VolumeInfo
}

function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<BookItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')


  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription?.unsubscribe()
  }, [])


  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError('')

    fetch(`/api/books?q=${encodeURIComponent(query)}`)
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch books')
        }
        return response.json()
      })
      .then((data) => {
        setResults(data.items || [])
      })
      .catch((err) => {
        console.error('Search error:', err)
        setError(err.message)
        setResults([])
      })
      .finally(() => setIsLoading(false))
  }, [query])

  const addToWishlist = async (book: BookItem) => {
    if (!user) {
      alert('Please log in to add books to your wishlist.')
      return
    }

    const info = book.volumeInfo
    const thumbnail = info.imageLinks?.thumbnail?.replace(/^http:\/\//, 'https://') || ''

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert([{
          user_id: user.id,
          book_id: book.id,
          title: info.title,
          authors: info.authors || [],
          thumbnail
        }])

      if (error) throw error
      alert(`✅ Added "${info.title}" to your wishlist`)
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      alert('Failed to add to wishlist. Please try again.')
    }
  }

  return (
    <div className="pt-24 p-6 text-white bg-black min-h-screen">
      {!query ? (
        <p className="text-gray-400">Type in the search box above and hit Enter to search.</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">
            {isLoading ? 'Searching...' : `Results for "${query}"`}
          </h1>

          {error && (
            <div className="bg-red-900/50 p-4 rounded-lg mb-4">
              <p className="text-red-300">Search Error: {error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : results.length === 0 ? (
            <p className="text-gray-400">No books found. Try a different search term.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {results.map((book) => {
                const info = book.volumeInfo
                const thumbnail = info.imageLinks?.thumbnail?.replace(/^http:\/\//, 'https://') || 
                  `https://books.google.com/books/publisher/content/images/frontcover/${book.id}?fife=w400-h600&source=gbs_api`

                return (
                  <div
                    key={book.id}
                    className="bg-gray-900 p-2 rounded shadow flex flex-col h-full hover:shadow-lg transition-shadow"
                  >
                    <div className="mt-2 w-full h-60">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={info.title}
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
                          {info.title}
                        </h2>
                        {info.authors && (
                          <p className="text-sm text-gray-400 line-clamp-1">
                            {info.authors.join(', ')}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => addToWishlist(book)}
                        className="mt-3 bg-green-600 hover:bg-green-700 text-white py-1.5 text-sm rounded w-full transition-colors"
                      >
                        + Add to Wishlist
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function BookSearch() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  )
}