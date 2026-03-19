'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { resolveFlaggedPayment } from '@/app/actions/flagged'

export default function FlaggedActions({ intentId, orderId }: { intentId: string; orderId: string }) {
    const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null)
    const [done, setDone] = useState<string | null>(null)
    const router = useRouter()

    const handleResolve = async (resolution: 'approved' | 'rejected') => {
        setLoading(resolution)
        const res = await resolveFlaggedPayment(intentId, resolution)
        if (res.success) {
            setDone(resolution)
            setTimeout(() => router.refresh(), 600)
        }
        setLoading(null)
    }

    if (done) {
        return (
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${done === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {done === 'approved' ? '✓ Approved' : '✗ Rejected'}
            </span>
        )
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={() => handleResolve('approved')}
                disabled={!!loading}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1 shadow-sm"
            >
                {loading === 'approved' ? (
                    <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                )}
                Approve
            </button>
            <button
                onClick={() => handleResolve('rejected')}
                disabled={!!loading}
                className="px-3 py-1.5 bg-red-600/80 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1 shadow-sm"
            >
                {loading === 'rejected' ? (
                    <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
                Reject
            </button>
        </div>
    )
}
