import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'API key is not set' },
      { status: 500 }
    );
  }
 
  const id = params.id;
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
