import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const key = process.env.GOOGLE_BOOKS_API_KEY;
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || '';

    if (!key) {
        return new Response('API key is not set', { status: 500 });
    }
    
    const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${key}`
    );
    
    if (!res.ok) {
        return new Response('Failed to fetch books', { status: res.status });
    }
    
    const data = await res.json();
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
    });
}

