import Link from 'next/link';

export default function Navbar() {
    const Links = [
        {href: "/", text: "Home"},
        {href: "/books", text: "Books"},
        {href: "/lists", text: "Lists"},
        {href: "/about", text: "About"},
    ]

    return (
        <nav>
            <div className="fixed bg-gray-900 p-4 w-full">
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
        </nav>
    )
}