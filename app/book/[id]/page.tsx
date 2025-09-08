import { notFound } from "next/navigation";

async function getBook(id: string) {
    // Call your own API route
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/book/${id}`, { cache: "no-store" }); 
    
    if (!res.ok) return null;
    return res.json();
}

export default async function BookPage({ params }: { params: { id: string } }) {
    const book = await getBook(params.id);

    if (!book) return notFound();

    const info = book.volumeInfo;

    return (
        <div className="pt-24 p-6 text-white bg-black min-h-screen">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover image */}
            {info.imageLinks?.thumbnail && (
              <img
                src={info.imageLinks.thumbnail.replace(/^http:\/\//, "https://")}
                alt={info.title}
                className="w-full h-full object-contain rounded mb-2"
              />
            )}
    
            {/* Book details */}
            <div>
              <h1 className="text-3xl font-bold">{info.title}</h1>
    
              {info.authors && (
                <p className="text-lg text-gray-300">by {info.authors.join(", ")}</p>
              )}
    
              {info.publishedDate && (
                <p className="text-sm text-gray-400 mt-1">
                  Published: {info.publishedDate}
                </p>
              )}
    
              {info.averageRating && (
                <p className="mt-2 text-yellow-400">
                  ⭐ {info.averageRating} / 5 ({info.ratingsCount} ratings)
                </p>
              )}
    
              {info.publisher && (
                <p className="text-sm text-gray-400 mt-1">Publisher: {info.publisher}</p>
              )}
    
              {info.categories && (
                <p className="text-sm text-gray-400 mt-1">
                  Categories: {info.categories.join(", ")}
                </p>
              )}
    
              {info.description && (
                <p className="mt-4 text-gray-200 leading-relaxed">
                  {info.description}
                </p>
              )}
            </div>
          </div>
        </div>
      );
}