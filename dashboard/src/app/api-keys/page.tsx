import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CopyButton from '@/components/ui/CopyButton'
import { regenerateSecretKey, regenerateWebhookSecret } from '@/app/settings/actions'

export default async function ApiKeysPage(props: { searchParams: Promise<any> }) {
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
        .select('*')
        .order('created_at', { ascending: true })

    const selectedProjectId = searchParams?.project || (clients && clients.length > 0 ? clients[0].id : null)
    const client = clients?.find((c) => c.id === selectedProjectId)

    if (!client && clients && clients.length > 0) {
        return redirect(`/api-keys?project=${clients[0].id}`)
    } else if (!client) {
        return (
            <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
                <div className="text-slate-500">Please create a project first.</div>
            </div>
        )
    }

    const newSecret = searchParams?.new_secret
    const msg = searchParams?.message
    const err = searchParams?.error

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">API Keys</h1>
                    <p className="text-slate-400 mt-2">Manage API credentials for {client.name}.</p>
                </div>
                
                {clients && clients.length > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
                            <span className="text-xs font-medium text-slate-400 pl-3">Project:</span>
                            <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-[400px] custom-scrollbar hide-scrollbar">
                                {clients.map((c) => (
                                    <Link
                                        key={c.id}
                                        href={`/api-keys?project=${c.id}`}
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
                    </div>
                )}
            </div>

            {msg && !newSecret && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm">
                    {msg}
                </div>
            )}
            {err && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {err}
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-3xl shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    Client Credentials
                </h2>

                {newSecret && (
                    <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-pulse-once shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                        <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            New Secret Generated Successfully!
                        </h3>
                        <p className="text-sm text-emerald-500/80 mb-4">
                            Please copy your new Client Secret now. You will not be able to see it again after you leave this page.
                        </p>
                        <div className="bg-slate-950 border border-emerald-500/50 px-4 py-3 rounded-xl font-mono text-sm text-emerald-300 flex justify-between items-center break-all">
                            <span>{newSecret}</span>
                            <CopyButton textToCopy={newSecret} className="text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg shrink-0 ml-4 font-bold transition-all" />
                        </div>
                    </div>
                )}

                <div className="space-y-8">
                    {/* Client ID */}
                    <div>
                        <label className="text-sm font-medium text-slate-400 block mb-2">Client ID (Public)</label>
                        <div className="bg-slate-950/50 border border-slate-800 px-4 py-3 rounded-lg font-mono text-sm text-slate-300 flex justify-between items-center shadow-inner">
                            <span>{client?.client_id || 'No client registered'}</span>
                            <CopyButton textToCopy={client?.client_id || ''} className="text-violet-400 hover:text-white bg-slate-800/50 hover:bg-violet-600 px-2 py-1 rounded transition-colors" />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Identifies your project. Safe to use in frontend widgets like the standard Integration Iframe.</p>
                    </div>

                    {/* Secret Key */}
                    <div className="pt-6 border-t border-slate-800/50">
                        <label className="text-sm font-medium text-slate-400 block mb-2 text-rose-400/80">Secret Key (Private)</label>
                        <div className="bg-slate-950/50 border border-rose-900/30 px-4 py-3 rounded-lg font-mono text-sm text-slate-600 flex justify-between items-center select-none shadow-inner">
                            <span>****************************************************************</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-slate-500 max-w-[80%]">Used for backend API authentication. Cannot be viewed after creation. Rotating will immediately invalidate your old key.</p>
                            <form action={regenerateSecretKey.bind(null, client.id)}>
                                <button className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 px-4 py-2 rounded-lg transition-all text-xs font-medium flex items-center gap-2 hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] whitespace-nowrap">
                                    Roll Secret Key
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Webhook Secret */}
                    <div className="pt-6 border-t border-slate-800/50">
                        <label className="text-sm font-medium text-slate-400 block mb-2 text-cyan-400/80">Webhook Secret (Private)</label>
                        <div className="bg-slate-950/50 border border-cyan-900/30 px-4 py-3 rounded-lg font-mono text-sm text-slate-300 flex justify-between items-center shadow-inner break-all">
                            <span>{client?.webhook_secret || 'Not generated yet'}</span>
                            {client?.webhook_secret && (
                                <CopyButton textToCopy={client.webhook_secret} className="text-cyan-400 hover:text-white bg-slate-800/50 hover:bg-cyan-600 px-2 py-1 rounded transition-colors shrink-0 ml-4" />
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-3">
                            <p className="text-xs text-slate-500 max-w-[80%]">Used to verify the cryptographic signature of webhook events sent to your server. <strong>Never</strong> expose this publicly.</p>
                            <form action={regenerateWebhookSecret.bind(null, client.id)}>
                                <button className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 px-4 py-2 rounded-lg transition-all text-xs font-medium flex items-center gap-2 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] whitespace-nowrap">
                                    Roll Webhook Secret
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-4 bg-sky-950/20 border border-sky-900/40 rounded-xl p-6 max-w-3xl text-sky-400 flex gap-4 items-start shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                   <h3 className="font-semibold text-sm mb-1.5">Integration Note</h3>
                   <p className="text-xs text-sky-500/80 leading-relaxed">
                       Always include your Client ID as the <code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded">x-client-id</code> header and your Secret Key as the <code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded">x-client-secret</code> header when making backend API calls to create Payment Intents.
                   </p>
                </div>
            </div>
        </div>
    )
}
