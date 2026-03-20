'use client'

import { useState } from 'react'
import { AlertTriangle, Send, CheckCircle2, X } from 'lucide-react'

interface PaymentReportProps {
    intentId: string
    orderId: string
}

export default function PaymentReport({ intentId, orderId }: PaymentReportProps) {
    const [open, setOpen] = useState(false)
    const [txnId, setTxnId] = useState('')
    const [email, setEmail] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (!txnId.trim()) {
            setError('Please enter your transaction/UTR ID')
            return
        }
        setError('')
        setSubmitting(true)
        try {
            const res = await fetch('/app-api/disputes/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    intent_id: intentId,
                    order_id: orderId,
                    transaction_id: txnId.trim(),
                    customer_email: email.trim() || null,
                }),
            })
            if (res.ok) {
                setSubmitted(true)
            } else {
                const data = await res.json()
                setError(data.error || 'Failed to submit report')
            }
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="mt-3 text-[11px] text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 mx-auto"
            >
                <AlertTriangle className="w-3 h-3" />
                Paid but not showing?
            </button>
        )
    }

    if (submitted) {
        return (
            <div className="mt-3 w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Report Submitted</span>
                </div>
                <p className="text-xs text-emerald-500/80">
                    We'll verify your transaction and update the payment status. This usually takes a few minutes.
                </p>
            </div>
        )
    }

    return (
        <div className="mt-3 w-full bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-semibold">Report Payment Issue</span>
                </div>
                <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
                If you&apos;ve already paid but it&apos;s not reflecting, enter your UPI transaction ID (UTR) or crypto TX hash below. We&apos;ll verify and update your payment.
            </p>

            <div className="space-y-2">
                <input
                    type="text"
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    placeholder="Transaction ID / UTR number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-amber-500/30 outline-none font-mono"
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email (optional, for updates)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-amber-500/30 outline-none"
                />
            </div>

            {error && (
                <p className="text-xs text-red-400 mt-2">{error}</p>
            )}

            <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-3 w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
                {submitting ? (
                    <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                    </span>
                ) : (
                    <>
                        Submit Report <Send className="w-3.5 h-3.5" />
                    </>
                )}
            </button>
        </div>
    )
}
