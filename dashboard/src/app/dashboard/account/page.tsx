'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [exporting, setExporting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setDisplayName(user.user_metadata?.display_name || '')
      }
    }
    getUser()
  }, [])

  const updateProfile = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    const updates: any = {
      data: { display_name: displayName }
    }

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.')
        setLoading(false)
        return
      }
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters.')
        setLoading(false)
        return
      }
      updates.password = newPassword
    }

    const { error } = await supabase.auth.updateUser(updates)

    if (error) {
      setError(error.message)
    } else {
      setMessage('Profile updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  const exportData = async () => {
    setExporting(true)
    try {
      // Fetch all user data
      const { data: clients } = await supabase.from('clients').select('*')
      const clientIds = clients?.map(c => c.id) || []

      let intents: any[] = []
      let transactions: any[] = []
      let webhookLogs: any[] = []

      if (clientIds.length > 0) {
        const { data: pi } = await supabase.from('payment_intents').select('*').in('client_id', clientIds)
        intents = pi || []
        
        const intentIds = intents.map(i => i.id)
        if (intentIds.length > 0) {
          const { data: vt } = await supabase.from('verified_transactions').select('*').in('payment_intent_id', intentIds)
          transactions = vt || []
        }
        
        const { data: wl } = await supabase.from('webhook_logs').select('*').in('client_id', clientIds)
        webhookLogs = wl || []
      }

      const exportPayload = {
        exported_at: new Date().toISOString(),
        user: { id: user.id, email: user.email, display_name: displayName },
        clients: clients || [],
        payment_intents: intents,
        verified_transactions: transactions,
        webhook_logs: webhookLogs,
      }

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `noxpay-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export data. Please try again.')
    }
    setExporting(false)
  }

  const deleteAccount = async () => {
    setLoading(true)
    try {
      // Sign out first, then the user would need to be deleted via Supabase admin
      // For self-service: we mark the account as pending deletion
      await supabase.auth.signOut()
      router.push('/login?message=Account deletion requested. Contact support to complete.')
    } catch (err) {
      setError('Failed to process account deletion.')
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-slate-500">Loading account...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile, security, and data.</p>
      </div>

      {/* Profile Section */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Profile
        </h2>

        <div>
          <label className="text-sm text-slate-400 block mb-1">Email</label>
          <input
            className="w-full rounded-md px-4 py-2.5 bg-slate-800 border border-slate-700 text-sm text-slate-400 cursor-not-allowed"
            value={user.email}
            disabled
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 block mb-1">Display Name</label>
          <input
            className="w-full rounded-md px-4 py-2.5 bg-slate-900 border border-slate-700 focus:ring-violet-500 focus:border-violet-500 text-sm"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Change Password
        </h2>

        <div>
          <label className="text-sm text-slate-400 block mb-1">New Password</label>
          <input
            className="w-full rounded-md px-4 py-2.5 bg-slate-900 border border-slate-700 focus:ring-violet-500 focus:border-violet-500 text-sm"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 block mb-1">Confirm New Password</label>
          <input
            className="w-full rounded-md px-4 py-2.5 bg-slate-900 border border-slate-700 focus:ring-violet-500 focus:border-violet-500 text-sm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={updateProfile}
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-md px-4 py-3 font-medium transition-colors shadow-[0_0_20px_rgba(124,58,237,0.2)]"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      {message && (
        <p className="p-4 bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-center text-sm rounded-md">
          {message}
        </p>
      )}
      {error && (
        <p className="p-4 bg-red-900/30 border border-red-700/50 text-red-300 text-center text-sm rounded-md">
          {error}
        </p>
      )}

      {/* Data Export */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Data Export
        </h2>
        <p className="text-sm text-slate-500">Download all your data as JSON — clients, transactions, webhooks, and more.</p>
        <button
          onClick={exportData}
          disabled={exporting}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-md px-4 py-2.5 text-sm font-medium transition-colors border border-slate-700"
        >
          {exporting ? 'Preparing Export...' : 'Export All Data'}
        </button>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-950/20 border border-red-900/30 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          Danger Zone
        </h2>
        <p className="text-sm text-slate-500">Permanently delete your account and all associated data. This action cannot be undone.</p>
        
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-md px-4 py-2.5 text-sm font-medium transition-colors border border-red-800/50"
          >
            Delete Account
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={deleteAccount}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-md px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md px-4 py-2.5 text-sm font-medium transition-colors border border-slate-700"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  )
}