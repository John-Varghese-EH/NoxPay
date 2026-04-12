import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function WebhooksPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: client } = await supabase
        .from('clients')
        .select('webhook_url, webhook_secret, id')
        .limit(1)
        .single()

    let logs: { id: string; created_at: string; status: string; response_code?: number; attempts: number }[] = []
    if (client) {
        const { data: fetchedLogs } = await supabase
            .from('webhook_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(15)
        if (fetchedLogs) logs = fetchedLogs as typeof logs
    }

    // Mask webhook secret for display
    const maskedSecret = client?.webhook_secret
        ? client.webhook_secret.substring(0, 10) + '••••••••••••••••'
        : 'Not configured'

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto">
            <div className="flex flex-col mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Webhooks</h1>
                <p className="text-slate-400 mt-2">Configure endpoints to receive real-time HTTP POST notifications.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Config Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Endpoint Configuration</h2>
                        <form className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-400 block mb-2">Webhook URL</label>
                                <input
                                    type="url"
                                    defaultValue={client?.webhook_url || ''}
                                    placeholder="https://your-api.com/webhook"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>
                            <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-md px-4 py-2 font-medium transition-colors text-sm w-full">
                                Save Configuration
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-800/50">
                            <button className="w-full border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-md px-4 py-2 font-medium transition-colors text-sm">
                                Send Test Ping
                            </button>
                        </div>
                    </div>

                    {/* Webhook Secret Display */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Signing Secret</h2>
                        <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-md font-mono text-xs text-slate-400 break-all">
                            {maskedSecret}
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                            Use this secret to verify <code className="text-violet-400">X-NoxPay-Signature</code> headers on incoming webhooks.
                        </p>
                        <div className="mt-4 p-3 bg-violet-500/5 border border-violet-500/10 rounded-md">
                            <p className="text-xs text-slate-400 font-mono leading-relaxed">
                                expected = HMAC-SHA256(secret, timestamp + &quot;.&quot; + payload)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="lg:col-span-2 glass-card overflow-hidden">
                    <div className="p-6 border-b border-slate-800/50">
                        <h2 className="text-lg font-semibold text-white">Recent Delivery Logs</h2>
                    </div>
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950/50 text-slate-400">
                            <tr>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">HTTP Code</th>
                                <th className="px-6 py-3 font-medium text-right">Attempts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs">{new Date(log.created_at).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${log.status === 'delivered' ? 'badge-success' : log.status === 'retrying' ? 'badge-pending' : 'badge-failed'}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{log.response_code || '-'}</td>
                                        <td className="px-6 py-4 text-right">{log.attempts}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        No webhook logs found. Delivery history will appear here.
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
