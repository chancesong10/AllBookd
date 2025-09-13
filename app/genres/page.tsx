'use client'

import { BookItem } from '@/types/books';
import { useEffect, useState } from 'react'
import BookRow from './BookRow';


export default function Genres() {
    const [ficBooks, setFicBooks] = useState<BookItem[]>([])
    const [nonficBooks, setNonficBooks] = useState<BookItem[]>([])
    const [search, setSearch] = useState("")
    const [searchResults, setSearchResults] = useState<BookItem[]>([])
    const [loading, setLoading] = useState(false)

    // Fetch bestsellers from the API
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

    // Fetch books by genre
    const fetchByGenre = async (genre: string) => {
        setLoading(true)
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(genre)}&maxResults=20`)
        const data = await res.json()
        const books = (data.items || []).map((item: any) => ({
            id: item.id,
            volumeInfo: {
                title: item.volumeInfo.title,
                authors: item.volumeInfo.authors || [],
                imageLinks: {
                    thumbnail: item.volumeInfo.imageLinks?.thumbnail || "",
                    small: item.volumeInfo.imageLinks?.small,
                    medium: item.volumeInfo.imageLinks?.medium,
                    large: item.volumeInfo.imageLinks?.large,
                    extraLarge: item.volumeInfo.imageLinks?.extraLarge
                }
            }
        }))

        setSearchResults(books)
        setLoading(false)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            fetchByGenre(search);
        } else {
            setSearchResults([]);
        }
    }

    return (
        <div className="flex bg-black text-white min-h-screen">

            {/* Sidebar */}
            <aside className="w-72 bg-gray-900 pt-24 pr-4 pl-4 border-r border-gray-800">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search any genre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full p-2 rounded-xl bg-gray-800 text-white mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold py-2 px-4 rounded-lg "
                    >
                        Search
                    </button>
                </form>

                {/* Future: list of genres */}
                <div className="mt-8 space-y-2">
                    <h2 className="px-3 text-gray-400 test-sm uppercase tracking-wide">
                        Featured Genres
                    </h2>
                    <ul className="space-y-2">
                        {['Fantasy', 'Romance', 'History', 'Mystery', 'Thriller', 'Biography', 'Self-Help', 'Poetry'].map((genre) => (
                            <li key={genre}>
                                <button
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                                    onClick={() => fetchByGenre(genre)}
                                >
                                    {genre}
                                </button>
                            </li>
                        )
                        )}
                    </ul>
                </div>
            </aside>


            {/* Main content */}
            <main className="flex-1 p-2 overflow-x-hidden">
                {loading && <p>Loading...</p>}

                {/* Search results */}
                {!loading && searchResults.length > 0 && (
                    <div className="pt-18 p-4">
                        <BookRow title={`Results for "${search}"`} books={searchResults} />
                    </div>
                )}

                {/* Placeholder for genres */}
                {!loading && searchResults.length === 0 && (
                    <div className="pt-18 p-4">
                        <BookRow title="Best Sellers in Fiction" books={ficBooks} />
                        <BookRow title="Best Sellers in Non-Fiction" books={nonficBooks} />
                    </div>
                )}
            </main>
        </div>
    )
}

