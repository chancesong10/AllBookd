//app/api/book/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Fetches book volume details from the Google Books API.
 * * This endpoint acts as a proxy to hide the Google API key from the client
 * and handles upstream error normalization.
 * * @param request - The incoming Next.js request object.
 * @param params - The dynamic route parameters. 
 * Note: In Next.js 15+, `params` is a Promise that must be awaited.
 * * @returns {Promise<NextResponse>} JSON response containing:
 * - Success: The book volume object from Google.
 * - Error: An object with an `error` message and appropriate HTTP status code.
 * * @example
 * // Request: GET /api/books/vol123
 * // Response: { kind: "books#volume", volumeInfo: { ... } }
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const key = process.env.GOOGLE_BOOKS_API_KEY;
    if (!key) {
        return NextResponse.json(
            { error: 'API key is not set' },
            { status: 500 }
        );
    }

    const { id } = await params;

    const url = new URL(`https://www.googleapis.com/books/v1/volumes/${id}`);
    url.searchParams.set('key', key);

    const res = await fetch(url.toString());
    if (!res.ok) {
        return NextResponse.json(
            { error: `Google API error: ${res.statusText}` },
            { status: res.status }
        );
    }

    const data = await res.json();
    return NextResponse.json(data);
}
