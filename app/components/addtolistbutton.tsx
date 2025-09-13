'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { BookItem } from '@/types/books'
import { addToWishlist } from '@/lib/addtowishlist' 

interface AddToListButtonProps {
  book: BookItem
  user: User | null
}

export default function AddToListButton({ book, user }: AddToListButtonProps) {
  const [lists, setLists] = useState<{ id: string; name: string }[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchLists = async () => {
      const { data, error } = await supabase
        .from('lists')
        .select('id, name')
        .eq('user_id', user.id)
      if (error) console.error(error)
      else setLists(data || [])
    }
    fetchLists()
  }, [user])

  const handleAddToList = async (listId: string) => {
    if (!user) {
      alert('Please log in first')
      return
    }

    const info = book.volumeInfo
    const thumbnail =
      info.imageLinks?.thumbnail?.replace(/^http:\/\//, 'https://') ||
      `https://books.google.com/books/publisher/content/images/frontcover/${book.id}?fife=w400-h600&source=gbs_api`

    try {
      const { error } = await supabase.from('list_items').insert([
        {
          user_id: user.id,
          list_id: listId,
          book_id: book.id,
          title: info.title,
          authors: info.authors || [],
          thumbnail,
        },
      ])

      if (error) throw error
      alert(`✅ Added "${info.title}" to the list`)
      setOpen(false)
    } catch (err) {
      console.error('Error adding to list:', err)
      alert('Failed to add book to the list')
    }
  }

  const handleAddToWishlist = async () => {
    if (!user) {
      alert('Please log in first')
      return
    }

    try {
      await addToWishlist(book, user)
      alert(`✅ Added "${book.volumeInfo.title}" to your Wishlist`)
      setOpen(false)
    } catch (err) {
      console.error('Failed to add to wishlist:', err)
      alert('Failed to add book to wishlist')
    }
  }

  return (
    <div className="relative w-full">
      <button
        onClick={() => {
            if (!user) {
                alert('Please log in to add books to your personalized lists!')
                return
            }
            setOpen(!open)
        }}
        className="mt-3 bg-green-600 hover:bg-green-700 text-white py-1.5 text-sm rounded w-full"
      >
        + Add to List
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-full bg-gray-800 rounded shadow-lg">
          {/* ✅ Option to add to Wishlist */}
          <button
            onClick={handleAddToWishlist}
            className="block w-full text-left px-4 py-2 hover:bg-gray-700"
          >
            Wishlist
          </button>

          {/* ✅ Render all user lists */}
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => handleAddToList(list.id)}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              {list.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
