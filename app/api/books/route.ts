import { NextRequest, NextResponse } from 'next/server';

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
  // parse paging params (defaults: first 40 results)
  const maxResults = Math.min(
    40,
    parseInt(searchParams.get('maxResults') || '40', 10)
  );
  const startIndex = parseInt(searchParams.get('startIndex') || '0', 10);

  // build the Google Books URL
  const url = new URL('https://www.googleapis.com/books/v1/volumes');
  url.searchParams.set('q', query);
  url.searchParams.set('key', key);
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('startIndex', String(startIndex));

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json(
      { error: `Google API error: ${res.statusText}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  // return the full payload plus our paging info
  return NextResponse.json({
    query,
    startIndex,
    maxResults,
    totalItems: data.totalItems,
    items: data.items ?? [],
  });
}
