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