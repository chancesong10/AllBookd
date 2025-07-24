'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    if (error) alert(error.message)
    else alert('Check your email for a login link!')
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl mb-4">Login</h1>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 text-black rounded mb-4 w-full"
      />
      <button onClick={handleLogin} className="bg-blue-600 px-4 py-2 rounded">
        {loading ? 'Sending...' : 'Send magic link'}
      </button>
    </div>
  )
}
