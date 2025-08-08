import { NextResponse } from 'next/server';

export async function GET() {
    const nytKey = process.env.NYT_BOOKS_API_KEY;
    const googleKey = process.env.GOOGLE_BOOKS_API_KEY;

    // Get NYT bestsellers
    const nytRes = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${nytKey}`);
    const nytData = await nytRes.json();

    const books = nytData.results.books || [];

    // ISBN to get google books data
    const googleRequests = books.map(async (book: any) => {
        const isbn = book.primary_isbn13 || book.primary_isbn10;

        if (!isbn) return null;

        const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${googleKey}`);
        const googleData = await googleRes.json();
        return {
            nyt: book,
            google: googleData.items?.[0] || null,
        };
    });

    const results = (await Promise.all(googleRequests)).filter(Boolean);

    return NextResponse.json({ results });

}