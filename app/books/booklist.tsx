import { createClient } from '@supabase/supabase-js'

export default async function books_data() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Example: fetch data
  const { data, error } = await supabase
    .from('books')
    .select('*');

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Books</h1>
      {error && <p className="text-red-500">Error: {error.message}</p>}
      <ul>
        {data?.map((book: any) => (
          <li key={book.id}>{book.title}</li>
        ))}
      </ul>
    </div>
  );
}