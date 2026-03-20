'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { resolveDispute } from './actions'

export default function DisputeActions({ disputeId, intentId }: { disputeId: string, intentId: string }) {
    const [loading, setLoading] = useState<'verify' | 'reject' | null>(null)
    const router = useRouter()

    const handleAction = async (action: 'verify' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this reported payment?`)) return
        
        setLoading(action)
        try {
            const formData = new FormData()
            formData.append('disputeId', disputeId)
            formData.append('intentId', intentId)
            formData.append('action', action)
            
            const result = await resolveDispute(formData)
            
            if (result?.error) {
                alert(result.error)
            } else {
                router.refresh()
            }
        } catch (e: any) {
            alert(e.message || 'An error occurred')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => handleAction('verify')}
                disabled={loading !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all disabled:opacity-50"
            >
                {loading === 'verify' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Approve
            </button>
            <button
                onClick={() => handleAction('reject')}
                disabled={loading !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white border border-slate-700 hover:border-red-500 transition-all disabled:opacity-50"
            >
                {loading === 'reject' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                Reject
            </button>
        </div>
    )
}
