import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AlertCircle, CheckCircle2, XCircle, Search, Filter, Flag } from 'lucide-react'
import FlaggedActions from '@/components/FlaggedActions'

export default async function TransactionsPage({
    searchParams,
}: {
    searchParams: { project?: string; tab?: string }
}) {
    const supabase = await createClient()
    const currentTab = searchParams.tab || 'all'

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const { data: clients } = await supabase
        .from('clients')
        .select('id, name')
        .order('created_at', { ascending: true })

    const selectedProjectId = searchParams?.project || (clients && clients.length > 0 ? clients[0].id : null)

    let allIntents: any[] = []
    let flaggedCount = 0

    if (selectedProjectId) {
        // Always get flagged count for badge
        const { count } = await supabase
            .from('payment_intents')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', selectedProjectId)
            .eq('is_flagged', true)
        flaggedCount = count || 0

        const query = supabase
            .from('payment_intents')
            .select(`
                id,
                order_id,
                amount,
                currency,
                status,
                created_at,
                is_flagged,
                flag_reason,
                resolution,
                resolved_at,
                verified_transactions(utr, bank_source, verified_at)
            `)
            .eq('client_id', selectedProjectId)
            .order('created_at', { ascending: false })
            .limit(50)

        if (currentTab === 'flagged') {
            query.eq('is_flagged', true)
        } else if (currentTab === 'success') {
            query.eq('status', 'success')
        } else if (currentTab === 'pending') {
            query.eq('status', 'pending')
        }

        const { data } = await query
        if (data) allIntents = data
    }

    const tabs = [
        { key: 'all', label: 'All', color: 'violet' },
        { key: 'pending', label: 'Pending', color: 'blue' },
        { key: 'success', label: 'Successful', color: 'emerald' },
        { key: 'flagged', label: 'Flagged for Review', color: 'amber', count: flaggedCount },
    ]

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Transactions</h1>
                    <p className="text-sm text-slate-400 mt-1">Review payment intents, verify flagged transactions, and track order statuses.</p>
                </div>

                {clients && clients.length > 1 && (
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
                        <span className="text-xs font-medium text-slate-400 pl-3">Project:</span>
                        <div className="flex gap-1 overflow-x-auto max-w-[300px]">
                            {clients.map((c: any) => (
                                <a
                                    key={c.id}
                                    href={`/dashboard/transactions?project=${c.id}&tab=${currentTab}`}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                                        c.id === selectedProjectId
                                            ? 'bg-violet-600 shadow-md text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    {c.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 gap-1">
                {tabs.map((t) => (
                    <a
                        key={t.key}
                        href={`/dashboard/transactions?project=${selectedProjectId}&tab=${t.key}`}
                        className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                            currentTab === t.key
                                ? `border-${t.color}-500 text-${t.color}-400`
                                : 'border-transparent text-slate-400 hover:text-slate-300'
                        }`}
                    >
                        {t.label}
                        {t.count !== undefined && t.count > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-${t.color}-500/20 text-${t.color}-400`}>
                                {t.count}
                            </span>
                        )}
                    </a>
                ))}
            </div>

            {/* Flagged Banner */}
            {currentTab === 'flagged' && flaggedCount > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                    <Flag className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-400">{flaggedCount} payment(s) need your review</p>
                        <p className="text-xs text-amber-500/70 mt-1">These payments expired or could not be auto-verified. If the customer&apos;s money was deducted, approve the payment to mark it as successful.</p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 bg-slate-900/40 border-b border-slate-800 flex justify-between items-center">
                    <div className="relative w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search Order ID..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500"
                        />
                    </div>
                    <div className="text-xs text-slate-500">{allIntents.length} results</div>
                </div>

                {allIntents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Order ID</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    {currentTab === 'flagged' && <th className="px-6 py-4 font-medium">Reason</th>}
                                    {currentTab === 'flagged' && <th className="px-6 py-4 font-medium text-right">Actions</th>}
                                    {currentTab !== 'flagged' && <th className="px-6 py-4 font-medium">Flags</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {allIntents.map((intent: any) => {
                                    const tx = intent.verified_transactions?.[0]
                                    return (
                                        <tr key={intent.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-200">{intent.order_id}</td>
                                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                                {intent.currency === 'UPI' ? '\u20B9' : '$'}{Number(intent.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                <div className="flex flex-col gap-1">
                                                    {intent.status === 'success' && <span className="badge badge-success flex w-fit items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Success</span>}
                                                    {intent.status === 'pending' && <span className="badge badge-pending">Pending</span>}
                                                    {intent.status === 'expired' && <span className="badge badge-expired">Expired</span>}
                                                    {intent.status === 'failed' && <span className="badge badge-failed flex w-fit items-center gap-1"><XCircle className="w-3 h-3" /> Failed</span>}
                                                    {intent.status === 'flagged' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 flex w-fit items-center gap-1"><AlertCircle className="w-3 h-3" /> Flagged</span>}
                                                    {tx && <span className="font-mono text-slate-500 text-[10px]">UTR: {tx.utr}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-400">{new Date(intent.created_at).toLocaleString()}</td>

                                            {currentTab === 'flagged' && (
                                                <td className="px-6 py-4 text-xs text-amber-400/80 max-w-[200px]">
                                                    {intent.flag_reason || 'Manual review required'}
                                                </td>
                                            )}
                                            {currentTab === 'flagged' && (
                                                <td className="px-6 py-4 text-right">
                                                    <FlaggedActions intentId={intent.id} orderId={intent.order_id} />
                                                </td>
                                            )}
                                            {currentTab !== 'flagged' && (
                                                <td className="px-6 py-4">
                                                    {intent.is_flagged ? (
                                                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1.5 rounded-lg text-xs flex items-start gap-2 max-w-[180px]">
                                                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                            <span className="leading-snug">{intent.flag_reason || 'Review needed'}</span>
                                                        </div>
                                                    ) : intent.resolution ? (
                                                        <span className={`text-xs px-2 py-1 rounded-full ${intent.resolution === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                            {intent.resolution === 'approved' ? 'Manually Approved' : 'Manually Rejected'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-600 text-xs">\u2014</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-16 flex flex-col items-center justify-center text-slate-500 bg-slate-900/10">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                            <Search className="h-6 w-6 text-slate-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-300">No transactions found</p>
                        <p className="text-xs text-slate-500 mt-2">
                            {currentTab === 'flagged'
                                ? 'No flagged payments right now. All clear!'
                                : 'Try adjusting your filters or create a payment intent first.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
