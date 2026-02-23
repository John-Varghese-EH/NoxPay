'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AuthPasswordPage() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                router.push('/login')
                router.refresh()
            } else {
                setError(data.error || 'Invalid password')
            }
        } catch {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[128px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                            <Lock className="w-8 h-8 text-violet-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Restricted Access</h1>
                        <p className="text-sm text-slate-400">
                            Please enter the global dashboard password to continue.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="relative group">
                                <input
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter dashboard password..."
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300"
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="flex items-center gap-2 text-rose-400 text-sm mt-3 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20"
                                >
                                    <ShieldAlert className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 text-white rounded-xl px-4 py-3.5 font-medium transition-all duration-300 flex items-center justify-center group shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_25px_rgba(124,58,237,0.4)]"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Unlock Dashboard</span>
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
