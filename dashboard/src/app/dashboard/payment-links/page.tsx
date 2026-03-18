import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Link as LinkIcon, Plus, CheckCircle2, ArrowRight } from 'lucide-react'
import CopyButton from '@/components/ui/CopyButton'

export default async function PaymentLinksPage({
    searchParams
}: {
    searchParams: { success_id?: string }
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }



    // --- Server Action ---
    const generateLink = async (formData: FormData) => {
        'use server'
        const amount = parseFloat(formData.get('amount') as string)
        const currency = formData.get('currency') as string
        const orderId = formData.get('order_id') as string || `link_${Math.random().toString(36).substring(7)}`

        if (isNaN(amount) || amount <= 0) return

        const supabase = await createClient()
        const { data: client } = await supabase.from('clients').select('id, upi_vpa').limit(1).single()

        if (client) {
            // Create a payment intent manual link
            const { data: intent, error } = await supabase.from('payment_intents').insert({
                client_id: client.id,
                amount,
                currency,
                order_id: orderId,
                upi_vpa: client.upi_vpa,
                status: 'pending',
                expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins
            }).select().single()

            if (intent && !error) {
                revalidatePath('/dashboard/payment-links')
                return redirect(`/dashboard/payment-links?success_id=${intent.id}`)
            }
        }
    }

    const successId = searchParams.success_id
    const checkoutUrl = successId ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout?intent=${successId}` : ''

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col mb-4">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <LinkIcon className="text-violet-500 w-8 h-8" />
                    Payment Links
                </h1>
                <p className="text-slate-400 mt-2">Generate instant, shareable checkout links for your customers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Generator Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-emerald-400" />
                        Create New Link
                    </h2>

                    <form action={generateLink} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                                <input
                                    type="number"
                                    name="amount"
                                    step="0.01"
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
                                <option value="UPI">UPI (INR)</option>
                                <option value="USDT">USDT (Crypto)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Internal Order ID (Optional)</label>
                            <input
                                type="text"
                                name="order_id"
                                placeholder="customer_123"
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

                {/* Success Display or Instructions */}
                <div className="flex flex-col gap-6">
                    {successId ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 animate-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-3 text-emerald-400 font-bold text-lg mb-4">
                                <CheckCircle2 className="w-6 h-6" />
                                Payment Link Ready!
                            </div>
                            <p className="text-sm text-emerald-500/70 mb-6">
                                Copy the link below and send it to your customer. They can pay via UPI or Crypto instantly.
                            </p>

                            <div className="bg-slate-950 border border-emerald-500/50 rounded-xl p-4 flex items-center justify-between gap-4 break-all shadow-inner">
                                <span className="text-sm font-mono text-emerald-200 select-all truncate">
                                    {checkoutUrl}
                                </span>
                                <CopyButton textToCopy={checkoutUrl} className="text-emerald-400 hover:text-white shrink-0" />
                            </div>

                            <div className="mt-8 flex justify-center">
                                <a
                                    href={checkoutUrl}
                                    target="_blank"
                                    className="text-white/60 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
                                    rel="noreferrer"
                                >
                                    Test checkout link <ArrowRight className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-slate-800 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 text-slate-700">
                                <LinkIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-slate-300 font-medium mb-1">No link generated</h3>
                            <p className="text-slate-500 text-sm max-w-[250px]">
                                Fill out the form to generate a one-time use payment link.
                            </p>
                        </div>
                    )}

                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Tip</h4>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center shrink-0 font-bold">1</div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Use Payment Links to collect fees, subscriptions, or sales without any website integration.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center shrink-0 font-bold">2</div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Links expire in 15 minutes to prevent price volatility and ensure transaction freshness.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
