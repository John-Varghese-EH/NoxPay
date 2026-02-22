import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Fetch verified transactions for analytics
    const { data: txns } = await supabase
        .from('verified_transactions')
        .select('amount, verified_at, bank_source')
        .order('verified_at', { ascending: false })
        .limit(500)

    // Compute daily volume for last 7 days
    const days = 7
    const dailyVolume: { label: string; total: number }[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' })

        const dayTotal = (txns || [])
            .filter((t: { verified_at: string }) => t.verified_at.startsWith(dateStr))
            .reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0)

        dailyVolume.push({ label: dayLabel, total: dayTotal })
    }

    const maxVolume = Math.max(...dailyVolume.map(d => d.total), 1)

    // Counts by status
    const { count: successCount } = await supabase
        .from('payment_intents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'success')

    const { count: failedCount } = await supabase
        .from('payment_intents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')

    const { count: expiredCount } = await supabase
        .from('payment_intents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'expired')

    const { count: pendingCount } = await supabase
        .from('payment_intents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    // Top bank sources
    const bankTotals: Record<string, number> = {}
    for (const tx of txns || []) {
        const src = (tx as { bank_source: string }).bank_source || 'Unknown'
        bankTotals[src] = (bankTotals[src] || 0) + Number((tx as { amount: number }).amount)
    }
    const sortedBanks = Object.entries(bankTotals).sort((a, b) => b[1] - a[1])

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto">
            <div className="flex flex-col mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
                <p className="text-slate-400 mt-2">Volume and performance metrics for your NoxPay integration.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Volume Chart */}
                <div className="glass-card p-6 h-80 flex flex-col">
                    <h2 className="text-lg font-semibold text-white mb-4">Daily Volume (7 Days)</h2>
                    <div className="flex-1 chart-bar">
                        {dailyVolume.map((day, i) => (
                            <div key={i} className="chart-bar-item">
                                <div className="text-xs text-slate-400 font-mono">
                                    {day.total > 0 ? `₹${(day.total / 1000).toFixed(1)}k` : ''}
                                </div>
                                <div
                                    className="chart-bar-fill"
                                    style={{ height: `${Math.max((day.total / maxVolume) * 100, 2)}%` }}
                                />
                                <div className="chart-bar-label">{day.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="glass-card p-6 h-80 flex flex-col">
                    <h2 className="text-lg font-semibold text-white mb-6">Intent Status Breakdown</h2>
                    <div className="flex-1 flex flex-col justify-center gap-4">
                        {[
                            { label: 'Success', count: successCount || 0, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                            { label: 'Pending', count: pendingCount || 0, color: 'bg-amber-500', textColor: 'text-amber-400' },
                            { label: 'Failed', count: failedCount || 0, color: 'bg-red-500', textColor: 'text-red-400' },
                            { label: 'Expired', count: expiredCount || 0, color: 'bg-slate-500', textColor: 'text-slate-400' },
                        ].map((item) => {
                            const total = (successCount || 0) + (pendingCount || 0) + (failedCount || 0) + (expiredCount || 0)
                            const pct = total > 0 ? (item.count / total) * 100 : 0
                            return (
                                <div key={item.label} className="flex items-center gap-4">
                                    <span className={`text-sm font-medium w-16 ${item.textColor}`}>{item.label}</span>
                                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full transition-all duration-700`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-mono text-slate-300 w-8 text-right">{item.count}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Top Payment Sources</h2>
                <div className="w-full text-slate-400 text-sm">
                    {sortedBanks.length > 0 ? (
                        sortedBanks.map(([bank, total], i) => (
                            <div key={bank} className={`flex justify-between py-3 ${i < sortedBanks.length - 1 ? 'border-b border-slate-800/50' : ''}`}>
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                                    {bank}
                                </span>
                                <span className="font-mono text-slate-300">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500">No transaction data available yet.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
