import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function TransactionsPage() {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: client } = await supabase
        .from('clients')
        .select('id')
        .limit(1)
        .single()

    let transactions: {
        id: string; verified_at: string;
        payment_intents?: { order_id: string; status: string };
        utr?: string; tx_hash?: string; amount: number; bank_source: string
    }[] = []

    if (client) {
        const { data: txs } = await supabase
            .from('verified_transactions')
            .select('*, payment_intents(order_id, status)')
            .order('verified_at', { ascending: false })
            .limit(50)
        if (txs) transactions = txs as typeof transactions
    }

    // Also fetch payment intents for status overview
    const { data: intents } = await supabase
        .from('payment_intents')
        .select('id, order_id, amount, status, created_at, expires_at')
        .order('created_at', { ascending: false })
        .limit(50)

    function getBadgeClass(status: string) {
        switch (status) {
            case 'success': case 'delivered': return 'badge badge-success'
            case 'pending': case 'retrying': return 'badge badge-pending'
            case 'failed': return 'badge badge-failed'
            case 'expired': return 'badge badge-expired'
            default: return 'badge badge-pending'
        }
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center w-full mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Transactions</h1>
                    <p className="text-slate-400 text-sm mt-1">Verified payments and payment intent history.</p>
                </div>
            </div>

            {/* Verified Transactions */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-3">Verified Payments</h2>
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950/50 text-slate-400">
                            <tr>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Order ID</th>
                                <th className="px-6 py-3 font-medium">UTR / Hash</th>
                                <th className="px-6 py-3 font-medium">Amount</th>
                                <th className="px-6 py-3 font-medium">Source</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 text-xs">{new Date(tx.verified_at).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{tx.payment_intents?.order_id || '—'}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{tx.utr || tx.tx_hash}</td>
                                        <td className="px-6 py-4 font-medium">₹{Number(tx.amount).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4"><span className="badge badge-success">{tx.bank_source}</span></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center text-slate-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            <p className="text-sm">No verified transactions yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Intents */}
            <div className="mt-4">
                <h2 className="text-lg font-semibold text-white mb-3">Payment Intents</h2>
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950/50 text-slate-400">
                            <tr>
                                <th className="px-6 py-3 font-medium">Created</th>
                                <th className="px-6 py-3 font-medium">Order ID</th>
                                <th className="px-6 py-3 font-medium">Amount</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Expires</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {(intents || []).length > 0 ? (
                                (intents || []).map((intent: { id: string; order_id: string; amount: number; status: string; created_at: string; expires_at: string }) => (
                                    <tr key={intent.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 text-xs">{new Date(intent.created_at).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{intent.order_id}</td>
                                        <td className="px-6 py-4 font-medium">₹{Number(intent.amount).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <span className={getBadgeClass(intent.status)}>{intent.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">{intent.expires_at ? new Date(intent.expires_at).toLocaleString() : '—'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <p className="text-sm">No payment intents created yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
