'use client'

import { useState, useEffect } from 'react'
import { Check, Copy, Code, ArrowRightLeft, MousePointerClick, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

export default function IntegrationPage() {
    const searchParams = useSearchParams()
    const projectId = searchParams.get('project') || 'YOUR_CLIENT_ID'
    const [activeTab, setActiveTab] = useState<'redirect' | 'iframe' | 'button'>('redirect')
    const [currency, setCurrency] = useState<'UPI' | 'USDT'>('UPI')
    const [copied, setCopied] = useState(false)
    const [origin, setOrigin] = useState('https://nox-pay.vercel.app')
    const [showPreview, setShowPreview] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin)
        }
    }, [])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const apiUrl = origin + '/api/v1'

    const snippets = {
        redirect: `// 1. Create a Payment Intent from YOUR backend (Node.js example)
const response = await fetch('${apiUrl}/intents/create-payment', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-client-id': '${projectId}',
        'x-client-secret': 'sk_live_YOUR_SECRET_KEY'
    },
    body: JSON.stringify({
        amount: 500,
        currency: '${currency}',
        order_id: 'ORDER_' + Date.now()
    })
});

const data = await response.json();

// 2. Redirect user to the hosted checkout page
window.location.href = data.checkout_url;

// 3. Listen for payment.success webhook on your server
// POST /your-webhook-endpoint
// Header: X-NoxPay-Signature (HMAC-SHA256)
// Body: { event_type: "payment.success", intent_id, amount, order_id }`,

        iframe: `<!-- Step 1: Create intent via your backend API first -->
<!-- Step 2: Replace INTENT_ID with the actual intent ID -->

<iframe
    src="${origin}/widget?intent=INTENT_ID"
    width="420"
    height="620"
    frameborder="0"
    style="
        border-radius: 16px;
        border: 1px solid #1e293b;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        max-width: 100%;
        background: #0a0a0f;
    "
    allow="clipboard-write"
></iframe>

<!-- The widget auto-updates when payment is verified -->
<!-- Listen for postMessage events for cross-origin status: -->
<script>
window.addEventListener('message', (e) => {
    if (e.data.type === 'noxpay_status') {
        console.log('Payment status:', e.data.status);
    }
});
</script>`,

        button: `<!-- NoxPay Payment Button -->
<button
    id="noxpay-btn"
    onclick="startNoxPayment()"
    style="
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
        color: #fff;
        padding: 14px 28px;
        border-radius: 12px;
        border: none;
        font-weight: 700;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
        display: inline-flex;
        align-items: center;
        gap: 8px;
    "
    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 30px rgba(124,58,237,0.5)'"
    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(124,58,237,0.4)'"
>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v20M2 12h20"/>
    </svg>
    Pay with NoxPay
</button>

<script>
async function startNoxPayment() {
    const btn = document.getElementById('noxpay-btn');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    // Call YOUR backend to create a payment intent
    const res = await fetch('/api/create-noxpay-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 500, currency: '${currency}' })
    });
    const data = await res.json();

    // Option A: Redirect to hosted checkout
    window.location.href = data.checkout_url;

    // Option B: Open in modal/popup
    // window.open(data.checkout_url, '_blank', 'width=440,height=700');
}
</script>`
    }

    const tabConfig = [
        { key: 'redirect' as const, icon: ArrowRightLeft, label: 'Redirect Flow', desc: 'Server-side checkout redirect' },
        { key: 'iframe' as const, icon: Code, label: 'Iframe Widget', desc: 'Embedded inline checkout' },
        { key: 'button' as const, icon: MousePointerClick, label: 'Payment Button', desc: 'Ready-to-use HTML button' },
    ]

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Integration</h1>
                    <p className="text-sm text-slate-500 mt-1">Choose how to accept payments in your app.</p>
                </div>

                <div className="flex gap-2">
                    <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setCurrency('UPI')}
                            className={`text-xs font-medium px-4 py-1.5 rounded-md transition-all ${currency === 'UPI' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            UPI
                        </button>
                        <button
                            onClick={() => setCurrency('USDT')}
                            className={`text-xs font-medium px-4 py-1.5 rounded-md transition-all ${currency === 'USDT' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            USDT
                        </button>
                    </div>
                </div>
            </div>

            {/* Client ID display */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-medium">Your Client ID:</span>
                    <code className="text-sm font-mono text-violet-400">{projectId}</code>
                </div>
                <button
                    onClick={() => copyToClipboard(projectId)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Tabs */}
                <div className="lg:col-span-1 flex flex-col gap-2">
                    {tabConfig.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${activeTab === t.key
                                ? 'bg-violet-600/10 border border-violet-500/30 text-violet-400'
                                : 'hover:bg-slate-900 border border-transparent text-slate-400'
                            }`}
                        >
                            <t.icon className="w-5 h-5" />
                            <div>
                                <div className="font-medium text-sm">{t.label}</div>
                                <div className="text-[11px] opacity-70">{t.desc}</div>
                            </div>
                        </button>
                    ))}

                    {/* Preview toggle for iframe */}
                    {activeTab === 'iframe' && (
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center gap-2 mt-4 p-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-all text-sm"
                        >
                            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showPreview ? 'Hide Preview' : 'Show Live Preview'}
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="glass-card overflow-hidden"
                    >
                        <div className="flex items-center justify-between bg-slate-950/80 px-4 py-3 border-b border-slate-800">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                            </div>
                            <button
                                onClick={() => copyToClipboard(snippets[activeTab])}
                                className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy snippet'}
                            </button>
                        </div>
                        <div className="p-4 bg-[#0a0a0f] overflow-x-auto text-sm font-mono leading-relaxed max-h-[500px] overflow-y-auto">
                            <pre className="text-slate-300 whitespace-pre-wrap">
                                <code>{snippets[activeTab]}</code>
                            </pre>
                        </div>
                    </motion.div>

                    {/* Live Widget Preview */}
                    {activeTab === 'iframe' && showPreview && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-6"
                        >
                            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-violet-400" /> Live Widget Preview
                            </h3>
                            <div className="flex justify-center bg-slate-950 rounded-xl p-8 border border-slate-800">
                                <iframe
                                    src={`${origin}/widget?intent=preview`}
                                    width="400"
                                    height="550"
                                    style={{
                                        borderRadius: '16px',
                                        border: '1px solid #1e293b',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                        maxWidth: '100%',
                                    }}
                                />
                            </div>
                            <p className="text-[11px] text-slate-500 mt-3 text-center">This is a demo preview. In production, replace <code className="text-violet-400">INTENT_ID</code> with a real intent.</p>
                        </motion.div>
                    )}

                    {/* Button preview */}
                    {activeTab === 'button' && (
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-violet-400" /> Button Preview
                            </h3>
                            <div className="flex justify-center bg-slate-950 rounded-xl p-8 border border-slate-800">
                                <button
                                    style={{
                                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                        color: '#fff',
                                        padding: '14px 28px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontWeight: 700,
                                        fontSize: '15px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2v20M2 12h20"/>
                                    </svg>
                                    Pay with NoxPay
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
