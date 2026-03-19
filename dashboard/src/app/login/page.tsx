'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, Suspense } from 'react'

function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlMessage = searchParams.get('message')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/auth/callback',
        data: { display_name: displayName || email.split('@')[0] },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for a verification link to complete sign up.')
    }
    setLoading(false)
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-16 mx-auto">
      <div className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-violet-400 tracking-tighter">
            NoxPay<span className="text-slate-500">.</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {isSignUp ? 'Create your merchant account' : 'Sign in to your merchant dashboard'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex mb-6 bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(''); setMessage('') }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
              !isSignUp ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(''); setMessage('') }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
              isSignUp ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="flex flex-col gap-4">
          {isSignUp && (
            <>
              <label className="text-sm font-medium" htmlFor="displayName">
                Display Name
              </label>
              <input
                className="rounded-md px-4 py-2.5 bg-slate-900 border border-slate-700 focus:ring-violet-500 focus:border-violet-500 text-sm"
                name="displayName"
                placeholder="Your name or company"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </>
          )}

          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-md px-4 py-2.5 bg-slate-900 border border-slate-700 focus:ring-violet-500 focus:border-violet-500 text-sm"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            className="rounded-md px-4 py-2.5 bg-slate-900 border border-slate-700 focus:ring-violet-500 focus:border-violet-500 text-sm"
            type="password"
            name="password"
            placeholder={isSignUp ? 'Minimum 8 characters' : '••••••••'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isSignUp ? 8 : undefined}
          />

          {!isSignUp && (
            <Link
              href="/forgot-password"
              className="text-xs text-slate-500 hover:text-violet-400 text-right transition-colors -mt-2"
            >
              Forgot password?
            </Link>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-md px-4 py-2.5 font-medium transition-colors shadow-[0_0_20px_rgba(124,58,237,0.2)] mt-2"
          >
            {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {(urlMessage || message) && (
          <p className="mt-4 p-4 bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-center text-sm rounded-md">
            {message || urlMessage}
          </p>
        )}

        {error && (
          <p className="mt-4 p-4 bg-red-900/30 border border-red-700/50 text-red-300 text-center text-sm rounded-md">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}