'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/providers/auth-provider'

export default function UpdateUsername() {
  const { user } = useAuth()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpdate = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id)

      if (error) throw error
      setMessage('Username updated successfully!')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-white mb-2">Update Username</h3>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded"
        />
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Update
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-sm ${
          message.includes('success') ? 'text-green-400' : 'text-red-400'
        }`}>
          {message}
        </p>
      )}
    </div>
  )
}