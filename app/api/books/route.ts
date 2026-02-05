import { NextRequest, NextResponse } from 'next/server';

/**
 * Force dynamic rendering for this route (no static optimization)
 */
export const dynamic = 'force-dynamic';

/**
 * Disable caching and revalidation for this route
 */
export const revalidate = 0;

/**
 * GET handler for searching Google Books API
 * 
 * @param {NextRequest} request - The incoming Next.js request object
 * @returns {Promise<NextResponse>} JSON response containing book search results or error
 * 
 * @description
 * Searches the Google Books API with the following query parameters:
 * - q: Search query string (required)
 * - maxResults: Maximum number of results to return (default: 40, max: 40)
 * - startIndex: Pagination offset (default: 0)
 * 
 * @example
 * // Search for books about TypeScript
 * GET /api/books?q=typescript&maxResults=10&startIndex=0
 * 
 * @throws {500} If Google Books API key is not configured
 * @throws {400} If query parameter is missing or empty
 * @throws {500} If the external API request fails
 */
export async function GET(request: NextRequest) {
    const key = process.env.GOOGLE_BOOKS_API_KEY;
    if (!key) {
        return NextResponse.json(
            { error: 'API key is not set' },
            { status: 500 }
        );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
        return NextResponse.json(
            { error: 'Query parameter is required' },
            { status: 400 }
        );
    }

    const maxResults = Math.min(
        40,
        parseInt(searchParams.get('maxResults') || '40', 10)
    );
    const startIndex = parseInt(searchParams.get('startIndex') || '0', 10);

    const url = new URL('https://www.googleapis.com/books/v1/volumes');
    url.searchParams.set('q', query);
    url.searchParams.set('key', key);
    url.searchParams.set('maxResults', String(maxResults));
    url.searchParams.set('startIndex', String(startIndex));

    try {
        const res = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Google Books API error:', res.status, errorText);
            return NextResponse.json(
                { error: `Google API error: ${res.statusText}` },
                { status: res.status }
            );
        }

        const data = await res.json();

        return NextResponse.json({
            query,
            startIndex,
            maxResults,
            totalItems: data.totalItems || 0,
            items: data.items || [],
        });
    } catch (error: any) {
        console.error('Error fetching from Google Books:', error);
        return NextResponse.json(
            { error: 'Failed to fetch books', details: error.message },
            { status: 500 }
        );
    }
}