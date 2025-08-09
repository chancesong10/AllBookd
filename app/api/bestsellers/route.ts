import { NextResponse } from 'next/server';

let cache: Record<string, { data: any; timestamp: number }> = {};

export async function GET(request: Request) {
    const nytKey = process.env.NYT_BOOKS_API_KEY;
    const googleKey = process.env.GOOGLE_BOOKS_API_KEY;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'hardcover-fiction';

    const now = Date.now();
    const cached = cache[category];

    if (cached && now - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hours cache
        console.log(`Serving ${category} from cache`);
        return NextResponse.json(cached.data);
    }

    // Get NYT bestsellers
    const nytRes = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/${category}.json?api-key=${nytKey}`);
    const nytData = await nytRes.json();

    if (!nytData?.results?.books) {
        console.error('NYT API error:', nytData);
        return NextResponse.json({ results: [], error: 'Failed to fetch NYT bestsellers' }, { status: 500 });
    }

    // ISBN to get google books data
    const googleRequests = nytData.results.books.map(async (book: any) => {
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
    // Store in category-specific cache
    cache[category] = { data: { results }, timestamp: now };

    return NextResponse.json({ results });
}