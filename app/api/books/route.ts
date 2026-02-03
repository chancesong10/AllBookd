import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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