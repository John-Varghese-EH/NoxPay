import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CreateProjectModal from '@/components/CreateProjectModal'
import TransactionChart from '@/components/TransactionChart'
import { format } from 'date-fns'
import CurrencySelector from '@/components/CurrencySelector'
import ConvertedAmount from '@/components/ConvertedAmount'

export default async function DashboardPage(props: { searchParams: Promise<any> }) {
    const searchParams = await props.searchParams;
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: clients } = await supabase
        .from('clients')
        .select('id, name')
        .order('created_at', { ascending: true })

    const selectedProjectId = searchParams?.project || (clients && clients.length > 0 ? clients[0].id : null)
    const selectedProject = clients?.find((c) => c.id === selectedProjectId)

    let totalVolume = 0
    let successCount = 0
    let totalIntents = 0
    let recentTxns: any[] = []
    let groupedChartData: any[] = []

    if (selectedProjectId) {
        const { data: txns } = await supabase
            .from('verified_transactions')
            .select('amount, verified_at, payment_intents!inner(client_id)')
            .eq('payment_intents.client_id', selectedProjectId)

        if (txns) {
            totalVolume = txns.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
            successCount = txns.length
            
            const volumeByDate: Record<string, number> = {};
            txns.forEach((t: any) => {
              const d = format(new Date(t.verified_at), 'MMM dd')
              volumeByDate[d] = (volumeByDate[d] || 0) + Number(t.amount)
            });
            groupedChartData = Object.keys(volumeByDate).map(date => ({ date, volume: volumeByDate[date] }))
        }

        const { count } = await supabase
            .from('payment_intents')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', selectedProjectId)
        totalIntents = count || 0

        const { data: recent } = await supabase
            .from('verified_transactions')
            .select('id, verified_at, amount, bank_source, utr, payment_intents!inner(order_id, status, client_id)')
            .eq('payment_intents.client_id', selectedProjectId)
            .order('verified_at', { ascending: false })
            .limit(5)

        if (recent) recentTxns = recent
    }

    const successRate = totalIntents > 0 ? ((successCount / totalIntents) * 100).toFixed(1) : '0.0'

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
                    <p className="text-sm text-slate-500 mt-1">Welcome back, {user.email}</p>
                </div>

                {clients && clients.length > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
                            <span className="text-xs font-medium text-slate-400 pl-3">Project:</span>
                            <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-[400px] custom-scrollbar hide-scrollbar">
                                {clients.map((c) => (
                                    <Link
                                        key={c.id}
                                        href={`/dashboard?project=${c.id}`}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${selectedProjectId === c.id
                                            ? 'bg-violet-600 shadow-md text-white'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                            }`}
                                    >
                                        {c.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <CreateProjectModal variant="compact" />
                        <CurrencySelector />
                    </div>
                )}
            </div>

            {selectedProjectId ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card metric-card p-6 border-t-2 border-t-violet-500/50 shadow-[0_0_15px_rgba(124,58,237,0.05)] hover:shadow-[0_0_20px_rgba(124,58,237,0.1)] transition-all">
                            <h3 className="text-sm font-medium text-slate-400">Total Volume</h3>
                            <p className="text-3xl font-bold text-white mt-2 tracking-tight">
                                <ConvertedAmount amountINR={totalVolume} />
                            </p>
                            <p className="text-xs text-slate-500 mt-2">Lifetime verified transactions</p>
                        </div>
                        <div className="glass-card metric-card p-6 border-t-2 border-t-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all">
                            <h3 className="text-sm font-medium text-slate-400">Successful Txns</h3>
                            <p className="text-3xl font-bold text-emerald-400 mt-2 tracking-tight">{successCount}</p>
                            <p className="text-xs text-slate-500 mt-2">Payments matched & verified</p>
                        </div>
                        <div className="glass-card metric-card p-6 border-t-2 border-t-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.05)] hover:shadow-[0_0_20px_rgba(14,165,233,0.1)] transition-all">
                            <h3 className="text-sm font-medium text-slate-400">Success Rate</h3>
                            <p className="text-3xl font-bold text-sky-400 mt-2 tracking-tight">{successRate}%</p>
                            <p className="text-xs text-slate-500 mt-2">Of {totalIntents} total intents</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                        <div className="lg:col-span-2 glass-card p-6 border border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h2 className="text-lg font-semibold text-white">Transaction Volume</h2>
                                  <p className="text-xs text-slate-500">7-day trailing velocity</p>
                                </div>
                            </div>
                            <TransactionChart data={groupedChartData} />
                        </div>
                        <div className="lg:col-span-1 glass-card p-6 border border-slate-800 flex flex-col">
                            <div className="flex flex-col justify-between mb-4 flex-1">
                                <div>
                                  <h2 className="text-lg font-semibold text-white">System Status</h2>
                                  <p className="text-xs text-slate-500 mb-4">Core infrastructure pulses</p>
                                  
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800/80">
                                      <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-sm font-medium text-slate-300">Auth DB</span>
                                      </div>
                                      <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Operational</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800/80">
                                      <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-sm font-medium text-slate-300">FastAPI</span>
                                      </div>
                                      <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Operational</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800/80">
                                      <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-75"></div>
                                        <span className="text-sm font-medium text-slate-300">IMAP Worker</span>
                                      </div>
                                      <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Polling Active</span>
                                    </div>
                                  </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                            {selectedProject && (
                                <Link
                                    href={`/dashboard/integration?project=${selectedProjectId}`}
                                    className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-md transition-colors border border-slate-700 hover:border-violet-500/30"
                                >
                                    View Integrations &rarr;
                                </Link>
                            )}
                        </div>
                        <div className="glass-card overflow-hidden">
                            {recentTxns.length > 0 ? (
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="bg-slate-950/50 text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Date</th>
                                            <th className="px-6 py-4 font-medium">Order ID</th>
                                            <th className="px-6 py-4 font-medium">UTR</th>
                                            <th className="px-6 py-4 font-medium">Amount</th>
                                            <th className="px-6 py-4 font-medium">Source</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {recentTxns.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-4 text-xs text-slate-400 group-hover:text-slate-300 transition-colors">{new Date(tx.verified_at).toLocaleString()}</td>
                                                <td className="px-6 py-4 font-mono text-xs">{tx.payment_intents?.order_id || '—'}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500 group-hover:text-slate-400">{tx.utr}</td>
                                                <td className="px-6 py-4 font-medium text-white"><ConvertedAmount amountINR={Number(tx.amount)} /></td>
                                                <td className="px-6 py-4"><span className="badge badge-success">{tx.bank_source}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-16 flex flex-col items-center justify-center text-slate-500 bg-slate-900/20">
                                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-slate-300">No transactions found</p>
                                    <p className="text-xs text-slate-500 mt-2">Verified payments will appear here automatically.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center mt-12 bg-slate-900/30 border-dashed border-2 border-slate-700">
                    <div className="w-20 h-20 bg-violet-600/10 rounded-full flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Create a New Project</h2>
                    <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
                        You don't have any projects yet. Create your first project to immediately generate API credentials and track payments.
                    </p>
                    <CreateProjectModal />
                </div>
            )}
        </div>
    )
}