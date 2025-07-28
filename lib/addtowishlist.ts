import { supabase } from '@/lib/supabase'

// Insert into Supabase wishlist
export const addToWishlist = async (book: any, user: any) => {
    if (!user) {
      alert('Please log in to add books to your wishlist.')
      return
    }

    const info = book.volumeInfo
    const thumbnail =
      info.imageLinks?.thumbnail?.replace(/^http:\/\//, 'https://') || ''

    const { error } = await supabase
      .from('wishlist')
      .insert([{
        user_id: user.id,
        book_id: book.id,
        title: info.title,
        authors: info.authors || [],
        thumbnail
      }])

    if (error) {
      console.error(error)
      alert('Failed to add to wishlist')
    } else {
      alert(`✅ Added “${info.title}” to your wishlist`)
    }
  }