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
  const [newListName, setNewListName] = useState("")

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

  // ✅ Create a new list and add the book to it
  const handleCreateAndAdd = async () => {
    if (!newListName.trim() || !user) return
    try {
      const { data, error } = await supabase
        .from('lists')
        .insert({ user_id: user.id, name: newListName })
        .select()
        .single()

      if (error) throw error
      setLists((prev) => [...prev, data]) // update local list state

      // add the book to the new list
      await handleAddToList(data.id)

      setNewListName("")
    } catch (err) {
      console.error('Error creating list:', err)
      alert('Failed to create list')
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={() => {
          if (!user) {
            alert('Please log in to add books to your personalized lists!')
            return
          }
          setOpen(true)
        }}
        className="mt-3 bg-green-600 hover:bg-green-700 text-white py-1.5 text-sm rounded w-full"
      >
        + Add to List
      </button>

      {/* ✅ Popup Modal */}
      {open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-gray-900 text-white rounded-2xl shadow-xl p-6 w-96">
      <h2 className="text-xl font-semibold mb-6 text-center">Add to List</h2>

      {/* Wishlist Button */}
      <button
        onClick={handleAddToWishlist}
        className="w-full px-4 py-3 mb-3 rounded-lg bg-gradient-to-r from-pink-200 to-pink-400 hover:opacity-80 transition"
      >
        Add to Wishlist
      </button>

      {/* Divider */}
      <div className="border-t border-gray-700 my-4" />

      {/* User’s Lists */}
      <label className="block text-sm text-gray-400 mb-2">
          Your lists
        </label>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => handleAddToList(list.id)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-left"
          >
            {list.name}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 my-4" />

      {/* Create a new list */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Create a new list
        </label>
        <input
          type="text"
          placeholder="New list name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none mb-3"
        />
        <button
          onClick={handleCreateAndAdd}
          className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
        >
          Create & Add
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={() => setOpen(false)}
        className="mt-5 w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
      >
        Cancel
      </button>
    </div>
  </div>
)}
    </div>
  )
}
