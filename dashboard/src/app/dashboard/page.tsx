import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Fetch real metrics
    const { data: client } = await supabase
        .from('clients')
        .select('id')
        .limit(1)
        .single()

    let totalVolume = 0
    let successCount = 0
    let totalIntents = 0
    let recentTxns: { id: string; verified_at: string; amount: number; bank_source: string; utr: string; payment_intents: { order_id: string; status: string } | null }[] = []

    if (client) {
        // Total volume
        const { data: txns } = await supabase
            .from('verified_transactions')
            .select('amount')
        if (txns) {
            totalVolume = txns.reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0)
            successCount = txns.length
        }

        // Total intents for success rate
        const { count } = await supabase
            .from('payment_intents')
            .select('*', { count: 'exact', head: true })
        totalIntents = count || 0

        // Recent 5 transactions
        const { data: recent } = await supabase
            .from('verified_transactions')
            .select('id, verified_at, amount, bank_source, utr, payment_intents(order_id, status)')
            .order('verified_at', { ascending: false })
            .limit(5)
        if (recent) recentTxns = recent as unknown as typeof recentTxns
    }

    const successRate = totalIntents > 0 ? ((successCount / totalIntents) * 100).toFixed(1) : '0.0'

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center w-full">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
                    <p className="text-sm text-slate-500 mt-1">Welcome back, {user.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card metric-card p-6">
                    <h3 className="text-sm font-medium text-slate-400">Total Volume</h3>
                    <p className="text-3xl font-bold text-white mt-2 tracking-tight">
                        ₹{totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">Lifetime verified transactions</p>
                </div>
                <div className="glass-card metric-card p-6">
                    <h3 className="text-sm font-medium text-slate-400">Successful Txns</h3>
                    <p className="text-3xl font-bold text-emerald-400 mt-2 tracking-tight">{successCount}</p>
                    <p className="text-xs text-slate-500 mt-2">Payments matched & verified</p>
                </div>
                <div className="glass-card metric-card p-6">
                    <h3 className="text-sm font-medium text-slate-400">Success Rate</h3>
                    <p className="text-3xl font-bold text-violet-400 mt-2 tracking-tight">{successRate}%</p>
                    <p className="text-xs text-slate-500 mt-2">Of {totalIntents} total intents</p>
                </div>
            </div>

            <div className="mt-4">
                <h2 className="text-xl font-semibold mb-4 text-white">Recent Transactions</h2>
                <div className="glass-card overflow-hidden">
                    {recentTxns.length > 0 ? (
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950/50 text-slate-400">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Order ID</th>
                                    <th className="px-6 py-3 font-medium">UTR</th>
                                    <th className="px-6 py-3 font-medium">Amount</th>
                                    <th className="px-6 py-3 font-medium">Source</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {recentTxns.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 text-xs">{new Date(tx.verified_at).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{tx.payment_intents?.order_id || '—'}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{tx.utr}</td>
                                        <td className="px-6 py-4 font-medium">₹{Number(tx.amount).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4"><span className="badge badge-success">{tx.bank_source}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-sm">No verified transactions yet.</p>
                            <p className="text-xs text-slate-600 mt-1">Payments will appear here once the worker matches them.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
