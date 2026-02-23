import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { CheckCircle2, XCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react'

export default async function WebhooksPage() {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Fetch clients to identify which clients belong to this user
    const { data: clients } = await supabase
        .from('clients')
        .select('id')

    const clientIds = clients?.map(c => c.id) || []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let logs: any[] = []

    if (clientIds.length > 0) {
        const { data } = await supabase
            .from('webhook_logs')
            .select(`
                id,
                url,
                payload,
                response_code,
                attempts,
                status,
                created_at,
                payment_intents (
                    order_id,
                    amount,
                    currency
                )
            `)
            .in('client_id', clientIds)
            .order('created_at', { ascending: false })
            .limit(100)

        logs = data || []
    }

    const retryWebhook = async (formData: FormData) => {
        'use server'
        const logId = formData.get('logId')?.toString()
        if (!logId) return

        const supabase = createClient()
        // 1. Fetch the log
        const { data: logData } = await supabase.from('webhook_logs').select('*').eq('id', logId).single()
        if (!logData) return

        // 2. We could re-sign it, but let's just create a new log entry or update the current one, 
        // to properly trigger Python worker we can just let Python handle it or do it here.
        // Doing it directly from Next.js requires the client's webhook_secret which we can get.
        const { data: clientData } = await supabase.from('clients').select('webhook_secret').eq('id', logData.client_id).single()

        if (!clientData?.webhook_secret) return

        // Node.js crypto for HMAC
        const crypto = await import('crypto')
        const timestamp = Math.floor(Date.now() / 1000).toString()
        const payloadBytes = JSON.stringify(logData.payload)
        const signingInput = `${timestamp}.${payloadBytes}`
        const signature = crypto.createHmac('sha256', clientData.webhook_secret).update(signingInput).digest('hex')

        try {
            const res = await fetch(logData.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-NoxPay-Signature': signature,
                    'X-NoxPay-Timestamp': timestamp
                },
                body: payloadBytes
            })

            await supabase.from('webhook_logs').update({
                response_code: res.status,
                attempts: logData.attempts + 1,
                status: (res.status >= 200 && res.status < 300) ? 'delivered' : 'failed'
            }).eq('id', logId)

        } catch {
            await supabase.from('webhook_logs').update({
                attempts: logData.attempts + 1,
                status: 'failed'
            }).eq('id', logId)
        }

        revalidatePath('/dashboard/webhooks')
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Webhook Logs</h1>
                <p className="text-slate-400 mt-2 max-w-2xl text-sm">Review recently dispatched webhooks and their delivery statuses.</p>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    {logs.length > 0 ? (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Event / Intent</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Response</th>
                                    <th className="px-6 py-4 font-medium">Endpoint</th>
                                    <th className="px-6 py-4 font-medium">Date Sent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{log.payload?.event || 'payment.success'}</span>
                                                {log.payment_intents && (
                                                    <span className="text-xs text-slate-500 font-mono mt-0.5">Order: {log.payment_intents.order_id}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {log.status === 'delivered' && <span className="badge badge-success flex items-center gap-1 w-fit"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>}
                                                {log.status === 'failed' && <span className="badge badge-failed flex items-center gap-1 w-fit"><XCircle className="w-3.5 h-3.5" /> Failed</span>}
                                                {log.status === 'retrying' && <span className="badge badge-pending flex items-center gap-1 w-fit"><Clock className="w-3.5 h-3.5" /> Retrying ({log.attempts})</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.response_code ? (
                                                <span className={`font-mono text-xs ${log.response_code >= 200 && log.response_code < 300 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    HTTP {log.response_code}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 font-mono text-xs">Timeout / None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="text-xs font-mono text-slate-400 truncate max-w-[200px]" title={log.url}>
                                                    {log.url}
                                                </div>
                                                {log.status === 'failed' && (
                                                    <form action={retryWebhook}>
                                                        <input type="hidden" name="logId" value={log.id} />
                                                        <button type="submit" className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors flex items-center gap-1">
                                                            <RefreshCw className="w-3 h-3" /> Retry
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-16 flex flex-col items-center justify-center text-slate-500 bg-slate-900/10">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="h-6 w-6 text-slate-600" />
                            </div>
                            <p className="text-sm font-medium text-slate-300">No webhooks sent yet</p>
                            <p className="text-xs text-slate-500 mt-2">When a payment succeeds, its delivery log will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
