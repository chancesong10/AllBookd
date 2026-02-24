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

// ─── VARIANT: GRID (3-col) with POPOUT EFFECT ────────────────────────────────
function GridCovers({ books }: { books: BookCover[] }) {
  return (
    <div className="grid grid-cols-3 gap-4 w-full relative -m-2 p-2">
      {books.slice(0, 6).map((book, i) => (
        <motion.div
          key={book.id || i}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.5, type: "spring", stiffness: 100 }}
          whileHover={{ 
            scale: 1.25, 
            zIndex: 50, 
            rotate: [0, -2, 2, -1, 0],
            transition: { duration: 0.3 }
          }}
          className="group relative aspect-[2/3] overflow-hidden rounded-lg shadow-xl hover:shadow-2xl cursor-pointer"
          style={{
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"
          }}
        >
          <img
            src={book.thumbnail}
            alt={book.title}
            className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
          />
          <motion.div 
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3"
          >
            <p className="text-white text-[10px] font-bold leading-tight line-clamp-2 drop-shadow-lg">{book.title}</p>
            <p className="text-zinc-300 text-[8px] mt-1 truncate font-medium">{book.author}</p>
          </motion.div>
          
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-bl from-white/20 to-transparent" />
        </motion.div>
      ))}
    </div>
  );
}

// ─── VARIANT: STACK (fanned) with DRAMATIC OVERLAP ───────────────────────────
const STACK_STYLES = [
  { rotate: -12, x: -45, y: 15, zIndex: 1 },
  { rotate: -6, x: -25, y: 8, zIndex: 2 },
  { rotate: 0, x: 0, y: 0, zIndex: 3 },
  { rotate: 6, x: 25, y: 5, zIndex: 4 },
  { rotate: 12, x: 45, y: 12, zIndex: 5 },
];

function StackCovers({ books }: { books: BookCover[] }) {
  return (
    <div className="relative flex items-center justify-center w-full h-64 -my-4">
      {books.slice(0, 5).map((book, i) => {
        const s = STACK_STYLES[i];
        return (
          <motion.div
            key={book.id || i}
            initial={{ opacity: 0, scale: 0.6, rotate: s.rotate - 10 }}
            whileInView={{ opacity: 1, scale: 1, rotate: s.rotate }}
            viewport={{ once: true }}
            transition={{ 
              delay: i * 0.12, 
              duration: 0.6, 
              type: "spring", 
              stiffness: 80,
              damping: 12
            }}
            whileHover={{ 
              scale: 1.3, 
              zIndex: 50, 
              rotate: 0,
              y: -20,
              transition: { duration: 0.3, type: "spring", stiffness: 300 }
            }}
            style={{ 
              rotate: s.rotate, 
              x: s.x, 
              y: s.y, 
              zIndex: s.zIndex, 
              position: "absolute",
              filter: "drop-shadow(0 20px 15px rgba(0, 0, 0, 0.5))"
            }}
            className="w-28 h-40 rounded-lg overflow-hidden cursor-pointer border-2 border-white/10"
          >
            <img 
              src={book.thumbnail} 
              alt={book.title} 
              className="w-full h-full object-cover"
            />
            
            {/* Hover info - appears on the book itself */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-2 flex flex-col justify-end"
            >
              <p className="text-white text-[8px] font-bold line-clamp-1">{book.title}</p>
              <p className="text-zinc-300 text-[6px] truncate">{book.author}</p>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── VARIANT: SCATTERED with FLOATING EFFECT ─────────────────────────────────
const SCATTER_STYLES = [
  { rotate: -8,  top: "0%",  left: "-5%",  delay: 0.1 },
  { rotate: 5,   top: "-5%", left: "25%",  delay: 0.3 },
  { rotate: -3,  top: "5%",  left: "55%",  delay: 0.5 },
  { rotate: 10,  top: "45%", left: "-2%",  delay: 0.2 },
  { rotate: -6,  top: "55%", left: "35%",  delay: 0.4 },
  { rotate: 4,   top: "40%", left: "70%",  delay: 0.6 },
  { rotate: -12, top: "75%", left: "15%",  delay: 0.7 },
];

function ScatteredCovers({ books }: { books: BookCover[] }) {
  return (
    <div className="relative w-full h-72 -my-8 -mx-4">
      {books.slice(0, 7).map((book, i) => {
        const s = SCATTER_STYLES[i % SCATTER_STYLES.length];
        return (
          <motion.div
            key={book.id || i}
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              delay: s.delay, 
              duration: 0.6,
              type: "spring",
              stiffness: 70
            }}
            whileHover={{ 
              scale: 1.4, 
              rotate: 0, 
              zIndex: 50,
              y: -15,
              transition: { duration: 0.3, type: "spring", stiffness: 400 }
            }}
            style={{ 
              rotate: s.rotate, 
              top: s.top, 
              left: s.left, 
              position: "absolute", 
              zIndex: i,
              filter: "drop-shadow(0 15px 10px rgba(0, 0, 0, 0.4))"
            }}
            className="w-[24%] aspect-[2/3] rounded-lg overflow-hidden cursor-pointer border border-white/20"
          >
            <img 
              src={book.thumbnail} 
              alt={book.title} 
              className="w-full h-full object-cover"
            />
            
            {/* Minimal hover effect */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 flex items-end p-2"
            >
              <p className="text-white text-[7px] font-bold line-clamp-1">{book.title}</p>
            </motion.div>
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
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="py-32 flex items-center justify-center text-white px-8 relative overflow-visible"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent pointer-events-none" />
      
      <div
        className={`max-w-6xl w-full flex flex-col ${
          isEven ? "md:flex-row" : "md:flex-row-reverse"
        } items-center gap-12 relative`}
      >
        {/* Text card - now with glass morphism and floating effect */}
        <motion.div 
          initial={{ x: isEven ? -50 : 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex-1 space-y-4 p-10 rounded-3xl bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl relative overflow-hidden group"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <h3 className="text-3xl font-bold tracking-tight text-white relative">
            {title}
          </h3>
          <p className="text-base text-zinc-200 leading-relaxed relative">
            {description}
          </p>
          
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
        </motion.div>

        {/* Book covers panel - now with NO background and books popping out */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex-1 w-full max-w-md min-h-[280px] relative overflow-visible"
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
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
        </motion.div>
      </div>
    </motion.section>
  );
};