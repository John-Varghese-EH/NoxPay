'use client'

import { useState } from 'react'
import { deleteProject } from './actions'

export default function DeleteProjectButton({ projectId }: { projectId: string }) {
    const [confirming, setConfirming] = useState(false)
    const [loading, setLoading] = useState(false)

    if (!confirming) {
        return (
            <button
                onClick={() => setConfirming(true)}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-500 border border-red-500/30 rounded-md px-6 py-2.5 font-medium transition-colors text-sm"
            >
                Delete Project
            </button>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-red-400">Are you absolutely sure?</p>
            <div className="flex gap-3">
                <button
                    onClick={async () => {
                        setLoading(true)
                        await deleteProject(projectId)
                        // If it fails, it redirects with ?error, so loading stays true briefly
                    }}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 rounded-md px-6 py-2.5 font-medium transition-colors text-sm"
                >
                    {loading ? 'Deleting...' : 'Yes, Delete Project'}
                </button>
                <button
                    onClick={() => {
                        setConfirming(false)
                        setLoading(false)
                    }}
                    disabled={loading}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md px-6 py-2.5 font-medium transition-colors text-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
