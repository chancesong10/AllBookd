'use client'

import { BookItem } from '@/types/books';
import { useEffect, useState } from 'react'
import BookRow from './BookRow';


export default function Genres() {
    const [ficBooks, setFicBooks] = useState<BookItem[]>([])
    const [nonficBooks, setNonficBooks] = useState<BookItem[]>([])

    useEffect(() => {
        const fetchFiction = async () => {
          const res = await fetch('/api/bestsellers?category=hardcover-fiction')
          const data = await res.json()
          setFicBooks(data.results.map((b: any) => b.google).filter(Boolean))
        }
    
        const fetchNonfiction = async () => {
          const res = await fetch('/api/bestsellers?category=hardcover-nonfiction')
          const data = await res.json()
          setNonficBooks(data.results.map((b: any) => b.google).filter(Boolean))
        }
    
        fetchFiction()
        fetchNonfiction()
      }, [])

    return (
        <div className="pt-24 p-4 bg-black text-white min-h-screen">
            <BookRow title="Best Sellers in Fiction" books={ficBooks} />
            <BookRow title="Best Sellers in Non-Fiction" books={nonficBooks} />
        </div>
    )
}