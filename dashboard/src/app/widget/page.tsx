import { createClient } from '@/utils/supabase/server'
import { ExternalLink, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'
import RealtimeListener from '../checkout/RealtimeListener'
import CopyButton from '@/components/ui/CopyButton'
import ExpiryTimer from '../checkout/ExpiryTimer'

// Render a minimalist, embeddable checkout widget
export default async function WidgetPage(props: { searchParams: Promise<any> }) {
    const searchParams = await props.searchParams;
    const intentId = searchParams.intent

    if (!intentId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
                <div className="glass-card p-6 w-full text-center">
                    <h1 className="text-lg font-bold text-white mb-2">Invalid Widget Link</h1>
                    <p className="text-slate-400 text-xs">No payment intent specified.</p>
                </div>
            </div>
        )
    }

    // Preview mode — show a demo widget with fake data
    if (intentId === 'preview') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-transparent">
                <div className="w-full h-full min-h-[500px] flex flex-col bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-500">
                    {/* Header Branding */}
                    <div className="p-5 text-center border-b border-slate-800" style={{ backgroundColor: '#7c3aed15' }}>
                        <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center border border-violet-500/30">
                            <span className="text-lg font-bold text-white">N</span>
                        </div>
                        <h2 className="text-base font-medium text-slate-200">NoxPay Demo</h2>
                        <p className="text-xs text-slate-400 mt-1">Widget preview — not a real payment</p>
                    </div>

                    {/* Body Details */}
                    <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Amount Due</span>
                                <span className="text-3xl font-bold tracking-tight text-white leading-none">
                                    \u20B9500.00
                                </span>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-[10px] text-slate-500 mb-0.5">Order ID</span>
                                <span className="font-mono text-xs text-slate-300">DEMO_ORDER_123</span>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col items-center text-center">
                            <div className="mb-4 bg-white p-2 rounded-xl inline-block">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=1&data=upi%3A%2F%2Fpay%3Fpa%3Ddemo%40upi%26pn%3DNoxPay%2520Demo%26am%3D500%26tr%3DDEMO_ORDER_123"
                                    alt="Demo QR Code"
                                    className="w-40 h-40 object-contain mx-auto"
                                />
                            </div>

                            <p className="text-xs text-slate-300 mb-4 w-full">
                                Pay to UPI ID:
                                <span className="font-mono font-medium text-white text-xs mt-1 flex items-center justify-between gap-2 bg-slate-950 py-2 px-3 rounded-lg border border-slate-800 text-left overflow-hidden">
                                    <span className="truncate">demo@upi</span>
                                </span>
                            </p>

                            <div
                                className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-white/50 bg-violet-600/30 cursor-not-allowed"
                            >
                                Open UPI App <ExternalLink className="w-3.5 h-3.5" />
                            </div>

                            <div className="mt-4 text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                Preview Mode — No Real Payment
                            </div>
                        </div>
                    </div>

                    {/* Footer Security Badge */}
                    <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" /> Secured by NoxPay
                    </div>
                </div>
            </div>
        )
    }

    const supabase = await createClient()

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
            <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
                <div className="glass-card p-6 w-full text-center">
                    <h1 className="text-lg font-bold text-white mb-2">Payment Not Found</h1>
                    <p className="text-slate-400 text-xs">The requested payment session does not exist or has expired.</p>
                </div>
            </div>
        )
    }

    const clientBrand = intent.clients
    const themeColor = clientBrand?.theme_color || '#7c3aed'
    const isExpired = new Date(intent.expires_at) < new Date()
    const isSuccess = intent.status === 'success'

    let paymentUri = ''
    if (intent.currency === 'UPI') {
        paymentUri = `upi://pay?pa=${intent.upi_vpa}&pn=${encodeURIComponent(clientBrand?.name || 'Merchant')}&am=${Math.max(intent.amount, 1)}&tr=${intent.order_id}`
    } else if (intent.currency === 'USDT') {
        paymentUri = clientBrand?.crypto_wallet || ''
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-transparent">
            {/* The widget is designed to be embedded in an iframe so it uses the full width/height of the container */}
            <div className="w-full h-full min-h-[500px] flex flex-col bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-500">
                <RealtimeListener intentId={intent.id} currentStatus={intent.status} />

                {/* Header Branding */}
                <div className="p-5 text-center border-b border-slate-800" style={{ backgroundColor: `${themeColor}15` }}>
                    {clientBrand?.logo_url ? (
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl overflow-hidden bg-white/5 p-1 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={clientBrand.logo_url} alt={clientBrand.name} className="max-w-full max-h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700">
                            <span className="text-lg font-bold text-white">{clientBrand?.name?.charAt(0)}</span>
                        </div>
                    )}
                    <h2 className="text-base font-medium text-slate-200">{clientBrand?.name}</h2>
                    <p className="text-xs text-slate-400 mt-1">Complete your payment securely.</p>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Amount Due</span>
                            <span className="text-3xl font-bold tracking-tight text-white leading-none">
                                {intent.currency === 'UPI' ? '\u20B9' : '\u20AE'}
                                {Number(intent.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 mb-0.5">Order ID</span>
                            <span className="font-mono text-xs text-slate-300">{intent.order_id}</span>
                        </div>
                    </div>

                    {/* Status Display */}
                    {!isSuccess && !isExpired && (
                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col items-center text-center">

                            {paymentUri && (
                                <div className="mb-4 bg-white p-2 rounded-xl inline-block">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=1&data=${encodeURIComponent(paymentUri)}`}
                                        alt="Payment QR Code"
                                        className="w-40 h-40 object-contain mx-auto"
                                    />
                                </div>
                            )}

                            <p className="text-xs text-slate-300 mb-4 w-full">
                                {intent.currency === 'UPI'
                                    ? `Pay to UPI ID:`
                                    : `Send TRC20 USDT to:`}
                                <span className="font-mono font-medium text-white text-xs mt-1 flex items-center justify-between gap-2 bg-slate-950 py-2 px-3 rounded-lg border border-slate-800 text-left overflow-hidden">
                                    <span className="truncate">{intent.currency === 'UPI' ? intent.upi_vpa : paymentUri}</span>
                                    <CopyButton textToCopy={intent.currency === 'UPI' ? intent.upi_vpa : paymentUri} className="shrink-0 text-slate-400 hover:text-white" />
                                </span>
                            </p>

                            {intent.currency === 'UPI' && (
                                <a
                                    href={paymentUri}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    Open UPI App <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}

                            <ExpiryTimer expiresAt={intent.expires_at} />
                        </div>
                    )}

                    {isSuccess && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex flex-col items-center text-center flex-1 justify-center min-h-[220px]">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-base font-bold text-emerald-400 mb-1">Payment Successful</h3>
                            <p className="text-xs text-emerald-500/80">Your transaction has been verified.</p>
                        </div>
                    )}

                    {isExpired && !isSuccess && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex flex-col items-center text-center flex-1 justify-center min-h-[220px]">
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-3">
                                <XCircle className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-base font-bold text-red-400 mb-1">Payment Expired</h3>
                            <p className="text-xs text-red-500/80">This session has timed out. Please try again.</p>
                        </div>
                    )}

                </div>

                {/* Footer Security Badge */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" /> Secured by NoxPay
                </div>
            </div>
        </div>
    )
}
