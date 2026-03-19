'use client'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully! Redirecting...')
      setTimeout(() => router.push('/dashboard'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-20 mx-auto">
      <div className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-violet-400 tracking-tighter">
            NoxPay<span className="text-slate-500">.</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2">Set your new password</p>
        </div>

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <label className="text-md font-medium" htmlFor="password">
            New Password
          </label>
          <input
            className="rounded-md px-4 py-2.5 bg-slate-900 border border-slate-700 focus:ring-violet-500 focus:border-violet-500 text-sm"
            type="password"
            name="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          <label className="text-md font-medium" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            className="rounded-md px-4 py-2.5 bg-slate-900 border border-slate-700 focus:ring-violet-500 focus:border-violet-500 text-sm"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-md px-4 py-2.5 font-medium transition-colors shadow-[0_0_20px_rgba(124,58,237,0.2)]"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {message && (
          <p className="mt-4 p-4 bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-center text-sm rounded-md">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 p-4 bg-red-900/30 border border-red-700/50 text-red-300 text-center text-sm rounded-md">
            {error}
          </p>
        )}

        <Link
          href="/login"
          className="text-sm text-slate-500 hover:text-violet-400 text-center mt-4 transition-colors"
        >
          &larr; Back to Sign In
        </Link>
      </div>
    </div>
  )
}