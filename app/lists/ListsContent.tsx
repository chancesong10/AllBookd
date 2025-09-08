'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'

interface BookItem {
    id: string
    book_id: string
    title: string
    authors: string[] | string
    thumbnail: string | null
    created_at: string
    list_id?: string
}

interface UserList {
    id: string
    name: string
    created_at: string
}

export function ListsContent() {
    const [user, setUser] = useState<User | null>(null)
    const [wishlist, setWishlist] = useState<BookItem[]>([])
    const [lists, setLists] = useState<UserList[]>([])
    const [listItems, setListItems] = useState<Record<string, BookItem[]>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [newListName, setNewListName] = useState("")

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)

            if (!session?.user) {
                setError('Please log in to view your lists')
                setIsLoading(false)
                return
            }

            try {
                // ✅ Load wishlist
                const { data: wishlistData, error: wishlistError } = await supabase
                    .from('wishlist')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false })
                if (wishlistError) throw wishlistError
                setWishlist(wishlistData || [])

                // ✅ Load lists
                const { data: listsData, error: listsError } = await supabase
                    .from('lists')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: true })
                if (listsError) throw listsError
                setLists(listsData || [])

                // ✅ Load all list items for all lists
                if (listsData?.length) {
                    const { data: listItemsData, error: itemsError } = await supabase
                        .from('list_items')
                        .select('*')
                        .in('list_id', listsData.map((l: any) => l.id))
                    if (itemsError) throw itemsError

                    const grouped: Record<string, BookItem[]> = {}
                    listItemsData?.forEach((item: any) => {
                        if (!grouped[item.list_id]) grouped[item.list_id] = []
                        grouped[item.list_id].push(item)
                    })
                    setListItems(grouped)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load lists')
            } finally {
                setIsLoading(false)
            }
        }

        getSession()
    }, [])

    // ✅ Create a new list
    const createList = async () => {
        if (!newListName.trim() || !user) return
        const { data, error } = await supabase
            .from('lists')
            .insert({ user_id: user.id, name: newListName })
            .select()
            .single()

        if (!error && data) {
            setLists((prev) => [...prev, data])
            setNewListName("")
        }
    }

    // ✅ Delete a list and all its items
    const deleteList = async (listId: string) => {
        if (!confirm('Are you sure you want to delete this list? All books inside will be lost.')) return
        try {
            // Delete all items in the list first
            const { error: itemsError } = await supabase
                .from('list_items')
                .delete()
                .eq('list_id', listId)
            if (itemsError) throw itemsError

            // Delete the list
            const { error: listError } = await supabase
                .from('lists')
                .delete()
                .eq('id', listId)
            if (listError) throw listError

            // Update state
            setLists((prev) => prev.filter((l) => l.id !== listId))
            setListItems((prev) => {
                const copy = { ...prev }
                delete copy[listId]
                return copy
            })

            alert('List deleted successfully')
        } catch (err) {
            console.error(err)
            alert('Failed to delete list')
        }
    }

    // ✅ Remove book from wishlist
    const removeFromWishlist = async (id: string) => {
        await supabase.from('wishlist').delete().eq('id', id)
        setWishlist((prev) => prev.filter((item) => item.id !== id))
    }

    // ✅ Remove book from a list
    const removeFromList = async (listId: string, id: string) => {
        await supabase.from('list_items').delete().eq('id', id)
        setListItems((prev) => {
            const updated = { ...prev }
            updated[listId] = updated[listId].filter((item) => item.id !== id)
            return updated
        })
    }

    // ✅ Add book to a list
    const addToList = async (book: BookItem, listId: string) => {
        if (!user) return
        const { data, error } = await supabase.from('list_items').insert({
            user_id: user.id,
            list_id: listId,
            book_id: book.book_id,
            title: book.title,
            authors: book.authors,
            thumbnail: book.thumbnail,
        }).select().single()

        if (!error && data) {
            setListItems((prev) => {
                const updated = { ...prev }
                updated[listId] = [...(updated[listId] || []), data]
                return updated
            })
        }
    }

    // ✅ Render books grid
    const renderBooks = (books: BookItem[], listId?: string) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {books.map((item) => {
                const thumb = item.thumbnail?.trim()
                const authorsText = Array.isArray(item.authors)
                    ? item.authors.join(', ')
                    : typeof item.authors === 'string'
                        ? item.authors
                        : ''

                return (
                    <div
                        key={item.id}
                        className="bg-gray-900 p-3 rounded shadow flex flex-col h-full hover:shadow-lg transition-shadow"
                    >
                        <div className="w-full h-52">
                            <Link href={`/book/${item.book_id}`}>
                                {thumb ? (
                                        <img
                                            src={thumb.replace(/^http:\/\//, 'https://')}
                                            alt={item.title}
                                            className="w-full h-full object-contain rounded mb-2"
                                        />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                                        No cover available
                                    </div>
                                )}
                            </Link>
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <Link href={`/book/${item.book_id}`}>
                                    <h2 className="text-sm font-semibold mb-1 line-clamp-2">
                                        {item.title}
                                    </h2>
                                </Link>
                                {authorsText && (
                                    <p className="text-xs text-gray-400 line-clamp-1">{authorsText}</p>
                                )}
                            </div>
                            <div className="mt-3 space-y-2">
                                {listId ? (
                                    <button
                                        className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-1 rounded"
                                        onClick={() => removeFromList(listId, item.id)}
                                    >
                                        Remove from List
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-1 rounded"
                                            onClick={() => removeFromWishlist(item.id)}
                                        >
                                            Remove from Wishlist
                                        </button>
                                        {lists.length > 0 && (
                                            <div className="mt-2">
                                                <select
                                                    className="w-full bg-gray-800 text-white text-sm rounded p-1"
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            addToList(item, e.target.value)
                                                            e.target.value = ""
                                                        }
                                                    }}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>
                                                        ➕ Add to List
                                                    </option>
                                                    {lists.map((list) => (
                                                        <option key={list.id} value={list.id}>
                                                            {list.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )

    if (isLoading) return (
        <div className="pt-24 p-6 text-white bg-black min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Your Lists</h1>
            <p>Loading...</p>
        </div>
    )

    if (error) return (
        <div className="pt-24 p-6 text-white bg-black min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Your Lists</h1>
            <p className="text-red-400">{error}</p>
        </div>
    )

    return (
        <div className="pt-24 p-6 text-white bg-black min-h-screen">
            <h1 className="text-2xl font-bold mb-8">Your Lists</h1>

            {/* Create New List */}
            <div className="flex gap-2 mb-8">
                <input
                    type="text"
                    placeholder="New list name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="bg-gray-800 text-white px-3 py-2 rounded flex-1"
                />
                <button
                    onClick={createList}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 rounded"
                >
                    Create List
                </button>
            </div>

            {/* Wishlist Section */}
            <section className="mb-12">
                <h2 className="text-xl font-semibold mb-4">Wishlist</h2>
                {wishlist.length === 0 ? (
                    <p className="text-gray-400">No books in wishlist yet</p>
                ) : (
                    renderBooks(wishlist)
                )}
            </section>

            {/* Custom Lists */}
            {lists.map((list) => (
                <section key={list.id} className="mb-12">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-semibold">{list.name}</h2>
                        <button
                            className="text-red-500 hover:text-red-700 text-sm"
                            onClick={() => deleteList(list.id)}
                        >
                            Delete List
                        </button>
                    </div>

                    {listItems[list.id]?.length ? (
                        renderBooks(listItems[list.id], list.id)
                    ) : (
                        <p className="text-gray-400">No books in this list yet</p>
                    )}
                </section>
            ))}
        </div>
    )
}
