//app/components/FeatureSection.tsx
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
  id?: string;
}

const SECTION_QUERIES = [
  "bestseller fiction 2026",
  "must read classics literature",
  "popular nonfiction 2026",
];

async function fetchCovers(query: string, count: number): Promise<BookCover[]> {
  try {
    const res = await fetch(`/api/books?q=${encodeURIComponent(query)}&maxResults=${count}`);
    if (!res.ok) return [];
    const data = await res.json();
    
    return (data.items ?? [])
      .map((item: any) => {
        const volumeInfo = item.volumeInfo || {};
        let thumbnail = null;
        
        if (item.id) {
          thumbnail = `https://books.google.com/books/publisher/content/images/frontcover/${item.id}?fife=w400-h600&source=gbs_api`;
        }
        
        return {
          id: item.id,
          title: volumeInfo.title ?? "",
          author: volumeInfo.authors?.[0] ?? "Unknown Author",
          thumbnail,
        };
      })
      .filter((b: BookCover) => b.thumbnail);
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

// ─── VARIANT: GRID with BIGGER BOOKS & SHINY LINES ───────────────────────────
function GridCovers({ books }: { books: BookCover[] }) {
  return (
    <div className="grid grid-cols-3 gap-5 w-full relative -m-5 p-5">
      {books.slice(0, 6).map((book, i) => (
        <motion.div
          key={book.id || i}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.5, type: "spring", stiffness: 100 }}
          whileHover={{ 
            scale: 1.5, 
            zIndex: 50,
            // FIXED: Changed from multiple keyframes to a simple rotation
            rotate: [0, 5, -5, 0],
            transition: { 
              duration: 0.5,
              // FIXED: Removed "spring" from the rotation animation
              rotate: { type: "tween", ease: "easeInOut" }
            }
          }}
          className="group relative aspect-[2/3] overflow-visible cursor-pointer"
        >
          {/* Shiny rotating border lines */}
          <motion.div
            className="absolute -inset-3 rounded-xl opacity-0 group-hover:opacity-100"
            animate={{
              boxShadow: [
                "0 0 0 2px rgba(255,255,255,0.5), 0 0 15px 5px rgba(255,255,255,0.3)",
                "0 0 0 4px rgba(255,255,255,0.8), 0 0 25px 10px rgba(255,255,255,0.5)",
                "0 0 0 2px rgba(255,255,255,0.5), 0 0 15px 5px rgba(255,255,255,0.3)",
              ]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Decorative corner lines */}
          <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                <stop offset="50%" stopColor="cyan" stopOpacity="0.5" />
                <stop offset="100%" stopColor="white" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Main book image - BIGGER */}
          <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl">
            <img
              src={book.thumbnail}
              alt={book.title}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            />
            
            {/* Hover overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-3"
            >
              <p className="text-white text-[10px] font-bold leading-tight line-clamp-2">{book.title}</p>
              <p className="text-zinc-300 text-[8px] mt-1 truncate">{book.author}</p>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── VARIANT: STACK with BIGGER BOOKS & SHINY LINES ──────────────────────────
const STACK_STYLES = [
  { rotate: -14, x: -60, y: 25, zIndex: 1 },
  { rotate: -7, x: -35, y: 12, zIndex: 2 },
  { rotate: 0, x: 0, y: 0, zIndex: 3 },
  { rotate: 7, x: 35, y: 10, zIndex: 4 },
  { rotate: 14, x: 60, y: 20, zIndex: 5 },
];

function StackCovers({ books }: { books: BookCover[] }) {
  return (
    <div className="relative flex items-center justify-center w-full h-80 -my-6">
      {books.slice(0, 5).map((book, i) => {
        const s = STACK_STYLES[i];
        return (
          <motion.div
            key={book.id || i}
            initial={{ opacity: 0, scale: 0.5, rotate: s.rotate - 15 }}
            whileInView={{ opacity: 1, scale: 1, rotate: s.rotate }}
            viewport={{ once: true }}
            transition={{ 
              delay: i * 0.15, 
              duration: 0.7, 
              type: "spring", 
              stiffness: 70
            }}
            whileHover={{ 
              scale: 1.6, 
              zIndex: 50, 
              rotate: 0,
              y: -35,
              transition: { duration: 0.4, type: "spring", stiffness: 300 }
            }}
            style={{ 
              rotate: s.rotate, 
              x: s.x, 
              y: s.y, 
              zIndex: s.zIndex, 
              position: "absolute",
            }}
            className="group"
          >
            {/* Shiny border that pulses */}
            <motion.div
              className="absolute -inset-3 rounded-lg opacity-0 group-hover:opacity-100"
              animate={{
                boxShadow: [
                  "0 0 0 2px rgba(255,215,0,0.6), 0 0 20px 5px rgba(255,215,0,0.3)",
                  "0 0 0 4px rgba(255,215,0,0.9), 0 0 30px 10px rgba(255,215,0,0.5)",
                  "0 0 0 2px rgba(255,215,0,0.6), 0 0 20px 5px rgba(255,215,0,0.3)",
                ]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Book image - BIGGER */}
            <div className="relative w-32 h-48 rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <img 
                src={book.thumbnail} 
                alt={book.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            
            {/* Hover tooltip */}
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-[8px] font-bold border border-white/20"
            >
              {book.title}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── VARIANT: SCATTERED with BIGGER BOOKS & SHINY LINES ──────────────────────
const SCATTER_STYLES = [
  { rotate: -12,  top: "-8%",  left: "-10%",  delay: 0.1 },
  { rotate: 10,   top: "-10%", left: "30%",   delay: 0.3 },
  { rotate: -7,   top: "0%",   left: "60%",   delay: 0.5 },
  { rotate: 15,   top: "40%",  left: "-8%",   delay: 0.2 },
  { rotate: -10,  top: "50%",  left: "38%",   delay: 0.4 },
  { rotate: 8,    top: "35%",  left: "75%",   delay: 0.6 },
  { rotate: -18,  top: "78%",  left: "8%",    delay: 0.7 },
  { rotate: 12,   top: "85%",  left: "58%",   delay: 0.8 },
];

function ScatteredCovers({ books }: { books: BookCover[] }) {
  return (
    <div className="relative w-full h-96 -my-8 -mx-8">
      {books.slice(0, 8).map((book, i) => {
        const s = SCATTER_STYLES[i % SCATTER_STYLES.length];
        return (
          <motion.div
            key={book.id || i}
            initial={{ opacity: 0, scale: 0.3, y: 60 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              delay: s.delay, 
              duration: 0.8,
              type: "spring",
              stiffness: 50
            }}
            whileHover={{ 
              scale: 1.7, 
              rotate: 0, 
              zIndex: 50,
              y: -30,
              transition: { duration: 0.4, type: "spring", stiffness: 400 }
            }}
            style={{ 
              rotate: s.rotate, 
              top: s.top, 
              left: s.left, 
              position: "absolute", 
              zIndex: i,
            }}
            className="group"
          >
            {/* Shiny border with glow */}
            <motion.div
              className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-100"
              animate={{
                boxShadow: [
                  "0 0 0 2px rgba(255,255,255,0.5), 0 0 30px 10px rgba(255,255,255,0.3)",
                  "0 0 0 4px rgba(255,255,255,0.9), 0 0 50px 20px rgba(255,255,255,0.5)",
                  "0 0 0 2px rgba(255,255,255,0.5), 0 0 30px 10px rgba(255,255,255,0.3)",
                ]
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Book image - BIGGER */}
            <div className="relative w-32 h-48 rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <img 
                src={book.thumbnail} 
                alt={book.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

type CoverVariant = "grid" | "stack" | "scattered";
const VARIANTS: CoverVariant[] = ["stack", "grid", "scattered"];

// ─── MAIN COMPONENT (COMPLETELY REVERTED TEXT BOXES) ─────────────────────────
export const FeatureSection = ({ title, description, index }: FeatureSectionProps) => {
  const isEven = index % 2 === 0;
  const [books, setBooks] = useState<BookCover[]>([]);
  const [loading, setLoading] = useState(true);

  const variant: CoverVariant = VARIANTS[index % VARIANTS.length];
  const query = SECTION_QUERIES[index % SECTION_QUERIES.length];

  useEffect(() => {
    let isMounted = true;
    
    fetchCovers(query, 12).then((results) => {
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
      className="py-24 flex items-center justify-center text-white px-8 overflow-visible"
    >
      <div
        className={`max-w-4xl w-full flex flex-col ${
          isEven ? "md:flex-row" : "md:flex-row-reverse"
        } items-center gap-10`}
      >
        {/* Text card - COMPLETELY REVERTED TO ORIGINAL */}
        <div className="flex-1 space-y-3 p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
          <h3 className="text-2xl font-semibold tracking-tight text-white">{title}</h3>
          <p className="text-sm text-zinc-300 leading-relaxed">{description}</p>
        </div>

        {/* Book covers panel - BIGGER with SHINY LINES */}
        <div className="flex-1 w-full max-w-md min-h-[300px] relative overflow-visible">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
            </div>
          ) : books.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <span className="text-zinc-500 text-xs uppercase tracking-widest">No covers found</span>
            </div>
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