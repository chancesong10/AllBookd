//app/genres/BookRow.tsx
'use client'

import React, { useRef, useState, useEffect } from 'react'
import { BookRowProps } from '@/types/books'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import AddToListButton from '@/app/components/addtolistbutton'
import Link from 'next/link'

export default function BookRow({ title, books }: BookRowProps) {
  const [user, setUser] = useState<User | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Filter out books with no images to maintain visual quality
  const validBooks = books.filter(b => b.volumeInfo.imageLinks)

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

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 600 // Scroll wider for better UX
    scrollRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    })
  }

  if (validBooks.length === 0) return null

  return (
    <div className="relative group mb-12">
      <h2 className="text-xl font-bold text-neutral-200 mb-4 px-1">{title}</h2>

      {/* Container for Arrows and Row */}
      <div className="relative">
        
        {/* Left Arrow - Hidden by default, appears on hover */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-r-lg backdrop-blur-sm"
        >
          <span className="text-3xl font-light pb-1">&#8249;</span>
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-l-lg backdrop-blur-sm"
        >
          <span className="text-3xl font-light pb-1">&#8250;</span>
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto space-x-4 pb-4 px-1 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar CSS
        >
          {validBooks.map((book) => {
            const info = book.volumeInfo
            const thumbnail = `https://books.google.com/books/publisher/content/images/frontcover/${book.id}?fife=w400-h600&source=gbs_api` || info.imageLinks?.thumbnail?.replace(/^http:\/\//, 'https://')

            return (
              <div 
                key={book.id} 
                className="min-w-[180px] w-[180px] sm:min-w-[200px] sm:w-[200px] snap-start flex-shrink-0"
              >
                <div className="group/card flex flex-col h-full bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-600 transition-all duration-300 hover:shadow-xl">
                  
                  {/* Image Area - Fixed Aspect Ratio */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-neutral-800">
                    <Link href={`/book/${book.id}`} className="block w-full h-full">
                      <img
                        src={thumbnail}
                        alt={info.title}
                        draggable={false}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                      />
                    </Link>
                  </div>

                  {/* Content Area */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/book/${book.id}`}>
                        <h3 className="text-sm font-bold text-neutral-100 line-clamp-2 leading-tight group-hover/card:text-blue-400 transition-colors mb-1">
                          {info.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-neutral-400 line-clamp-1">
                        {info.authors?.join(', ')}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-neutral-800/50">
                      <AddToListButton book={book} user={user} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}