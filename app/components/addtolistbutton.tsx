//app/components/addtolistbutton.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { addToWishlist } from '@/lib/addtowishlist'
import { AddToListButtonProps } from '@/types/components'

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

  const handleCreateAndAdd = async () => {
    if (!newListName.trim() || !user) return
    try {
      const { data, error } = await supabase
        .from('lists')
        .insert({ user_id: user.id, name: newListName })
        .select()
        .single()

      if (error) throw error
      setLists((prev) => [...prev, data]) 

      await handleAddToList(data.id)
      setNewListName("")
    } catch (err) {
      console.error('Error creating list:', err)
      alert('Failed to create list')
    }
  }

  return (
    <div className="w-full">
      {/* Main Trigger Button - Matches Card Aesthetic */}
      <button
        onClick={() => {
          if (!user) {
            alert('Please log in to add books to your personalized lists!')
            return
          }
          setOpen(true)
        }}
        className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium transition-colors border border-neutral-700 hover:border-neutral-600"
      >
        + Add to List
      </button>

      {/* Popup Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 text-neutral-100 rounded-2xl shadow-2xl border border-neutral-800 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="text-lg font-bold">Save to...</h2>
              <button 
                onClick={() => setOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Wishlist Button - Primary Action */}
              <button
                onClick={handleAddToWishlist}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-pink-900/30 text-pink-200 border border-pink-900/50 hover:bg-pink-900/50 hover:border-pink-500/50 transition-all group"
              >
                <span className="group-hover:scale-110 transition-transform">♥</span> 
                Add to Wishlist
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-neutral-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-neutral-900 px-2 text-neutral-500">Or add to list</span>
                </div>
              </div>

              {/* Existing Lists */}
              {lists.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => handleAddToList(list.id)}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-transparent hover:border-neutral-700 text-left text-sm transition-all"
                    >
                      {list.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Create New List */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New list name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-neutral-600 transition-all"
                />
                <button
                  onClick={handleCreateAndAdd}
                  disabled={!newListName.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}