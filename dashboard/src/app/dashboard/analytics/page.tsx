/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Activity, TrendingUp, CheckCircle, Target } from 'lucide-react'

export default async function AnalyticsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Fetch verified transactions with relations
    const { data: txns } = await supabase
        .from('verified_transactions')
        .select(`
            amount,
            verified_at,
            bank_source,
            payment_intents (
                currency,
                clients (
                    name
                )
            )
        `)
        .order('verified_at', { ascending: false })
        .limit(1000)

    // Compute daily volume for last 7 days
    const days = 7
    const dailyVolume: { label: string; upi: number, usdt: number, total: number }[] = []
    const now = new Date()

    let totalUpiVolume = 0
    let totalUsdtVolume = 0

    // For Top Projects
    const projectTotals: Record<string, number> = {}

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' })

        let upiVol = 0
        let usdtVol = 0

        for (const tx of (txns || [])) {
            if (tx.verified_at.startsWith(dateStr)) {
                const amt = Number(tx.amount)
                const currency = (tx as any).payment_intents?.currency || 'UPI'

                if (currency === 'UPI') upiVol += amt
                if (currency === 'USDT') usdtVol += amt

                // Aggregate for projects
                const projName = (tx as any).payment_intents?.clients?.name || 'Unknown Project'
                projectTotals[projName] = (projectTotals[projName] || 0) + amt
            }
        }

        totalUpiVolume += upiVol
        totalUsdtVolume += usdtVol

        dailyVolume.push({ label: dayLabel, upi: upiVol, usdt: usdtVol, total: upiVol + usdtVol })
    }

    // Since we filtered projects in the loop only for the last 7 days, 
    // let's do a global project aggregation over all fetched txns
    for (const tx of (txns || [])) {
        const amt = Number(tx.amount)
        const projName = (tx as any).payment_intents?.clients?.name || 'Unknown Project'
        projectTotals[projName] = (projectTotals[projName] || 0) + amt
    }

    const sortedProjects = Object.entries(projectTotals).sort((a, b) => b[1] - a[1])
    const maxDayVolume = Math.max(...dailyVolume.map(d => d.total), 1)

    // Counts by status
    const { count: successCount } = await supabase.from('payment_intents').select('*', { count: 'exact', head: true }).eq('status', 'success')
    const { count: failedCount } = await supabase.from('payment_intents').select('*', { count: 'exact', head: true }).eq('status', 'failed')
    const { count: expiredCount } = await supabase.from('payment_intents').select('*', { count: 'exact', head: true }).eq('status', 'expired')
    const { count: pendingCount } = await supabase.from('payment_intents').select('*', { count: 'exact', head: true }).eq('status', 'pending')

    const totalIntents = (successCount || 0) + (pendingCount || 0) + (failedCount || 0) + (expiredCount || 0)
    const successRate = totalIntents > 0 ? ((successCount || 0) / totalIntents) * 100 : 0

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Advanced Analytics</h1>
                <p className="text-slate-400 mt-2 text-sm">Comprehensive breakdown of your transaction volumes, platform success rates, and project performance.</p>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                        <Activity className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-medium uppercase tracking-wider">Total UPI Vol</span>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">₹{totalUpiVolume.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium uppercase tracking-wider">Total Crypto Vol</span>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">₮{totalUsdtVolume.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-medium uppercase tracking-wider">Success Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">{successRate.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500 mt-1">{successCount} successful intents</div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                        <Target className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-medium uppercase tracking-wider">Total Intents</span>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">{totalIntents}</div>
                    <div className="text-xs text-slate-500 mt-1">across all projects</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
                {/* Daily Volume Stacked Chart */}
                <div className="glass-card p-6 h-80 flex flex-col">
                    <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Volume via Currency (7 Days)</h2>
                    <div className="flex-1 flex items-end justify-between gap-2">
                        {dailyVolume.map((day, i) => {
                            const upiPct = day.total > 0 ? (day.upi / maxDayVolume) * 100 : 0
                            const usdtPct = day.total > 0 ? (day.usdt / maxDayVolume) * 100 : 0

                            return (
                                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 text-center">
                                        <div className="text-[10px] font-mono text-violet-400">{day.upi > 0 ? `₹${(day.upi / 1000).toFixed(1)}k` : ''}</div>
                                        <div className="text-[10px] font-mono text-amber-400">{day.usdt > 0 ? `₮${(day.usdt / 1000).toFixed(1)}k` : ''}</div>
                                    </div>
                                    <div className="w-full max-w-[40px] flex flex-col justify-end bg-slate-900/50 rounded-t-md overflow-hidden h-[60%]">
                                        <div className="w-full bg-amber-500/80 transition-all duration-500 hover:bg-amber-400" style={{ height: `${usdtPct}%` }} />
                                        <div className="w-full bg-violet-600 transition-all duration-500 hover:bg-violet-500" style={{ height: `${upiPct}%` }} />
                                    </div>
                                    <div className="text-xs text-slate-500 mt-3 font-medium">{day.label}</div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex justify-center gap-6 mt-4 border-t border-slate-800 pt-3">
                        <div className="flex items-center gap-2 text-xs text-slate-400"><span className="w-3 h-3 rounded bg-violet-600 outline outline-1 outline-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.4)]" /> UPI</div>
                        <div className="flex items-center gap-2 text-xs text-slate-400"><span className="w-3 h-3 rounded bg-amber-500 outline outline-1 outline-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]" /> USDT</div>
                    </div>
                </div>

                {/* Intent Status Breakdown */}
                <div className="glass-card p-6 h-80 flex flex-col">
                    <h2 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">Intent Conversion Funnel</h2>
                    <div className="flex-1 flex flex-col justify-center gap-5">
                        {[
                            { label: 'Success', count: successCount || 0, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                            { label: 'Pending', count: pendingCount || 0, color: 'bg-amber-500', textColor: 'text-amber-400' },
                            { label: 'Failed', count: failedCount || 0, color: 'bg-red-500', textColor: 'text-red-400' },
                            { label: 'Expired', count: expiredCount || 0, color: 'bg-slate-500', textColor: 'text-slate-400' },
                        ].map((item) => {
                            const pct = totalIntents > 0 ? (item.count / totalIntents) * 100 : 0
                            return (
                                <div key={item.label} className="flex items-center gap-4">
                                    <span className={`text-sm font-medium w-16 ${item.textColor}`}>{item.label}</span>
                                    <div className="flex-1 h-4 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
                                        <div
                                            className={`h-full ${item.color} rounded-full transition-all duration-700`}
                                            style={{ width: `${Math.max(pct, 2)}%` }}
                                        />
                                    </div>
                                    <div className="flex flex-col items-end w-12">
                                        <span className="text-sm font-mono text-slate-200">{item.count}</span>
                                        <span className="text-[10px] text-slate-500">{pct.toFixed(0)}%</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="glass-card p-0 overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Volume by Project</h2>
                </div>
                <div className="w-full text-slate-300 text-sm">
                    {sortedProjects.length > 0 ? (
                        <div className="divide-y divide-slate-800/50">
                            {sortedProjects.map(([proj, total]) => (
                                <div key={proj} className="flex justify-between items-center py-4 px-6 hover:bg-slate-800/30 transition-colors">
                                    <span className="flex items-center gap-3 font-medium">
                                        <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs border border-slate-700">{proj.charAt(0)}</span>
                                        {proj}
                                    </span>
                                    <span className="font-mono bg-slate-900 border border-slate-800 px-3 py-1 rounded shadow-inner">
                                        ~ {(total).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                            <Target className="w-8 h-8 text-slate-700 mb-2" />
                            No projects with verified volume yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
