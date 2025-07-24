'use client';

import Link from 'next/link';
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
    const [query, setQuery] = useState('')
    const router = useRouter()

    const Links = [
        {href: "/", text: "Home"},
        {href: "/books", text: "Books"},
        {href: "/lists", text: "Lists"},
        {href: "/about", text: "About"},
    ]

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim()) {
          router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        }
    }

    return (
        <nav>
            <div className="fixed bg-gray-900 p-4 w-full flex items-center">
                <div>
                    <Link href="/" className="ml-4 text-white text-2xl font-bold">
                        AllBookd
                    </Link>
                </div>
                <div className="flex-1 flex justify-center ">
                    <ul className="flex space-x-4">
                        {Links.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="text-white px-4 py-2 rounded-md hover:bg-blue-800 transition">
                                    {link.text}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="ml-auto relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                    type="text" 
                    placeholder="Search Books"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-4 py-2 rounded-xl bg-blue-950 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700"/>
                </div>
            </div>
        </nav>
    )
}