'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { BookItem } from '@/types/books'
import Link from 'next/link'
import AddToListButton from '@/app/components/addtolistbutton'

function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [results, setResults] = useState<BookItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Pagination state
  const [page, setPage] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const resultsPerPage = 40

  // Keep page in sync when query changes
  useEffect(() => {
    setPage(0)
  }, [query])

  // User session handling
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

  // Fetch search results (with pagination)
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const fetchBooks = async () => {
      setIsLoading(true)
      setError('')
      try {
        const startIndex = page * resultsPerPage

        // Add pagination to API call
        const response = await fetch(`/api/books?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${resultsPerPage}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch books')
        }

        const data = await response.json()
        setResults(data.items || [])
        setTotalItems(data.totalItems || 0)
      } catch (err: any) {
        console.error('Search error:', err)
        setError(err.message)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()
  }, [query, page])

  // Add to wishlist
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

  // UI
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
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {results.map((book) => {
                  const info = book.volumeInfo
                  const thumbnail =
                    `https://books.google.com/books/publisher/content/images/frontcover/${book.id}?fife=w400-h600&source=gbs_api` ||
                    info.imageLinks?.thumbnail?.replace(/^http:\/\//, 'https://')

                  return (
                    <div
                      key={book.id}
                      className="bg-gray-900 p-2 rounded shadow flex flex-col h-full hover:shadow-lg transition-shadow"
                    >
                      <div className="mt-2 w-full h-60">
                        {thumbnail ? (
                          <Link href={`/book/${book.id}`}>
                            <img
                              src={thumbnail}
                              alt={info.title}
                              className="w-full h-full object-contain rounded mb-2 shadow-md hover:shadow-lg transition-shadow duration-200 transform hover:scale-105"
                            />
                          </Link>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                            No cover available
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <Link href={`/book/${book.id}`}>
                            <h2 className="text-md font-semibold mb-1 line-clamp-2 hover:underline">
                              {info.title}
                            </h2>
                          </Link>
                          {info.authors && (
                            <p className="text-sm text-gray-400 line-clamp-1">
                              {info.authors.join(', ')}
                            </p>
                          )}
                        </div>

                        <AddToListButton book={book} user={user} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination buttons */}
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  className={`px-4 py-2 rounded-lg ${
                    page === 0
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Previous
                </button>

                <span className="text-gray-400">
                  Page {page + 1}
                </span>

                <button
                  disabled={(page + 1) * resultsPerPage >= totalItems}
                  onClick={() => setPage((p) => p + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    (page + 1) * resultsPerPage >= totalItems
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Next
                </button>
              </div>
            </>
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
