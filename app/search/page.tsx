'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
import { useAuth } from '@/app/providers/auth-provider'
import { addToWishlist } from '@/lib/addtowishlist'
import { BookItem } from '@/types/books'

function SearchPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<BookItem[]>([])

  // Fetch books whenever query changes
  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    fetch(`/api/books?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((json) => setResults(json.items || []))
  }, [query])

  return (
    <div className="pt-24 p-6 text-white">
      {!query ? (
        <p>Type in the search box above and hit Enter to search.</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">
            Results for “{query}”:
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map((book) => {
              const info = book.volumeInfo
              const book_url = `https://books.google.com/books/publisher/content/images/frontcover/${book.id}?fife=w400-h600&source=gbs_api`

              return (
                <div
                  key={book.id}
                  className="bg-gray-900 p-2 rounded shadow flex flex-col h-full"
                >
                  {/* Image */}
                  <div className="mt-2 w-full h-60">
                    <img
                      src={book_url}
                      alt={info.title}
                      className="w-full h-full object-contain rounded mb-2 shadow-md hover:shadow-lg transition-shadow duration-200 transform hover:scale-105"
                    />
                  </div>

                  {/* Info + Button */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-md font-semibold mb-1 line-clamp-2">
                        {info.title}
                      </h2>
                      {Array.isArray(info.authors) && (
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {info.authors.join(', ')}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => addToWishlist(book, user)}
                      className="mt-3 bg-green-600 hover:bg-green-700 text-white py-1.5 text-sm rounded w-full"
                    >
                      + Add to Wishlist
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
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
