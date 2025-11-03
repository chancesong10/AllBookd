import React, { useRef, useState, useEffect } from 'react'
import { BookRowProps } from '@/types/books'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { addToWishlist } from '@/lib/addtowishlist'
import AddToListButton from '@/app/components/addtolistbutton'
import Link from 'next/link'

export default function BookRow({ title, books }: BookRowProps) {
    const [user, setUser] = useState<User | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

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

    // Scroll arrows
    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const scrollAmount = 300
        scrollRef.current.scrollBy({
            left: direction === 'right' ? scrollAmount : -scrollAmount,
            behavior: 'smooth'
        })
    }

    return (
        <div className="relative">
            <h1 className="text-2xl font-bold mb-2 mt-5">{title}</h1>

            {/* Left arrow */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/50 p-4 rounded-full z-10 hover:bg-black/70 text-2xl"
            >
                &#8249;
            </button>

            {/* Right arrow */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/50 p-4 rounded-full z-10 hover:bg-black/70 text-2xl"
            >
                &#8250;
            </button>

            <div
                ref={scrollRef}
                className="flex overflow-x-scroll space-x-4 no-scrollbar select-none"
            >
                {books.map((book) => {
                    const info = book.volumeInfo
                    return (
                        <div key={book.id} className="min-w-[200px] rounded shadow flex flex-col bg-gray-900 p-2">

                            {/* Image */}
                            <div className="mt-2 w-full h-60">
                                <Link href={`/book/${book.id}`}>
                                    <img
                                        src={`https://books.google.com/books/publisher/content/images/frontcover/${book.id}?fife=w400-h600&source=gbs_api`}
                                        alt={info.title}
                                        draggable={false}
                                        className="w-full h-full object-contain rounded mb-2 shadow-md hover:shadow-lg transition-shadow duration-200 transform hover:scale-105"
                                    />
                                </Link>
                            </div>

                            {/*Info + Button*/}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <Link href={`/book/${book.id}`}>
                                        <h2 className="text-md font-semibold mb-1 line-clamp-2 hover:underline">
                                            {info.title}
                                        </h2>
                                    </Link>
                                    {Array.isArray(info.authors) && (
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
        </div>
    )
}