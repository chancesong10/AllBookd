//app/lib/removefromwishlist.ts
import { supabase } from '@/lib/supabase/client'
//remove from whislist
/**
 * Remove a book from the wishlist.
 * @param id  The UUID of the wishlist row to delete.
 */
export async function removeFromWishlist(id: string) {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to remove from wishlist:', error)
    throw error
  }
}
