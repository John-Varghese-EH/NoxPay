'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error } = await supabase.from('clients').insert([
        { name: name.trim(), user_id: user.id }
      ])
      
      if (!error) {
        setIsOpen(false)
        setName('')
        router.refresh()
      }
    }
    setLoading(false)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold text-white mb-2">New Project</h2>
        <p className="text-sm text-slate-400 mb-6">Create a workspace to generate API credentials and track payments.</p>
        
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
              onClick={() => setIsOpen(false)}
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
      </div>
    </div>
  )
}