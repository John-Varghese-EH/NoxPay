import { createClient } from '@/utils/supabase/server'
import { ExternalLink, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'
import RealtimeListener from './RealtimeListener'
import CopyButton from '@/components/ui/CopyButton'
import ExpiryTimer from './ExpiryTimer'

// Render a dynamic, branded checkout page
export default async function CheckoutPage({ searchParams }: { searchParams: { intent?: string } }) {
    const intentId = searchParams.intent

    if (!intentId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
                <div className="glass-card p-8 max-w-md w-full text-center">
                    <h1 className="text-xl font-bold text-white mb-2">Invalid Checkout Link</h1>
                    <p className="text-slate-400 text-sm">No payment intent specified.</p>
                </div>
            </div>
        )
    }

    const supabase = createClient()

    // Fetch intent details
    const { data: intent } = await supabase
        .from('payment_intents')
        .select(`
            *,
            clients (
                name,
                theme_color,
                logo_url,
                return_url,
                crypto_wallet
            )
        `)
        .eq('id', intentId)
        .single()

    if (!intent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
                <div className="glass-card p-8 max-w-md w-full text-center">
                    <h1 className="text-xl font-bold text-white mb-2">Payment Not Found</h1>
                    <p className="text-slate-400 text-sm">The requested payment session does not exist or has expired.</p>
                </div>
            </div>
        )
    }

    const clientBrand = intent.clients
    const themeColor = clientBrand?.theme_color || '#7c3aed'
    const isExpired = new Date(intent.expires_at) < new Date()
    const isSuccess = intent.status === 'success'

    // Generate Payment URI (Mocking the python logic generation here just for display fallback if needed, but usually Python API created QR. However, here we show instructions)
    let paymentUri = ''
    if (intent.currency === 'UPI') {
        paymentUri = `upi://pay?pa=${intent.upi_vpa}&pn=${encodeURIComponent(clientBrand?.name || 'Merchant')}&am=${Math.max(intent.amount, 1)}&tr=${intent.order_id}`
    } else if (intent.currency === 'USDT') {
        paymentUri = clientBrand?.crypto_wallet || ''
    }

    // Auto-redirect if success and return_url exists
    if (isSuccess && clientBrand?.return_url) {
        // We render a meta refresh just in case, or a button
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: `${themeColor}10` }}>
            <RealtimeListener intentId={intent.id} currentStatus={intent.status} />

            {isSuccess && clientBrand?.return_url && (
                <meta httpEquiv="refresh" content={`3;url=${clientBrand.return_url}`} />
            )}

            <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                {/* Header Branding */}
                <div className="p-6 text-center border-b border-slate-800" style={{ backgroundColor: `${themeColor}15` }}>
                    {clientBrand?.logo_url ? (
                        <div className="w-16 h-16 mx-auto mb-3 rounded-xl overflow-hidden bg-white/5 p-1 flex items-center justify-center">
                            {/* Using standard img to avoid next/image domain config issues for dynamic merchant domains */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={clientBrand.logo_url} alt={clientBrand.name} className="max-w-full max-h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700">
                            <span className="text-xl font-bold text-white">{clientBrand?.name?.charAt(0)}</span>
                        </div>
                    )}
                    <h2 className="text-lg font-medium text-slate-200">{clientBrand?.name}</h2>
                    <p className="text-sm text-slate-400 mt-1">Complete your payment securely.</p>
                </div>

                {/* Body Details */}
                <div className="p-6 flex flex-col gap-6">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Amount Due</span>
                            <span className="text-4xl font-bold tracking-tight text-white mb-0 leading-none">
                                {intent.currency === 'UPI' ? '₹' : '₮'}
                                {Number(intent.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-xs text-slate-500 mb-1">Order ID</span>
                            <span className="font-mono text-sm text-slate-300">{intent.order_id}</span>
                        </div>
                    </div>

                    {/* Status Display */}
                    {!isSuccess && !isExpired && (
                        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col items-center text-center">

                            {paymentUri && (
                                <div className="mb-4 bg-white p-2 rounded-xl">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=1&data=${encodeURIComponent(paymentUri)}`}
                                        alt="Payment QR Code"
                                        className="w-48 h-48 object-contain"
                                    />
                                </div>
                            )}

                            <p className="text-sm text-slate-300 mb-4 w-full">
                                {intent.currency === 'UPI'
                                    ? `Pay to UPI ID:`
                                    : `Send TRC20 USDT to:`}
                                <span className="font-mono font-medium text-white break-all mt-1 flex items-center justify-between gap-2 bg-slate-950 py-2 px-3 rounded-lg border border-slate-800 text-left">
                                    <span className="truncate">{intent.currency === 'UPI' ? intent.upi_vpa : paymentUri}</span>
                                    <CopyButton textToCopy={intent.currency === 'UPI' ? intent.upi_vpa : paymentUri} className="shrink-0 text-slate-400 hover:text-white" />
                                </span>
                            </p>

                            {intent.currency === 'UPI' && (
                                <a
                                    href={paymentUri}
                                    className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium text-white transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    Open UPI App <ExternalLink className="w-4 h-4" />
                                </a>
                            )}

                            <ExpiryTimer expiresAt={intent.expires_at} />
                        </div>
                    )}

                    {isSuccess && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-400 mb-1">Payment Successful</h3>
                            <p className="text-sm text-emerald-500/80">Your transaction has been verified.</p>

                            {clientBrand?.return_url ? (
                                <a href={clientBrand.return_url} className="mt-4 text-sm font-medium hover:underline text-emerald-400">
                                    Return to Merchant
                                </a>
                            ) : null}
                        </div>
                    )}

                    {isExpired && !isSuccess && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-3">
                                <XCircle className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-red-400 mb-1">Payment Expired</h3>
                            <p className="text-sm text-red-500/80">This session has timed out. Please try again.</p>
                        </div>
                    )}

                </div>

                {/* Footer Security Badge */}
                <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-500/70" /> Secured by NoxPay
                </div>
            </div>
        </div>
    )
}
// We need to import lucide icons properly above.
