'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function BookSearch() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    if (!query) return
    const fetchBooks = async () => {
      const res = await fetch(
        `/api/books?q=${encodeURIComponent(query)}` // Adjusted to use the Next.js API route
      )
      const data = await res.json()
      setResults(data.items || [])
    }
    fetchBooks()
  }, [query])

  return (
    <div className="pt-24 p-6">
      <h1 className="text-2xl font-bold mb-4">Results for “{query}”:</h1>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {results.map((book: any) => {
          const info = book.volumeInfo
          return (
            <div key={book.id} className="bg-gray-900 p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{info.title}</h2>
              <p className="text-sm">{info.authors?.[0]}</p>
              {info.imageLinks?.thumbnail && (
                <img
                  src={`https://books.google.com/books/publisher/content/images/frontcover/${book.id}?fife=w400-h600&source=gbs_api`}
                  alt={info.title}
                  className="mt-2 w-full max-w-xs"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Searchbar() {
    return (
      <Suspense>
        <BookSearch />
      </Suspense>
    )
}