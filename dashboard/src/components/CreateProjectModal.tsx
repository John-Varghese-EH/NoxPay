'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProjectAction } from '@/app/actions/project'

export default function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [secrets, setSecrets] = useState<{rawSecret: string, rawWebhookSecret: string, clientId: string} | null>(null)
  
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setErrorMsg('')

    try {
        const res = await createProjectAction(name.trim())
        if (res.error) {
            setErrorMsg(res.error)
        } else if (res.success && res.rawSecret) {
            setSecrets({
                rawSecret: res.rawSecret,
                rawWebhookSecret: res.rawWebhookSecret!,
                clientId: res.clientId!
            })
            router.refresh()
        }
    } catch (e: any) {
        setErrorMsg(e.message)
    }
    setLoading(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setName('')
    setSecrets(null)
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.3)] mt-4"
      >
        <div className="flex flex-row items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create First Project
        </div>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 text-left">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
        
        {secrets ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Project Created!</h2>
              </div>
              <p className="text-sm text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 mb-6">
                 Warning! Store these credentials safely. Your Client Secret will never be shown again.
              </p>

              <div className="space-y-4 mb-8">
                  <div>
                      <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Client ID</p>
                      <code className="block p-3 bg-black rounded-lg text-slate-300 font-mono text-xs overflow-x-auto border border-slate-800">
                          {secrets.clientId}
                      </code>
                  </div>
                  <div>
                      <p className="text-xs font-semibold text-violet-400 mb-1 uppercase tracking-wider">Secret Key</p>
                      <code className="block p-3 bg-violet-950/30 rounded-lg text-violet-300 font-mono text-xs overflow-x-auto border border-violet-900/50">
                          {secrets.rawSecret}
                      </code>
                  </div>
                  <div>
                      <p className="text-xs font-semibold text-emerald-400 mb-1 uppercase tracking-wider">Webhook Secret</p>
                      <code className="block p-3 bg-emerald-950/30 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto border border-emerald-900/50">
                          {secrets.rawWebhookSecret}
                      </code>
                  </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all font-medium"
                >
                  I've Copied Them, Done
                </button>
              </div>
            </div>
        ) : (
            <>
                <h2 className="text-2xl font-bold text-white mb-2">New Project</h2>
                <p className="text-sm text-slate-400 mb-6">Create a workspace to generate API credentials and track payments.</p>
                
                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-red-500 font-medium">{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={handleCreate}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                    <input 
                      type="text" 
                      required
                      autoFocus
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                      placeholder="e.g. My SaaS App"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <button 
                      type="button" 
                      onClick={handleClose}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium border border-slate-700"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 text-white rounded-lg transition-all font-medium flex items-center justify-center min-w-[120px] shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : 'Create Project'}
                    </button>
                  </div>
                </form>
            </>
        )}
      </div>
    </div>
  )
}
