"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface FeatureSectionProps {
  title: string;
  description: string;
  index: number;
}

interface BookCover {
  title: string;
  author: string;
  thumbnail: string;
  id?: string; // Add id for better cover URLs
}

// Each section gets its own search query to surface contextually relevant covers
const SECTION_QUERIES = [
  "bestseller fiction 2026",       // "Share Your Taste"
  "must read classics literature",  // "Keep Track"
  "popular nonfiction 2026",        // "Monitor Your Journey"
];

async function fetchCovers(query: string, count: number): Promise<BookCover[]> {
  try {
    // Use your existing API route instead of calling Google directly
    const res = await fetch(`/api/books?q=${encodeURIComponent(query)}&maxResults=${count}`);
    
    if (!res.ok) {
      console.error("API responded with status:", res.status);
      return [];
    }
    
    const data = await res.json();
    
    // The API returns data in this structure: { items: [...], totalItems, etc. }
    return (data.items ?? [])
      .map((item: any) => {
        const volumeInfo = item.volumeInfo || {};
        const links = volumeInfo.imageLinks;
        
        // Try to get a high-quality cover using the book ID (like your search page does)
        let thumbnail = null;
        
        // First try the high-quality cover format from your search page
        if (item.id) {
          thumbnail = `https://books.google.com/books/publisher/content/images/frontcover/${item.id}?fife=w400-h600&source=gbs_api`;
        }
        
        // Fallback to the regular thumbnail if the high-quality one fails
        if (!thumbnail && links) {
          thumbnail = links.thumbnail || links.smallThumbnail || null;
          if (thumbnail) {
            thumbnail = thumbnail.replace("http://", "https://");
          }
        }
        
        return {
          id: item.id,
          title: volumeInfo.title ?? "",
          author: volumeInfo.authors?.[0] ?? "Unknown Author",
          thumbnail,
        };
      })
      .filter((b: BookCover) => b.thumbnail); // Only keep books with covers
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

// ─── VARIANT: GRID (3-col) ────────────────────────────────────────────────────
function GridCovers({ books }: { books: BookCover[] }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 w-full">
      {books.slice(0, 6).map((book, i) => (
        <motion.div
          key={book.id || i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07, duration: 0.45 }}
          className="group relative aspect-[2/3] overflow-hidden rounded-md shadow-lg"
        >
          <img
            src={book.thumbnail}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // If the high-quality image fails, try the fallback or hide
              const target = e.target as HTMLImageElement;
              // You could set a fallback image here if needed
              target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
            <p className="text-white text-[9px] font-medium leading-tight line-clamp-2">{book.title}</p>
            <p className="text-zinc-400 text-[8px] mt-0.5 truncate">{book.author}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── VARIANT: STACK (fanned) ──────────────────────────────────────────────────
const STACK_STYLES = [
  { rotate: -9, x: -36, y: 8,  zIndex: 1 },
  { rotate: -3, x: -12, y: 2,  zIndex: 2 },
  { rotate:  2, x:  12, y: 0,  zIndex: 3 },
  { rotate:  8, x:  36, y: 6,  zIndex: 4 },
];

function StackCovers({ books }: { books: BookCover[] }) {
  return (
    <div className="relative flex items-center justify-center w-full h-52">
      {books.slice(0, 4).map((book, i) => {
        const s = STACK_STYLES[i];
        return (
          <motion.div
            key={book.id || i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, type: "spring", stiffness: 130 }}
            whileHover={{ scale: 1.1, zIndex: 30, rotate: 0 }}
            style={{ rotate: s.rotate, x: s.x, y: s.y, zIndex: s.zIndex, position: "absolute" }}
            className="w-24 h-36 rounded-md shadow-2xl overflow-hidden cursor-pointer"
          >
            <img 
              src={book.thumbnail} 
              alt={book.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── VARIANT: SCATTERED ───────────────────────────────────────────────────────
const SCATTER_STYLES = [
  { rotate: -5,  top: "4%",  left: "2%"  },
  { rotate:  3,  top: "2%",  left: "34%" },
  { rotate: -2,  top: "6%",  left: "65%" },
  { rotate:  5,  top: "48%", left: "8%"  },
  { rotate: -4,  top: "50%", left: "46%" },
  { rotate:  2,  top: "44%", left: "74%" },
];

function ScatteredCovers({ books }: { books: BookCover[] }) {
  return (
    <div className="relative w-full h-60">
      {books.slice(0, 6).map((book, i) => {
        const s = SCATTER_STYLES[i];
        return (
          <motion.div
            key={book.id || i}
            initial={{ opacity: 0, scale: 0.75 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.09, duration: 0.45 }}
            whileHover={{ scale: 1.12, rotate: 0, zIndex: 30 }}
            style={{ rotate: s.rotate, top: s.top, left: s.left, position: "absolute", zIndex: i }}
            className="w-[22%] aspect-[2/3] rounded-md shadow-xl overflow-hidden cursor-pointer"
          >
            <img 
              src={book.thumbnail} 
              alt={book.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

type CoverVariant = "grid" | "stack" | "scattered";
const VARIANTS: CoverVariant[] = ["stack", "grid", "scattered"];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const FeatureSection = ({ title, description, index }: FeatureSectionProps) => {
  const isEven = index % 2 === 0;
  const [books, setBooks] = useState<BookCover[]>([]);
  const [loading, setLoading] = useState(true);

  const variant: CoverVariant = VARIANTS[index % VARIANTS.length];
  const query = SECTION_QUERIES[index % SECTION_QUERIES.length];

  useEffect(() => {
    let isMounted = true;
    
    fetchCovers(query, 8).then((results) => {
      if (isMounted) {
        setBooks(results);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [query]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-24 flex items-center justify-center text-white px-8"
    >
      <div
        className={`max-w-4xl w-full flex flex-col ${
          isEven ? "md:flex-row" : "md:flex-row-reverse"
        } items-center gap-10`}
      >
        {/* Text card */}
        <div className="flex-1 space-y-3 p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
          <h3 className="text-2xl font-semibold tracking-tight text-white">{title}</h3>
          <p className="text-sm text-zinc-300 leading-relaxed">{description}</p>
        </div>

        {/* Book covers panel */}
        <div className="flex-1 w-full max-w-sm min-h-[200px] bg-zinc-800/40 backdrop-blur-sm rounded-xl border border-white/5 p-4 flex items-center justify-center">
          {loading ? (
            <div className="w-6 h-6 border border-white/20 border-t-white/70 rounded-full animate-spin" />
          ) : books.length === 0 ? (
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest">No covers found</span>
          ) : variant === "grid" ? (
            <GridCovers books={books} />
          ) : variant === "stack" ? (
            <StackCovers books={books} />
          ) : (
            <ScatteredCovers books={books} />
          )}
        </div>
      </div>
    </motion.section>
  );
};