//app/types/books.ts
export interface VolumeInfo {
    title: string
    authors?: string[]
    imageLinks?: {
        thumbnail?: string
        small?: string
        medium?: string
        large?: string
        extraLarge?: string
    }
}

export interface BookItem {
    id: string
    volumeInfo: VolumeInfo
}

export interface BookItemList {
    id: string
    book_id: string
    title: string
    authors: string[] | string
    thumbnail: string | null
    created_at: string
    list_id?: string
}

export interface WishlistItem {
    id: string
    title: string
    authors: string[] | string | null
    thumbnail?: string | null
}

export interface BookRowProps {
    title: string
    books: BookItem[]
}

export interface UserList {
    id: string
    name: string
    created_at: string
}

export interface BookCover {
    title: string;
    author: string;
    thumbnail: string;
    id?: string;
}