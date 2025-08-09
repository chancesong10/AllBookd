'use client'

import { BookItem } from '@/types/books';
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../providers/auth-provider';
import { addToWishlist } from '@/lib/addtowishlist';

export default function Genres() {
    const { user } = useAuth()
    const [books, setBooks] = useState<BookItem[]>([])

    // Drag to scroll functionality
    const scrollRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)
    const startX = useRef(0)
    const scrollLeft = useRef(0)

    useEffect(() => {
        const fetchBooks = async () => {
            const res = await fetch('/api/bestsellers')
            const data = await res.json()
            setBooks(data.results.map((b: any) => b.google).filter(Boolean))
        }
        fetchBooks()
    }, [])

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true
        startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0)
        scrollLeft.current = scrollRef.current?.scrollLeft || 0
    }

    const hanndleMouseUp = () => {
        isDragging.current = false
    }

    const handleMouseLeave = () => {
        isDragging.current = false
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollRef.current) return
        e.preventDefault() // Prevent default text selection

        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = (x - startX.current) * 1.5; // Adjust scroll speed
        scrollRef.current.scrollLeft = scrollLeft.current - walk
    }

    return (
        <div className="pt-24 p-4 bg-black text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Best Sellers in Fiction</h1>

            {/* Horizontal scrollable book list */}
            <div 
                className="flex overflow-x-scroll space-x-4 no-scrollbar select-none"
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseUp={hanndleMouseUp} 
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                >
                {books.map((book) => {
                    const info = book.volumeInfo;

                    return (
                        <div 
                            key={book.id} 
                            className="min-w-[200px] h-[420] rounded shadow flex flex-col bg-gray-900 p-2"
                        >
                            {/* Image */}
                            <div className="mt-2 w-full h-60">
                                <img
                                    src={`https://books.google.com/books/publisher/content/images/frontcover/${book.id}?fife=w400-h600&source=gbs_api`}
                                    alt={info.title}
                                    draggable={false}
                                    className="w-full h-full object-contain rounded mb-2 shadow-md hover:shadow-lg transition-shadow duration-200 transform hover:scale-105"
                                />
                            </div>

                            {/*Info + Button*/}
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
        </div>
    )
}