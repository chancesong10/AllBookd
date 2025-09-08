import React, { useRef, useState, useEffect } from 'react'
import { BookRowProps } from '@/types/books'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { addToWishlist } from '@/lib/addtowishlist'
import AddToListButton from '@/app/components/addtolistbutton'

export default function BookRow({ title, books }: BookRowProps) {
    const [user, setUser] = useState<User | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)
    const startX = useRef(0)
    const scrollLeft = useRef(0)

    useEffect(() => {
        // Check current session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
        }

        getSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription?.unsubscribe()
    }, [])

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true
        startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0)
        scrollLeft.current = scrollRef.current?.scrollLeft || 0
    }

    const handleMouseUp = () => {
        isDragging.current = false
    }

    const handleMouseLeave = () => {
        isDragging.current = false
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollRef.current) return
        e.preventDefault()

        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = (x - startX.current) * 1.5;
        scrollRef.current.scrollLeft = scrollLeft.current - walk
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-2 mt-5">{title}</h1>

            <div
                className="flex overflow-x-scroll space-x-4 no-scrollbar select-none"
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
            >
                {books.map((book) => {
                    const info = book.volumeInfo;

                    return (
                        <div
                            key={book.id}
                            className="min-w-[200px] h-[420px] rounded shadow flex flex-col bg-gray-900 p-2"
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
                                <AddToListButton book={book} user={user} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}