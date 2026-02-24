//app/lib/addtowishlist.ts
import { supabase } from '@/lib/supabase/client'

export const addToWishlist = async (book: any, user: any) => {
  try {
    if (!user) {
      throw new Error('User not authenticated')
    }

    const info = book.volumeInfo
    const thumbnail = info.imageLinks?.thumbnail?.replace(/^http:\/\//, 'https://') || ''
    
    console.log('Attempting to add book:', {
      bookId: book.id,
      userId: user.id,
      title: info.title
    })

    const { data, error } = await supabase
      .from('wishlist')
      .insert([{
        user_id: user.id,
        book_id: book.id,
        title: info.title,
        authors: info.authors || [],
        thumbnail
      }])
      .select() // Add this to return the inserted data

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      })
      throw error
    }

    console.log('Successfully added:', data)
    return data
  } catch (error) {
    console.error('Full error in addToWishlist:', {
      error,
      bookId: book?.id,
      userId: user?.id
    })
    throw error // Re-throw to handle in the UI
  }
}