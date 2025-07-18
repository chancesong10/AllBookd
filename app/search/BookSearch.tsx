'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function BookSearch() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    if (!query) return
    const fetchBooks = async () => {
      const key = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${key}`
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
                  src={info.imageLinks.thumbnail}
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
