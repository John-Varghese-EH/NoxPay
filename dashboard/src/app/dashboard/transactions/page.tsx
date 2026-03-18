import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AlertCircle, CheckCircle2, XCircle, Search, Filter } from 'lucide-react'

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

    if (!user) {
        return redirect('/login')
    }

    // Fetch all projects for the user
    const { data: clients } = await supabase
        .from('clients')
        .select('id, name')
        .order('created_at', { ascending: true })

    const selectedProjectId = searchParams?.project || (clients && clients.length > 0 ? clients[0].id : null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allIntents: any[] = []

    if (selectedProjectId) {
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
                verified_transactions(utr, bank_source, verified_at)
            `)
            .eq('client_id', selectedProjectId)
            .order('created_at', { ascending: false })
            .limit(50)

        // If tab is flagged, only get flagged
        if (currentTab === 'flagged') {
            query.eq('is_flagged', true)
        }

        const { data } = await query
        if (data) allIntents = data
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Transactions</h1>
                    <p className="text-sm text-slate-400 mt-1">Review your payment intents and flagged transactions.</p>
                </div>

                {clients && clients.length > 0 && (
                    <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
                        <span className="text-xs font-medium text-slate-400 pl-3">Project:</span>
                        <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-[400px] custom-scrollbar hide-scrollbar">
                            <a
                                href={`/dashboard/transactions?project=${selectedProjectId}&tab=${currentTab}`}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap bg-violet-600 shadow-md text-white"
                            >
                                {clients.find(c => c.id === selectedProjectId)?.name || 'Selected'}
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 gap-6">
                <a
                    href={`/dashboard/transactions?project=${selectedProjectId}&tab=all`}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${currentTab === 'all' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
                >
                    All Transactions
                </a>
                <a
                    href={`/dashboard/transactions?project=${selectedProjectId}&tab=flagged`}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${currentTab === 'flagged' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-amber-500/80'}`}
                >
                    Flagged for Review
                    {currentTab !== 'flagged' && <AlertCircle className="w-3.5 h-3.5" />}
                </a>
            </div>

            {/* List */}
            <div className="glass-card overflow-hidden mt-4">
                <div className="p-4 bg-slate-900/40 border-b border-slate-800 flex justify-between items-center">
                    <div className="relative w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search Order ID..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors bg-slate-900 px-3 py-2 border border-slate-800 rounded-lg">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>

                {allIntents.length > 0 ? (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Order ID</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Status / UTR</th>
                                    <th className="px-6 py-4 font-medium">Date Created</th>
                                    <th className="px-6 py-4 font-medium">Review Flags</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {allIntents.map((intent) => {
                                    const tx = intent.verified_transactions?.[0]

                                    return (
                                        <tr key={intent.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-200">
                                                {intent.order_id}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                                {intent.currency === 'UPI' ? '₹' : '$'}{Number(intent.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                <div className="flex flex-col gap-1">
                                                    <div>
                                                        {intent.status === 'success' && <span className="badge badge-success flex w-fit items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Success</span>}
                                                        {intent.status === 'pending' && <span className="badge badge-pending">Pending</span>}
                                                        {intent.status === 'expired' && <span className="badge badge-expired">Expired</span>}
                                                        {intent.status === 'failed' && <span className="badge badge-failed flex w-fit items-center gap-1"><XCircle className="w-3 h-3" /> Failed</span>}
                                                    </div>
                                                    {tx && <span className="font-mono text-slate-500 text-[10px]">UTR: {tx.utr}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-400">
                                                {new Date(intent.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {intent.is_flagged ? (
                                                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-2 rounded-lg text-xs flex items-start gap-2 max-w-[200px]">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                        <span className="leading-snug">{intent.flag_reason || 'Manual review required.'}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-600 text-xs">—</span>
                                                )}
                                            </td>
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
                        <p className="text-xs text-slate-500 mt-2">Try adjusting your filters or tab selection.</p>
                    </div>
                )}
            </div>

        </div>
    )
}
