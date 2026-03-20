import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AlertTriangle, CheckCircle2, XCircle, Search, HelpCircle, Clock } from 'lucide-react'
import CurrencySelector from '@/components/CurrencySelector'
import ConvertedAmount from '@/components/ConvertedAmount'
import DisputeActions from './DisputeActions'

export default async function DisputesPage(props: { searchParams: Promise<any> }) {
    const searchParams = await props.searchParams;
    const supabase = await createClient()
    const currentTab = searchParams.tab || 'pending'
    const searchQuery = (searchParams.q || '').trim()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const { data: clients } = await supabase
        .from('clients')
        .select('id, name')
        .order('created_at', { ascending: true })

    const selectedProjectId = searchParams?.project || (clients && clients.length > 0 ? clients[0].id : null)

    let allDisputes: any[] = []
    let pendingCount = 0

    if (selectedProjectId) {
        // Get strict pending count for badge
        const { count } = await supabase
            .from('payment_disputes')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', selectedProjectId)
            .eq('status', 'pending')
        pendingCount = count || 0

        const query = supabase
            .from('payment_disputes')
            .select(`
                id,
                intent_id,
                order_id,
                transaction_id,
                customer_email,
                status,
                amount,
                currency,
                created_at,
                resolved_at,
                payment_intents (
                    expires_at,
                    status
                )
            `)
            .eq('client_id', selectedProjectId)
            .order('created_at', { ascending: false })
            .limit(50)

        if (currentTab === 'pending') {
            query.eq('status', 'pending')
        } else if (currentTab === 'verified') {
            query.eq('status', 'verified')
        } else if (currentTab === 'rejected') {
            query.eq('status', 'rejected')
        }

        // Apply search
        if (searchQuery) {
            query.or(`transaction_id.ilike.%${searchQuery}%,order_id.ilike.%${searchQuery}%`)
        }

        const { data } = await query
        if (data) allDisputes = data
    }

    const tabs = [
        { key: 'pending', label: 'Action Required', color: 'amber', count: pendingCount },
        { key: 'verified', label: 'Approved', color: 'emerald' },
        { key: 'rejected', label: 'Rejected', color: 'slate' },
        { key: 'all', label: 'All Reports', color: 'violet' },
    ]

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        Disputes
                        {pendingCount > 0 && (
                            <span className="bg-amber-500/20 text-amber-500 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                {pendingCount} New
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Review customer reports for payments made but not credited.</p>
                </div>

                {clients && clients.length > 1 && (
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
                        <span className="text-xs font-medium text-slate-400 pl-3">Project:</span>
                        <div className="flex gap-1 overflow-x-auto max-w-[300px]">
                            {clients.map((c: any) => (
                                <a
                                    key={c.id}
                                    href={`/dashboard/disputes?project=${c.id}&tab=${currentTab}`}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                                        c.id === selectedProjectId
                                            ? 'bg-amber-600 shadow-md text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    {c.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
                <CurrencySelector />
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800">
                <div className="flex gap-1 overflow-x-auto w-full sm:w-auto">
                    {tabs.map((t) => (
                        <a
                            key={t.key}
                            href={`/dashboard/disputes?project=${selectedProjectId}&tab=${t.key}`}
                            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
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

                <form className="relative pb-3 w-full sm:w-64" action="/dashboard/disputes">
                    <input type="hidden" name="project" value={selectedProjectId || ''} />
                    <input type="hidden" name="tab" value={currentTab} />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        name="q"
                        defaultValue={searchQuery}
                        placeholder="Search UTR / Order ID..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    />
                </form>
            </div>

            {/* Table */}
            <div className="bg-slate-950/50 rounded-2xl border border-slate-800/60 overflow-hidden shadow-xl">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-sm">
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Time</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction / UTR</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Details</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {allDisputes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
                                                <HelpCircle className="w-6 h-6 text-slate-600" />
                                            </div>
                                            <p>No disputes found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                allDisputes.map((d) => (
                                    <tr key={d.id} className="hover:bg-slate-900/30 transition-colors group">
                                        <td className="p-4 text-sm whitespace-nowrap">
                                            <div className="font-medium text-slate-300">
                                                {new Date(d.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {new Date(d.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-mono">
                                            <div className="flex flex-col">
                                                <span className="text-white select-all">{d.transaction_id}</span>
                                                {d.customer_email && (
                                                    <span className="text-xs text-slate-500 mt-1 break-all">By: {d.customer_email}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="flex flex-col">
                                                {d.order_id ? (
                                                    <span className="text-slate-300 font-mono text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800/50 inline-flex w-max">{d.order_id}</span>
                                                ) : (
                                                    <span className="text-slate-500 text-xs italic">No Order ID attached</span>
                                                )}
                                                <span className="text-[10px] text-slate-500 mt-1">Intent: {d.intent_id.substring(0, 8)}...</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-right font-medium whitespace-nowrap">
                                            <ConvertedAmount amountINR={Number(d.amount)} className="text-slate-200" />
                                        </td>
                                        <td className="p-4">
                                            {d.status === 'pending' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    <Clock className="w-3.5 h-3.5" /> Action Required
                                                </span>
                                            )}
                                            {d.status === 'verified' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                                                </span>
                                            )}
                                            {d.status === 'rejected' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                                    <XCircle className="w-3.5 h-3.5" /> Rejected
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {d.status === 'pending' ? (
                                                <DisputeActions disputeId={d.id} intentId={d.intent_id} />
                                            ) : (
                                                <span className="text-[10px] text-slate-500">
                                                    Resolved {new Date(d.resolved_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
