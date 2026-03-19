import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Link as LinkIcon, Plus, CheckCircle2, ArrowRight, Clock, Copy, ExternalLink } from 'lucide-react'
import CopyButton from '@/components/ui/CopyButton'

export default async function PaymentLinksPage(props: { searchParams: Promise<any> }) {
    const searchParams = await props.searchParams;
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    // Fetch user's projects
    const { data: clients } = await supabase
        .from('clients')
        .select('id, name, upi_vpa, crypto_wallet, payment_methods, bank_account')
        .order('created_at', { ascending: true })

    const selectedProjectId = searchParams?.project || (clients && clients.length > 0 ? clients[0].id : null)
    const selectedClient = clients?.find((c: any) => c.id === selectedProjectId)
    const enabledMethods = selectedClient?.payment_methods || { upi: true, usdt: false, bank_transfer: false }

    // Fetch recent payment links for this project
    let recentLinks: any[] = []
    if (selectedProjectId) {
        const { data } = await supabase
            .from('payment_intents')
            .select('id, order_id, amount, currency, status, created_at, expires_at')
            .eq('client_id', selectedProjectId)
            .order('created_at', { ascending: false })
            .limit(10)
        if (data) recentLinks = data
    }

    // --- Server Action ---
    const generateLink = async (formData: FormData) => {
        'use server'
        const amount = parseFloat(formData.get('amount') as string)
        const currency = formData.get('currency') as string
        const projectId = formData.get('project_id') as string
        const rawOrderId = (formData.get('order_id') as string || '').trim()
        const expiryMinutes = parseInt(formData.get('expiry') as string || '15', 10)
        const description = (formData.get('description') as string || '').trim()
        const orderId = rawOrderId || ('link_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now())

        if (isNaN(amount) || amount <= 0) return
        if (!projectId) return

        const supabase = await createClient()

        // Fetch the specific project (RLS ensures user only sees their own)
        const { data: client } = await supabase
            .from('clients')
            .select('id, upi_vpa, crypto_wallet, bank_account')
            .eq('id', projectId)
            .single()

        if (!client) {
            return redirect(`/dashboard/payment-links?project=${projectId}&error=Project+not+found`)
        }

        const { data: intent, error } = await supabase.from('payment_intents').insert({
            client_id: client.id,
            amount,
            currency,
            order_id: orderId,
            upi_vpa: client.upi_vpa || 'noxpay@sbi',
            status: 'pending',
            expires_at: new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString(),
            description
        }).select().single()

        if (error) {
            const msg = error.message.includes('duplicate')
                ? 'Duplicate+order+ID.+Use+a+unique+order+ID+or+leave+blank.'
                : encodeURIComponent(error.message)
            return redirect(`/dashboard/payment-links?project=${projectId}&error=${msg}`)
        }

        if (intent) {
            revalidatePath('/dashboard/payment-links')
            return redirect(`/dashboard/payment-links?project=${projectId}&success_id=${intent.id}`)
        }

        return redirect(`/dashboard/payment-links?project=${projectId}&error=Unknown+error.+Please+try+again.`)
    }

    const successId = searchParams.success_id
    const errorParam = searchParams.error
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nox-pay.vercel.app'
    const checkoutUrl = successId ? `${siteUrl}/checkout?intent=${successId}` : ''
    const widgetUrl = successId ? `${siteUrl}/widget?intent=${successId}` : ''

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <LinkIcon className="text-violet-500 w-8 h-8" />
                        Payment Links
                    </h1>
                    <p className="text-slate-400 mt-2">Generate instant, shareable checkout links for your customers.</p>
                </div>

                {clients && clients.length > 1 && (
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
                        <span className="text-xs font-medium text-slate-400 pl-3">Project:</span>
                        <div className="flex gap-1 overflow-x-auto max-w-[300px]">
                            {clients.map((c: any) => (
                                <a
                                    key={c.id}
                                    href={`/dashboard/payment-links?project=${c.id}`}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${c.id === selectedProjectId
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

            {!selectedProjectId ? (
                <div className="border border-slate-800 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center text-center">
                    <p className="text-slate-400">Create a project first to generate payment links.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Generator Form */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-emerald-400" />
                            Create New Link
                        </h2>

                        {errorParam && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 animate-in slide-in-from-top-2 duration-300">
                                <p className="text-sm text-red-400 font-medium flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                    {decodeURIComponent(errorParam)}
                                </p>
                            </div>
                        )}

                        <form action={generateLink} className="space-y-5">
                            <input type="hidden" name="project_id" value={selectedProjectId} />

                            <div>
                                <label className="text-sm font-medium text-slate-400 block mb-2">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                                    <input
                                        type="number"
                                        name="amount"
                                        step="0.01"
                                        min="1"
                                        placeholder="500.00"
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-white focus:ring-2 focus:ring-violet-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-400 block mb-2">Currency</label>
                                <select
                                    name="currency"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500/50 outline-none transition-all appearance-none"
                                >
                                    {(!enabledMethods || enabledMethods.upi !== false) && <option value="UPI">UPI (INR)</option>}
                                    {enabledMethods?.usdt && <option value="USDT">USDT (Crypto)</option>}
                                    {enabledMethods?.bank_transfer && <option value="BANK">Bank Transfer (INR)</option>}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-400 block mb-2">Order ID <span className="text-slate-600">(auto-generated if empty)</span></label>
                                <input
                                    type="text"
                                    name="order_id"
                                    placeholder="customer_order_123"
                                    pattern="[a-zA-Z0-9_-]*"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500/50 outline-none transition-all font-mono text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 group"
                            >
                                Generate Link
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>

                    {/* Success Display or Recent Links */}
                    <div className="flex flex-col gap-6">
                        {successId && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 animate-in zoom-in-95 duration-300 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[50px] -mr-16 -mt-16 rounded-full"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 text-emerald-400 font-bold text-lg mb-4">
                                        <CheckCircle2 className="w-6 h-6" />
                                        Payment Link Ready!
                                    </div>
                                    <p className="text-sm text-emerald-500/70 mb-6 font-medium">
                                        Copy and share with your customer. Link expires in 15 minutes.
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80 mb-1.5 flex items-center gap-1.5"><ExternalLink className="w-3 h-3" /> Checkout Link</p>
                                            <div className="bg-slate-950/80 backdrop-blur-sm border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner">
                                                <span className="text-xs font-mono text-emerald-200 truncate select-all">{checkoutUrl}</span>
                                                <CopyButton textToCopy={checkoutUrl} className="text-emerald-400 hover:text-emerald-300 shrink-0 bg-emerald-500/10 p-1.5 rounded-md transition-colors" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5"><Copy className="w-3 h-3" /> Widget (Iframe) Link</p>
                                            <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner">
                                                <span className="text-xs font-mono text-slate-300 truncate select-all">{widgetUrl}</span>
                                                <CopyButton textToCopy={widgetUrl} className="text-slate-400 hover:text-white shrink-0 bg-slate-800/50 p-1.5 rounded-md transition-colors" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <a href={checkoutUrl} target="_blank" rel="noreferrer" className="flex-1 text-center py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                                            Open Checkout
                                        </a>
                                        <a href={`/dashboard/payment-links?project=${selectedProjectId}`} className="flex-1 text-center py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-all shadow-sm">
                                            Create Another
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Links always visible unless successfully generated a new one just now, or no links exist and no success */}
                        {!successId && recentLinks.length === 0 && (
                            <div className="h-full border border-slate-800 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-slate-900/20">
                                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-5 text-slate-600 shadow-inner">
                                    <LinkIcon className="w-7 h-7" />
                                </div>
                                <h3 className="text-slate-300 font-medium mb-1">No payment links yet</h3>
                                <p className="text-slate-500 text-xs max-w-[250px] leading-relaxed">
                                    Fill out the form on the left to instantly create a shareable checkout link for your customers.
                                </p>
                            </div>
                        )}

                        {(!successId || recentLinks.length > 1) && recentLinks.length > 0 && (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50">
                                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-violet-400" />
                                        Recent Links
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">{recentLinks.length > 5 ? '5+' : recentLinks.length}</span>
                                </div>
                                <div className="divide-y divide-slate-800/50">
                                    {recentLinks.slice(0, 6).map((link: any) => {
                                        const selfCheckoutUrl = `${siteUrl}/checkout?intent=${link.id}`;
                                        return (
                                            <div key={link.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-all group">
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-mono text-sm font-medium text-slate-200 truncate group-hover:text-violet-300 transition-colors">{link.order_id}</span>
                                                        <CopyButton textToCopy={selfCheckoutUrl} className="text-slate-500 hover:text-white shrink-0 bg-slate-800/50 hover:bg-violet-600 p-1 rounded transition-colors" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-medium text-slate-500">{new Date(link.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                        {(() => {
                                                            const isExpired = link.status === 'pending' && new Date(link.expires_at) < new Date();
                                                            const displayStatus = isExpired ? 'expired' : link.status;
                                                            return (
                                                                <span className={`w-fit text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ${displayStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                        : displayStatus === 'expired' ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                                            : displayStatus === 'pending' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                                                : displayStatus === 'flagged' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                                                    }`}>
                                                                    {displayStatus}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <span className="text-sm font-bold text-white tracking-tight">{link.currency === 'UPI' ? '₹' : '₮'}{Number(link.amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                                                    <a href={selfCheckoutUrl} target="_blank" rel="noreferrer" className="text-[10px] font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1">
                                                        Open <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    )
}
