//app/book/[id]/page.tsx
import { notFound } from "next/navigation";
import parse from "html-react-parser";
import { createClient } from "@/lib/supabase/server";
import AddToListButton from "@/app/components/addtolistbutton";
import { cookies } from "next/headers";

// Helper to format large numbers (e.g. ratings count)
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Book Data
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/book/${id}`, { cache: "no-store" });
  if (!res.ok) return notFound();
  
  const book = await res.json();
  const info = book.volumeInfo;
  
  // 2. Fetch User Session (Server-Side)
  let user = null;
  try {
    const supabase = await createClient() // <--- Await the client creation
    const { data: { session } } = await supabase.auth.getSession()
    user = session?.user || null
  } catch (e) {
    console.log("Could not fetch user server-side")
  }

  // 3. Image Logic (High Res)
  const coverImage = `https://books.google.com/books/publisher/content/images/frontcover/${id}?fife=w400-h600&source=gbs_api` || info.imageLinks?.thumbnail?.replace(/^http:\/\//, 'https://');

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 overflow-hidden selection:bg-blue-500/30">
      
      {/* --- AMBIENT BACKGROUND --- */}
      {/* This creates the blurred colorful glow behind the content */}
      <div className="absolute inset-0 z-0">
        <div 
            className="absolute inset-0 bg-cover bg-center blur-[100px] opacity-20 scale-110"
            style={{ backgroundImage: `url(${coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40" />
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:grid md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] gap-10 lg:gap-16">
          
          {/* --- LEFT COLUMN: Cover & Actions --- */}
          <div className="flex flex-col gap-6 items-center md:items-start">
            {/* Book Cover */}
            <div className="relative aspect-[2/3] w-[240px] md:w-full rounded-xl shadow-2xl shadow-black/50 border border-neutral-800 overflow-hidden group">
              <img
                src={coverImage}
                alt={info.title}
                className="w-full h-full object-cover"
              />
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-[240px] md:max-w-full">
               <AddToListButton book={book} user={user} />
               
               {info.previewLink && (
                 <a 
                   href={info.previewLink} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="mt-3 block w-full text-center py-2.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-sm font-medium transition-colors"
                 >
                   Preview on Google Books
                 </a>
               )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: Details --- */}
          <div className="flex flex-col justify-start">
            
            {/* Title & Author */}
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3 text-white">
                {info.title}
              </h1>
              {info.subtitle && (
                <p className="text-xl text-neutral-400 mb-3 font-medium">{info.subtitle}</p>
              )}
              {info.authors && (
                <p className="text-lg md:text-xl text-neutral-300">
                  by <span className="text-blue-400 font-semibold">{info.authors.join(", ")}</span>
                </p>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-neutral-800 py-6 mb-8">
              
              {/* Rating */}
              <div className="flex flex-col items-center md:items-start border-r border-neutral-800 sm:border-r-0 md:border-r last:border-0 px-2">
                 <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-1">Rating</span>
                 <div className="flex items-center gap-1.5 text-lg font-bold text-neutral-200">
                    <span className="text-yellow-500">★</span> 
                    {info.averageRating || 'N/A'}
                    <span className="text-xs font-normal text-neutral-500 ml-1">
                      ({info.ratingsCount ? formatNumber(info.ratingsCount) : 0})
                    </span>
                 </div>
              </div>

              {/* Pages */}
              <div className="flex flex-col items-center md:items-start border-neutral-800 sm:border-r md:border-r last:border-0 px-2">
                 <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-1">Length</span>
                 <span className="text-lg font-bold text-neutral-200">
                    {info.pageCount} <span className="text-sm font-normal text-neutral-500">pages</span>
                 </span>
              </div>

              {/* Published Date */}
              <div className="flex flex-col items-center md:items-start border-r border-neutral-800 last:border-0 px-2">
                 <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-1">Released</span>
                 <span className="text-lg font-bold text-neutral-200">
                    {info.publishedDate?.substring(0, 4) || 'Unknown'}
                 </span>
              </div>

              {/* Publisher / Language */}
              <div className="flex flex-col items-center md:items-start px-2">
                 <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-1">Language</span>
                 <span className="text-lg font-bold text-neutral-200 uppercase">
                    {info.language || 'EN'}
                 </span>
              </div>
            </div>

            {/* Categories */}
            {info.categories && (
              <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
                {info.categories.map((cat: string) => (
                  <span key={cat} className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-full border border-neutral-700 transition-colors cursor-default">
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="prose prose-invert prose-lg max-w-none text-neutral-300 leading-relaxed">
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Synopsis</h3>
              {info.description ? (
                 // Using a specific class to style the HTML content from Google
                 <div className="[&>p]:mb-4 [&>b]:text-white [&>i]:text-blue-300 opacity-90">
                    {parse(info.description)}
                 </div>
              ) : (
                <p className="italic text-neutral-500">No description available for this title.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}