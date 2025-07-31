// app/ClientLayout.tsx
'use client'

import Navbar from './components/Navbar'
import { useAuth } from '@/app/providers/auth-provider'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth()

  return (
    <>
      <Navbar />
      <main>
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading...</div>
          </div>
        ) : (
          children
        )}
      </main>
    </>
  )
}