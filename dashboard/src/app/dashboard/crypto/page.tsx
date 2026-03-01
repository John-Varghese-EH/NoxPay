'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Loader2, CheckCircle2 } from 'lucide-react'

// Note: We use the Supabase client here since this needs React context for real-time.
// Let's create a Client Component so we can hook into Supabase Realtime subscriptions.

export default function CryptoPaymentPage() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [clients, setClients] = useState<any[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(searchParams.get('project'))
    const [loading, setLoading] = useState(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [testIntent, setTestIntent] = useState<any | null>(null)
    const [status, setStatus] = useState<'pending' | 'success' | 'creating'>('creating')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recentTransactions, setRecentTransactions] = useState<any[]>([])

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data: clientsData } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: true })

            if (clientsData) {
                setClients(clientsData)
                if (!selectedProjectId && clientsData.length > 0) {
                    setSelectedProjectId(clientsData[0].id)
                }
            }

            if (selectedProjectId) {
                const { data: txs } = await supabase
                    .from('verified_transactions')
                    .select('*, payment_intents!inner(*)')
                    .eq('payment_intents.client_id', selectedProjectId)
                    .order('verified_at', { ascending: false })
                    .limit(5)

                if (txs) setRecentTransactions(txs)
            }

            setLoading(false)
        }
        fetchUserData()
    }, [supabase, router, selectedProjectId])

    // Effect to setup test payment intent if not exists and subscribe to realtime updates
    useEffect(() => {
        if (!selectedProjectId) return;

        const setupTestPayment = async () => {
            setStatus('creating')
            // Create a fake test intent for $1.00
            const orderId = `CRYPTO-TEST-${Math.floor(Math.random() * 100000)}`

            const { data, error } = await supabase
                .from('payment_intents')
                .insert({
                    client_id: selectedProjectId,
                    amount: 1.00,
                    currency: 'USDT',
                    order_id: orderId,
                    status: 'pending'
                })
                .select()
                .single()

            if (data && !error) {
                setTestIntent(data)
                setStatus('pending')
            }
        }

        setupTestPayment()
    }, [selectedProjectId, supabase])

    useEffect(() => {
        if (!testIntent) return;

        // Listen to updates on the test intent
        const channel = supabase
            .channel('intent_updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'payment_intents',
                    filter: `id=eq.${testIntent.id}`
                },
                (payload) => {
                    const newStatus = payload.new.status;
                    if (newStatus === 'success') {
                        setStatus('success')
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [testIntent, supabase])

    // Effect for global crypto transaction monitoring
    useEffect(() => {
        if (!selectedProjectId) return;

        const channel = supabase
            .channel('crypto_txs')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'verified_transactions'
                },
                async (payload) => {
                    // Check if this tx belongs to our client (requires a re-fetch or complex filter)
                    const { data: fullTx } = await supabase
                        .from('verified_transactions')
                        .select('*, payment_intents!inner(*)')
                        .eq('id', payload.new.id)
                        .eq('payment_intents.client_id', selectedProjectId)
                        .single()

                    if (fullTx) {
                        setRecentTransactions(prev => [fullTx, ...prev].slice(0, 5))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [selectedProjectId, supabase])


    if (loading) {
        return <div className="p-8 flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>
    }

    const activeClient = clients.find(c => c.id === selectedProjectId)
    const walletAddress = activeClient?.crypto_wallet || "0xYourPolygonOrSolanaWalletAddressHere"

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Crypto Pay (Testing)</h1>
                    <p className="text-sm text-slate-400 mt-1">Accept USDC and USDT in real-time leveraging NoxPay Observers.</p>
                </div>

                {clients && clients.length > 0 && (
                    <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
                        <span className="text-xs font-medium text-slate-400 pl-3">Project:</span>
                        <select
                            className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg py-1.5 px-3 focus:ring-violet-500 focus:border-violet-500"
                            value={selectedProjectId || ''}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                        >
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Order details */}
                <div className="flex flex-col gap-6">
                    <div className="glass-card p-6 border-l-2 border-l-violet-500">
                        <h2 className="text-lg font-semibold text-white mb-4">Payment Requirements</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Amount Due</p>
                                <p className="text-3xl font-bold text-white tracking-tight">$1.00 <span className="text-sm font-medium text-slate-400">USDT / USDC</span></p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Network</p>
                                <div className="flex gap-2 mt-1">
                                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded text-xs font-semibold">Polygon</span>
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs font-semibold">Solana</span>
                                </div>
                            </div>

                            {testIntent && (
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Memo / Order ID (Important!)</p>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-slate-900 px-3 py-2 rounded-md font-mono text-sm text-violet-300 border border-slate-800">
                                            {testIntent.order_id}
                                        </code>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Include this exactly as your Tx Memo or rely on amount matching.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: QR Code Area */}
                <div className="glass-card flex flex-col items-center justify-center p-8 bg-slate-900/30 text-center border-t border-slate-800 relative overflow-hidden">
                    {/* Live indicator rings */}
                    {status === 'pending' && (
                        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-50">
                            <div className="w-64 h-64 border border-violet-500/20 rounded-full animate-ping [animation-duration:3s]"></div>
                            <div className="w-80 h-80 border border-violet-500/10 rounded-full absolute animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                        </div>
                    )}

                    <div className="z-10 bg-white p-4 rounded-2xl shadow-xl shadow-black/50 mb-6">
                        <QRCodeSVG
                            value={walletAddress}
                            size={200}
                            bgColor={"#ffffff"}
                            fgColor={"#0a0a0f"}
                            level={"Q"}
                        />
                    </div>

                    <p className="font-mono text-xs text-slate-400 break-all w-3/4 mb-6 select-all">
                        {walletAddress}
                    </p>

                    <div className="w-full flex justify-center h-12">
                        {status === 'creating' && (
                            <div className="flex items-center gap-3 text-slate-400 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 shadow-inner">
                                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                <span className="text-sm font-medium">Initializing Tracker...</span>
                            </div>
                        )}
                        {status === 'pending' && (
                            <div className="flex items-center gap-3 text-violet-400 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm font-medium">Waiting for blockchain confirmation...</span>
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="flex items-center gap-2 text-emerald-400 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-in zoom-in duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-semibold text-sm">Payment Verified</span>
                            </div>
                        )}
                    </div>

                    {status === 'success' && (
                        <button
                            onClick={() => window.location.reload()}
                            className="text-xs text-slate-500 hover:text-slate-300 underline mt-4 absolute bottom-4"
                        >
                            Reset Demo
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Row: Recent Transactions Feed */}
            <div className="glass-card p-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Live Transaction Feed</h2>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Monitoring</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {recentTransactions.length > 0 ? (
                        recentTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">+{tx.amount} USDT</p>
                                        <p className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{tx.tx_hash}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-slate-300">Order: {tx.payment_intents?.order_id}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                                        {new Date(tx.verified_at).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                            <Loader2 className="w-6 h-6 animate-spin mb-3 text-slate-600" />
                            <p className="text-sm text-slate-500">Waiting for incoming blockchain transactions...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
