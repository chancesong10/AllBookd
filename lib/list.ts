//app/lib/list.ts
import { supabase } from '@/lib/supabase/client'

// Create a new list
export async function createList(userId: string, name: string) {
  const { data, error } = await supabase
    .from('lists')
    .insert([{ user_id: userId, name }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Fetch all lists for a user
export async function getLists(userId: string) {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// Add a book to a list
export async function addToList(listId: string, book: any) {
  const info = book.volumeInfo
  const thumbnail =
    info.imageLinks?.thumbnail?.replace(/^http:\/\//, 'https://') || ''

  const { data, error } = await supabase
    .from('list_items')
    .insert([
      {
        list_id: listId,
        book_id: book.id,
        title: info.title,
        authors: info.authors || [],
        thumbnail
      }
    ])
    .select()

  if (error) throw error
  return data
}

// Remove book from a list
export async function removeFromList(itemId: string) {
  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
}
