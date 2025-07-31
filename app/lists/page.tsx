// app/lists/page.tsx
import { ListsContent } from './ListsContent'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function ListsPage() {
  return <ListsContent />
}