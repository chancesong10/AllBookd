'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp, signIn, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    try {
      // Basic client-side validation
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      const user = await signUp(email, password, username)
    
    if (user) {
      setSuccess(true);
      await signIn(email, password);
      router.push('/');
    } else {
      setSuccess(true); // Verification email sent
    }
      if (user) {
        // Immediate success (email confirmed automatically)
        setSuccess(true)
        await signIn(email, password)
        router.push('/')
      } 
      
      else {
        // Email confirmation required
        setSuccess(true)
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Signup failed')
      
      // Specific error messages
      if (error.message.includes('Username must be')) {
        setError(error.message)
      } else if (error.message.includes('Username already taken')) {
        setError('That username is already in use')
      } else if (error.message.includes('User already registered')) {
        setError('An account with this email already exists')
      } else if (error.message.includes('valid email')) {
        setError('Please enter a valid email address')
      } else if (error.message.includes('Password must be')) {
        setError(error.message)
      } else {
        // Generic error fallback
        setSuccess(true);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Create Account</h1>
        
        {success ? (
          <div className="p-4 mb-4 bg-blue-900 text-blue-200 rounded-lg">
            {error ? (
              error
            ) : (
              <>
                Verification email sent to <span className="font-semibold">{email}</span>!
                <br />
                Please check your inbox to confirm your account.
              </>
            )}
          </div>
        ) : (
          <>
            {error && (
              <div className="p-4 mb-4 bg-red-900 text-red-200 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="3-15 characters (a-z, 0-9, _)"
                  required
                  minLength={3}
                  maxLength={15}
                  pattern="[a-zA-Z0-9_]+"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium ${
                  isLoading ? 'bg-blue-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}