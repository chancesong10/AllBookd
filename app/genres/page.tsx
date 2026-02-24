//app/genres/page.tsx
'use client'

import { BookItem } from '@/types/books';
import { useEffect, useState } from 'react'
import BookRow from './BookRow'; // Ensure path is correct

// A simple skeleton for loading states
const RowSkeleton = () => (
  <div className="mb-12 space-y-4 animate-pulse">
    <div className="h-6 w-48 bg-neutral-800 rounded" />
    <div className="flex space-x-4 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="min-w-[200px] aspect-[2/3] bg-neutral-800 rounded-xl border border-neutral-700" />
      ))}
    </div>
  </div>
)

export default function Genres() {
  const [ficBooks, setFicBooks] = useState<BookItem[]>([])
  const [nonficBooks, setNonficBooks] = useState<BookItem[]>([])
  const [search, setSearch] = useState("")
  const [submittedSearch, setSubmittedSearch] = useState("") 
  const [searchResults, setSearchResults] = useState<BookItem[]>([])
  
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [searchAttempted, setSearchAttempted] = useState(false)

  // Fetch bestsellers on mount
  useEffect(() => {
    const fetchBestsellers = async () => {
      setLoadingInitial(true)
      try {
        const [ficRes, nonFicRes] = await Promise.all([
          fetch('/api/bestsellers?category=hardcover-fiction'),
          fetch('/api/bestsellers?category=hardcover-nonfiction')
        ])
        
        const ficData = await ficRes.json()
        const nonFicData = await nonFicRes.json()

        setFicBooks(ficData.results?.map((b: any) => b.google).filter(Boolean) || [])
        setNonficBooks(nonFicData.results?.map((b: any) => b.google).filter(Boolean) || [])
      } catch (e) {
        console.error("Failed to fetch bestsellers", e)
      } finally {
        setLoadingInitial(false)
      }
    }

    fetchBestsellers()
  }, [])

  // Fetch books by genre
  const fetchByGenre = async (genre: string) => {
    setLoadingSearch(true)
    setSearchAttempted(true)
    try {
      // Increased maxResults to 30 to fill the row better
      const res = await fetch(`/api/books?q=subject:${encodeURIComponent(genre)}&maxResults=30`)
      
      if (!res.ok) throw new Error('Failed')
      
      const data = await res.json()
      const books = (data.items || []).map((item: any) => ({
        id: item.id,
        volumeInfo: {
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors || [],
            imageLinks: item.volumeInfo.imageLinks
        }
      }))

      setSearchResults(books)
    } catch (error) {
      console.error('Fetch error:', error)
      setSearchResults([])
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setSubmittedSearch(search);
      fetchByGenre(search);
    } else {
      setSearchResults([]);
      setSearchAttempted(false);
      setSubmittedSearch("");
    }
  }

  const handleGenreClick = (genre: string) => {
    setSearch(genre)
    setSubmittedSearch(genre)
    fetchByGenre(genre)
    // Scroll to top of results on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' }) 
  }

  const genres = ['Fantasy', 'Sci-Fi', 'Romance', 'History', 'Mystery', 'Thriller', 'Biography', 'Self-Help', 'Poetry', 'Horror']

  return (
    <div className="flex flex-col lg:flex-row bg-neutral-950 text-neutral-100 min-h-screen pt-20">

      {/* Sidebar - Sticky on Desktop, Static on Mobile */}
      <aside className="w-full lg:w-72 bg-neutral-900/50 border-r border-neutral-800 lg:h-[calc(100vh-5rem)] lg:sticky lg:top-20 flex-shrink-0 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-8">
          
          {/* Search Form */}
          <div>
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Search Genres</h2>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="e.g. Cyberpunk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder-neutral-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-neutral-700 hover:bg-blue-600 rounded-lg text-neutral-300 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          </div>

          {/* Genre List */}
          <div>
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Popular Genres</h2>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreClick(genre)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left flex items-center justify-between group ${
                    submittedSearch === genre 
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                      : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  {genre}
                  <span className={`opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ${submittedSearch === genre ? 'opacity-100 translate-x-0' : ''}`}>
                    &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>


      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 overflow-hidden min-h-[80vh]">
        
        {/* State: Loading Search */}
        {loadingSearch && (
          <div className="space-y-8">
             <RowSkeleton />
          </div>
        )}

        {/* State: Search Results */}
        {!loadingSearch && searchResults.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BookRow title={`Genre Results: ${submittedSearch}`} books={searchResults} />
            <div className="my-8 border-t border-neutral-800" />
          </div>
        )}

        {/* State: No Results Found */}
        {!loadingSearch && searchAttempted && searchResults.length === 0 && (
          <div className="mb-12 bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center max-w-2xl mx-auto">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-white mb-2">No books found for "{submittedSearch}"</h3>
            <p className="text-neutral-400">Try searching for a broader genre like "Fantasy" or "History".</p>
            <button 
              onClick={() => {
                setSearch("")
                setSubmittedSearch("")
                setSearchAttempted(false)
                setSearchResults([])
              }}
              className="mt-6 text-blue-400 hover:text-blue-300 text-sm font-medium underline underline-offset-4"
            >
              Clear search and show bestsellers
            </button>
          </div>
        )}

        {/* State: Bestsellers (Default View) */}
        {!loadingSearch && (!searchAttempted || searchResults.length > 0) && (
          <div className={searchAttempted && searchResults.length > 0 ? "opacity-50 hover:opacity-100 transition-opacity" : ""}>
             
             {loadingInitial ? (
               <>
                 <RowSkeleton />
                 <RowSkeleton />
               </>
             ) : (
               <>
                 <BookRow title="New York Times Best Sellers: Fiction" books={ficBooks} />
                 <div className="h-8" /> {/* Spacer */}
                 <BookRow title="New York Times Best Sellers: Non-Fiction" books={nonficBooks} />
               </>
             )}
          </div>
        )}

      </main>
    </div>
  )
}