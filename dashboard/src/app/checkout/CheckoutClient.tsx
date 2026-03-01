'use client'

import { useState } from 'react'
import { ExternalLink, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'
import RealtimeListener from './RealtimeListener'
import CopyButton from '@/components/ui/CopyButton'
import ExpiryTimer from './ExpiryTimer'
import LanguageToggle from './LanguageToggle'
import { translations, Language } from './CheckoutTranslations'
import Image from 'next/image'

interface Intent {
    id: string
    status: string
    currency: string
    amount: number | string
    expires_at: string
    order_id: string
    upi_vpa?: string
}

interface ClientBrand {
    theme_color?: string
    name?: string
    logo_url?: string
    crypto_wallet?: string
    return_url?: string
}

interface CheckoutClientProps {
    intent: Intent
    clientBrand: ClientBrand
}

export default function CheckoutClient({ intent, clientBrand }: CheckoutClientProps) {
    const [lang, setLang] = useState<Language>('en')
    const [showOffline, setShowOffline] = useState(false)
    const t = translations[lang]

    const themeColor = clientBrand?.theme_color || '#7c3aed'
    const isExpired = new Date(intent.expires_at) < new Date()
    const isSuccess = intent.status === 'success'

    let paymentUri = ''
    if (intent.currency === 'UPI') {
        paymentUri = `upi://pay?pa=${intent.upi_vpa}&pn=${encodeURIComponent(clientBrand?.name || 'Merchant')}&am=${Math.max(Number(intent.amount), 1)}&tr=${intent.order_id}`
    } else if (intent.currency === 'USDT') {
        paymentUri = clientBrand?.crypto_wallet || ''
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500" style={{ backgroundColor: `${themeColor}10` }}>
            <RealtimeListener intentId={intent.id} currentStatus={intent.status} />

            {isSuccess && clientBrand?.return_url && (
                <meta httpEquiv="refresh" content={`3;url=${clientBrand.return_url}`} />
            )}

            <div className="w-full max-w-md flex flex-col">
                <LanguageToggle currentLang={lang} onChange={setLang} />

                <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    {/* Header Branding */}
                    <div className="p-6 text-center border-b border-slate-800" style={{ backgroundColor: `${themeColor}15` }}>
                        {clientBrand?.logo_url ? (
                            <div className="w-16 h-16 mx-auto mb-3 rounded-xl overflow-hidden bg-white/5 p-1 flex items-center justify-center">
                                <Image
                                    src={clientBrand.logo_url || ''}
                                    alt={clientBrand.name || 'Merchant logo'}
                                    width={64}
                                    height={64}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700">
                                <span className="text-xl font-bold text-white">{clientBrand?.name?.charAt(0)}</span>
                            </div>
                        )}
                        <h2 className="text-lg font-medium text-slate-200">{clientBrand?.name}</h2>
                        <p className="text-sm text-slate-400 mt-1">{t.completePayment}</p>
                    </div>

                    {/* Body Details */}
                    <div className="p-6 flex flex-col gap-6">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{t.amountDue}</span>
                                <span className="text-4xl font-bold tracking-tight text-white mb-0 leading-none">
                                    {intent.currency === 'UPI' ? '₹' : '₮'}
                                    {Number(intent.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-xs text-slate-500 mb-1">{t.orderId}</span>
                                <span className="font-mono text-sm text-slate-300">{intent.order_id}</span>
                            </div>
                        </div>

                        {/* Status Display */}
                        {!isSuccess && !isExpired && (
                            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col items-center text-center">
                                {paymentUri && (
                                    <div className="mb-4 bg-white p-2 rounded-xl">
                                        <Image
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=1&data=${encodeURIComponent(paymentUri)}`}
                                            alt="Payment QR Code"
                                            width={192}
                                            height={192}
                                            className="w-48 h-48 object-contain"
                                        />
                                    </div>
                                )}

                                <p className="text-sm text-slate-300 mb-4 w-full">
                                    {intent.currency === 'UPI' ? t.payTo : t.sendUsdt}
                                    <span className="font-mono font-medium text-white break-all mt-1 flex items-center justify-between gap-2 bg-slate-950 py-2 px-3 rounded-lg border border-slate-800 text-left">
                                        <span className="truncate">{intent.currency === 'UPI' ? intent.upi_vpa : paymentUri}</span>
                                        <CopyButton textToCopy={(intent.currency === 'UPI' ? intent.upi_vpa : paymentUri) || ''} className="shrink-0 text-slate-400 hover:text-white" />
                                    </span>
                                </p>

                                {intent.currency === 'UPI' && (
                                    <>
                                        <a
                                            href={paymentUri}
                                            className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium text-white transition-opacity hover:opacity-90"
                                            style={{ backgroundColor: themeColor }}
                                        >
                                            {t.openUpi} <ExternalLink className="w-4 h-4" />
                                        </a>

                                        <button
                                            onClick={() => setShowOffline(!showOffline)}
                                            className="mt-4 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${showOffline ? 'bg-violet-500 animate-pulse' : 'bg-slate-700'}`}></div>
                                            {t.noInternet}
                                        </button>

                                        {showOffline && (
                                            <div className="mt-4 w-full text-left bg-slate-950/50 rounded-xl p-4 border border-slate-800 animate-in slide-in-from-top-2 duration-300">
                                                <div className="mb-4">
                                                    <p className="text-[10px] font-bold text-violet-400 mb-2 uppercase tracking-widest">{t.ussdTitle}</p>
                                                    <ul className="text-[11px] text-slate-400 space-y-1 leading-relaxed">
                                                        <li>{t.ussdStep1}</li>
                                                        <li>{t.ussdStep2} <span className="text-slate-200 font-mono select-all bg-slate-900 px-1 rounded">{intent.upi_vpa}</span></li>
                                                        <li>{t.ussdStep3}</li>
                                                    </ul>
                                                </div>
                                                <div className="pt-3 border-t border-slate-800/50">
                                                    <p className="text-[10px] font-bold text-violet-400 mb-2 uppercase tracking-widest">{t.ivrTitle}</p>
                                                    <ul className="text-[11px] text-slate-400 space-y-1 leading-relaxed">
                                                        <li>{t.ivrStep1}</li>
                                                        <li>{t.ivrStep2}</li>
                                                        <li>{t.ivrStep3} <span className="text-slate-200 font-mono select-all bg-slate-900 px-1 rounded">{intent.order_id}</span></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                <ExpiryTimer
                                    expiresAt={intent.expires_at}
                                    expiresInLabel={t.expiresIn}
                                    expiredLabel={t.expired}
                                />
                            </div>
                        )}

                        {isSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-bold text-emerald-400 mb-1">{t.paymentSuccessful}</h3>
                                <p className="text-sm text-emerald-500/80">{t.verified}</p>

                                {clientBrand?.return_url ? (
                                    <a href={clientBrand.return_url} className="mt-4 text-sm font-medium hover:underline text-emerald-400">
                                        {t.returnToMerchant}
                                    </a>
                                ) : null}
                            </div>
                        )}

                        {isExpired && !isSuccess && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-3">
                                    <XCircle className="w-6 h-6 text-red-400" />
                                </div>
                                <h3 className="text-lg font-bold text-red-400 mb-1">{t.paymentExpired}</h3>
                                <p className="text-sm text-red-500/80">{t.sessionTimedOut}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Security Badge */}
                    <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-500/70" /> {t.securedBy}
                    </div>
                </div>
            </div>
        </div>
    )
}
