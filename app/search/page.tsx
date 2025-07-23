// app/search/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

export default function SearchPage() {
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

  // Insert into Supabase wishlist
  const addToWishlist = async (book: BookItem) => {
    const info = book.volumeInfo
    const thumbnail =
      info.imageLinks?.thumbnail?.replace(/^http:\/\//, 'https://') || ''
    const { error } = await supabase
      .from('wishlist')
      .insert([{
        book_id: book.id,
        title: info.title,
        authors: info.authors || [],
        thumbnail
      }])
    if (error) {
      console.error(error)
      alert('Failed to add to wishlist')
    } else {
      alert(`✅ Added “${info.title}” to your wishlist`)
    }
  }

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
            const src = `https://books.google.com/books/publisher/content/images/frontcover/${book.id}?fife=w400-h600&source=gbs_api`

            return (
              <div
                key={book.id || info.title}
                className="bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col"
              >
                {/* Image on top */}
                <div className="relative w-full" style={{ paddingTop: '150%' }}>
                  <img
                    src={src}
                    alt={info.title}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                </div>

                {/* Title and author */}
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

                  {/* Add Button */}
                  <button
                    onClick={() => addToWishlist(book)}
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