import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Mail, CheckCircle2, XCircle, AlertTriangle, Clock, Eye } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    received: { label: 'Received', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: '📩' },
    security_rejected: { label: 'Security Rejected', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: '🛡️' },
    parse_failed: { label: 'Parse Failed', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: '⚠️' },
    parsed: { label: 'Parsed', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: '🔍' },
    matched: { label: 'Matched & Settled', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: '✅' },
    settle_failed: { label: 'Settle Failed', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: '❌' },
}

export default async function EmailLogsPage(props: { searchParams: Promise<any> }) {
    const searchParams = await props.searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // Fetch recent worker email logs (last 50)
    const { data: logs, error } = await supabase
        .from('worker_email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

    const selectedId = searchParams?.view

    const selectedLog = selectedId && logs ? logs.find((l: any) => l.id === selectedId) : null

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Mail className="text-cyan-500 w-8 h-8" />
                        Email Logs
                    </h1>
                    <p className="text-slate-400 mt-2">Monitor worker email processing. See which emails arrived, were parsed, matched, or rejected.</p>
                </div>
                <a
                    href="/dashboard/email-logs"
                    className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl px-4 py-2 transition-all"
                >
                    Refresh
                </a>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-sm text-red-400">Failed to load logs: {error.message}</p>
                    <p className="text-xs text-red-500/60 mt-1">Make sure the <code className="bg-slate-900 px-1 rounded">worker_email_logs</code> table exists. Run migration <code className="bg-slate-900 px-1 rounded">20260321_worker_email_logs.sql</code>.</p>
                </div>
            )}

            {/* Detail Panel */}
            {selectedLog && (
                <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 animate-in slide-in-from-top-2 duration-300 shadow-[0_0_20px_rgba(6,182,212,0.08)]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Eye className="w-5 h-5 text-cyan-400" />
                            Email Detail
                        </h2>
                        <a href="/dashboard/email-logs" className="text-xs text-slate-500 hover:text-white transition-colors">✕ Close</a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <DetailField label="Sender" value={selectedLog.sender} />
                        <DetailField label="Subject" value={selectedLog.subject} />
                        <DetailField label="Status" value={STATUS_CONFIG[selectedLog.status]?.label || selectedLog.status} />
                        <DetailField label="Time" value={new Date(selectedLog.created_at).toLocaleString()} />
                        <DetailField label="Parsed Amount" value={selectedLog.parsed_amount ? `₹${selectedLog.parsed_amount}` : '—'} />
                        <DetailField label="Parsed UTR" value={selectedLog.parsed_utr || '—'} mono />
                        <DetailField label="Parsed Order ID" value={selectedLog.parsed_order_id || '—'} mono />
                        <DetailField label="Parsed Bank" value={selectedLog.parsed_bank || '—'} />
                        {selectedLog.error_message && (
                            <div className="sm:col-span-2">
                                <DetailField label="Error" value={selectedLog.error_message} error />
                            </div>
                        )}
                        {selectedLog.body_preview && (
                            <div className="sm:col-span-2">
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Body Preview</span>
                                <pre className="text-xs text-slate-400 font-mono bg-slate-950 border border-slate-800 rounded-lg p-3 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">{selectedLog.body_preview}</pre>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Stats Row */}
            {logs && logs.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="Total Received" value={logs.filter((l: any) => ['received', 'parsed', 'matched'].includes(l.status)).length} icon="📩" color="text-blue-400" />
                    <StatCard label="Successfully Matched" value={logs.filter((l: any) => l.status === 'matched').length} icon="✅" color="text-emerald-400" />
                    <StatCard label="Security Rejected" value={logs.filter((l: any) => l.status === 'security_rejected').length} icon="🛡️" color="text-red-400" />
                    <StatCard label="Parse Failed" value={logs.filter((l: any) => l.status === 'parse_failed').length} icon="⚠️" color="text-orange-400" />
                </div>
            )}

            {/* Logs Table */}
            {(!logs || logs.length === 0) && !error ? (
                <div className="border border-slate-800 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-slate-900/20">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-5 text-slate-600 shadow-inner">
                        <Mail className="w-7 h-7" />
                    </div>
                    <h3 className="text-slate-300 font-medium mb-1">No email logs yet</h3>
                    <p className="text-slate-500 text-xs max-w-[350px] leading-relaxed">
                        The worker hasn&apos;t processed any emails yet, or the <code className="bg-slate-800 px-1 rounded">worker_email_logs</code> table hasn&apos;t been created. Run the migration first.
                    </p>
                </div>
            ) : logs && logs.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50">
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            Recent Processing Logs
                        </div>
                        <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">{logs.length}</span>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {logs.map((log: any) => {
                            const cfg = STATUS_CONFIG[log.status] || { label: log.status, color: 'text-slate-400 bg-slate-800 border-slate-700', icon: '•' }
                            return (
                                <a
                                    key={log.id}
                                    href={`/dashboard/email-logs?view=${log.id}`}
                                    className={`block p-4 sm:px-6 hover:bg-slate-800/30 transition-all ${selectedId === log.id ? 'bg-slate-800/40' : ''}`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm">{cfg.icon}</span>
                                                <span className="text-sm font-medium text-slate-200 truncate">{log.subject || '(no subject)'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                <span className="text-[10px] text-slate-500 truncate max-w-[200px]">from: {log.sender}</span>
                                                <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold border ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            {log.error_message && (
                                                <p className="text-[11px] text-red-400/70 mt-1 truncate">{log.error_message}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            {log.parsed_amount && (
                                                <span className="text-sm font-bold text-white">₹{log.parsed_amount}</span>
                                            )}
                                            {log.parsed_utr && (
                                                <span className="text-[10px] font-mono text-slate-500">UTR: {log.parsed_utr}</span>
                                            )}
                                        </div>
                                    </div>
                                </a>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

function DetailField({ label, value, mono, error }: { label: string; value: string; mono?: boolean; error?: boolean }) {
    return (
        <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-0.5">{label}</span>
            <p className={`text-sm break-all ${error ? 'text-red-400' : 'text-slate-200'} ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
        </div>
    )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <span className="text-lg">{icon}</span>
            <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{label}</p>
        </div>
    )
}
