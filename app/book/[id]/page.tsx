import { notFound } from "next/navigation";
import parse from "html-react-parser";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/book/${id}`, { cache: "no-store" }); 
    if (!res.ok) return notFound();

    const book = await res.json();
    const info = book.volumeInfo;

    return (
        <div className="min-h-screen bg-black pt-24 text-white">
          <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto gap-6 px-4">
            
            {/* Cover image */}
            {info.imageLinks?.thumbnail && (
              <img
                src={`https://books.google.com/books/publisher/content/images/frontcover/${id}?fife=w400-h600&source=gbs_api`}
                alt={info.title}
                className="w-full md:w-60 h-80 object-contain rounded shadow-lg bg-gray-900"
              />
            )}
      
            {/* Book details */}
            <div className="flex flex-col justify-start">
              <h1 className="text-3xl font-bold mb-2">{info.title}</h1>
      
              {info.authors && (
                <p className="text-lg text-gray-300 mb-1">
                  by {info.authors.join(", ")}
                </p>
              )}
      
              {info.publishedDate && (
                <p className="text-sm text-gray-400 mb-1">
                  Published: {info.publishedDate}
                </p>
              )}
      
              {info.averageRating && (
                <p className="text-yellow-400 mb-2">
                  ⭐ {info.averageRating} / 5 ({info.ratingsCount} ratings)
                </p>
              )}
      
              {info.publisher && (
                <p className="text-sm text-gray-400 mb-1">
                  Publisher: {info.publisher}
                </p>
              )}
      
              {info.categories && (
                <p className="text-sm text-gray-400 mb-1">
                  Categories: {info.categories.join(", ")}
                </p>
              )}
      
              {info.description && (
                <p className="mt-4 text-gray-200 leading-relaxed">
                  {parse(info.description)}
                </p>
              )}
            </div>
          </div>
        </div>
      );
}