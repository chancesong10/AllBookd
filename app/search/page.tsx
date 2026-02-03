'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { BookItem } from '@/types/books'
import Link from 'next/link'
import AddToListButton from '@/app/components/addtolistbutton'

// 1. Create a reusable "Skeleton" component for the loading state
const BookSkeleton = () => (
  <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 animate-pulse">
    <div className="aspect-[2/3] bg-neutral-800" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-neutral-800 rounded w-3/4" />
      <div className="h-3 bg-neutral-800 rounded w-1/2" />
      <div className="h-8 bg-neutral-800 rounded w-full mt-4" />
    </div>
  </div>
)

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

  // Fetch search results
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setTotalItems(0)
      setError('')
      return
    }

    const abortController = new AbortController()

    const fetchBooks = async () => {
      setIsLoading(true)
      setError('')
      
      try {
        const startIndex = page * resultsPerPage
        const url = `/api/books?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${resultsPerPage}`

        const response = await fetch(url, {
          signal: abortController.signal
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch books')
        }

        const data = await response.json()
        setResults(data.items || [])
        setTotalItems(data.totalItems || 0)
      } catch (err: any) {
        if (err.name === 'AbortError') return
        console.error('Search error:', err)
        setError(err.message)
        setResults([])
        setTotalItems(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()
    return () => abortController.abort()
  }, [query, page])

  // UI
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        {!query ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-200">Start your search</h2>
            <p className="text-neutral-400 max-w-md">Type in the search box above to discover your next favorite book.</p>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between border-b border-neutral-800 pb-4">
              <h1 className="text-2xl font-bold tracking-tight">
                {isLoading ? (
                  <span className="animate-pulse">Searching...</span>
                ) : (
                  <>Results for <span className="text-blue-400">"{query}"</span></>
                )}
              </h1>
              {!isLoading && (
                <span className="text-sm text-neutral-500 hidden sm:block">
                  {totalItems.toLocaleString()} books found
                </span>
              )}
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {isLoading ? (
                // Show 12 skeleton items while loading
                Array.from({ length: 12 }).map((_, i) => <BookSkeleton key={i} />)
              ) : results.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <p className="text-neutral-400 text-lg">No books found matching your criteria.</p>
                </div>
              ) : (
                results.map((book) => {
                  const info = book.volumeInfo
                  // High res image logic
                  const thumbnail = `https://books.google.com/books/publisher/content/images/frontcover/${book.id}?fife=w400-h600&source=gbs_api` || info.imageLinks?.thumbnail?.replace(/^http:\/\//, 'https://')

                  return (
                    <div
                      key={book.id}
                      className="group flex flex-col h-full bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-600 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50"
                    >
                      {/* Image Container with fixed Aspect Ratio */}
                      <div className="relative aspect-[2/3] overflow-hidden bg-neutral-800">
                        {thumbnail ? (
                          <Link href={`/book/${book.id}`} className="block w-full h-full">
                            <img
                              src={thumbnail}
                              alt={info.title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </Link>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600">
                            <span className="text-xs uppercase tracking-wider font-semibold">No Cover</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <Link href={`/book/${book.id}`} className="block flex-1">
                          <h2 className="text-sm font-bold text-neutral-100 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                            {info.title}
                          </h2>
                          <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                            {info.authors ? info.authors.join(', ') : 'Unknown Author'}
                          </p>
                        </Link>
                        
                        <div className="mt-4 pt-4 border-t border-neutral-800/50">
                          <AddToListButton book={book} user={user} />
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Pagination */}
            {!isLoading && results.length > 0 && (
              <div className="flex justify-center items-center gap-4 py-8 mt-4 border-t border-neutral-800">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  className="px-5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-neutral-800 hover:bg-neutral-700 text-white"
                >
                  Previous
                </button>

                <span className="text-sm text-neutral-400 font-medium">
                  Page <span className="text-white">{page + 1}</span>
                </span>

                <button
                  disabled={(page + 1) * resultsPerPage >= totalItems}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
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