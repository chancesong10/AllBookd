//app/verify-email/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already verified
    const timer = setTimeout(() => {
      router.push('/')
    }, 10000) // Redirect after 10 seconds

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Verify Your Email</h1>
        <p className="text-gray-300 mb-6">
          We've sent a verification link to your email address. 
          Please check your inbox and click the link to complete your registration.
        </p>
        <div className="animate-pulse text-blue-400 mb-6">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <Link href="/" className="text-blue-400 hover:text-blue-300">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}