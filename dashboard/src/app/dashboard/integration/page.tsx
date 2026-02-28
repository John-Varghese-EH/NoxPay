'use client'

import { useState, useEffect } from 'react'
import { Check, Copy, Code, ArrowRightLeft, MousePointerClick } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

export default function IntegrationPage() {
    const searchParams = useSearchParams()
    const projectId = searchParams.get('project') || 'YOUR_PROJECT_ID'
    const [activeTab, setActiveTab] = useState<'redirect' | 'iframe' | 'button'>('redirect')
    const [currency, setCurrency] = useState<'UPI' | 'USDT'>('UPI')
    const [copied, setCopied] = useState(false)
    const [origin, setOrigin] = useState('https://your-domain.vercel.app')

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

    const snippets = {
        redirect: `// Next.js Server Action / API Route Example
const response = await fetch('${origin}/api/v1/intents/create-payment', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-client-id': '${projectId}',
        'x-client-secret': 'YOUR_SECRET_KEY'
    },
    body: JSON.stringify({
        amount: 500,
        currency: '${currency}',
        order_id: 'ORDER_' + Date.now()
    })
});
const data = await response.json();
// Redirect user to the payment link
window.location.href = data.checkout_url;`,

        iframe: `<!-- Iframe Integration -->
<iframe 
    src="${origin}/widget?intent=INTENT_ID"
    width="400" 
    height="600" 
    frameborder="0" 
    style="border-radius: 16px; border: 1px solid #1e293b; box-shadow: 0 4px 24px rgba(0,0,0,0.4); max-width: 100%;"
    allow="clipboard-write"
></iframe>`,

        button: `<!-- Beautiful Payment Button -->
<button 
    onclick="startPayment()"
    style="background: #7c3aed; color: #fff; padding: 12px 24px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; box-shadow: 0 0 15px rgba(124,58,237,0.3);"
    onmouseover="this.style.transform='translateY(-2px)'"
    onmouseout="this.style.transform='translateY(0)'"
>
    Pay with NoxPay
</button>

<script>
function startPayment() {
    // Call your backend to get intent_id then redirect/open modal
    window.location.href = '${origin}/checkout?intent=INTENT_ID';
}
</script>`
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Integration Options</h1>
                    <p className="text-sm text-slate-500 mt-1">Seamlessly integrate NoxPay into your flow.</p>
                </div>

                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
                    <button
                        onClick={() => setCurrency('UPI')}
                        className={`text-xs font-medium px-4 py-1.5 rounded-md transition-all ${currency === 'UPI' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        UPI Intent
                    </button>
                    <button
                        onClick={() => setCurrency('USDT')}
                        className={`text-xs font-medium px-4 py-1.5 rounded-md transition-all ${currency === 'USDT' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        USDT Intent
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Tabs */}
                <div className="lg:col-span-1 flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('redirect')}
                        className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${activeTab === 'redirect'
                            ? 'bg-violet-600/10 border border-violet-500/30 text-violet-400'
                            : 'hover:bg-slate-900 border border-transparent text-slate-400'
                            }`}
                    >
                        <ArrowRightLeft className="w-5 h-5" />
                        <div>
                            <div className="font-medium">Redirect Flow</div>
                            <div className="text-xs opacity-70">Standard hosted checkout</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('iframe')}
                        className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${activeTab === 'iframe'
                            ? 'bg-violet-600/10 border border-violet-500/30 text-violet-400'
                            : 'hover:bg-slate-900 border border-transparent text-slate-400'
                            }`}
                    >
                        <Code className="w-5 h-5" />
                        <div>
                            <div className="font-medium">Iframe Snippet</div>
                            <div className="text-xs opacity-70">Embed directly in UI</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('button')}
                        className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${activeTab === 'button'
                            ? 'bg-violet-600/10 border border-violet-500/30 text-violet-400'
                            : 'hover:bg-slate-900 border border-transparent text-slate-400'
                            }`}
                    >
                        <MousePointerClick className="w-5 h-5" />
                        <div>
                            <div className="font-medium">Payment Button</div>
                            <div className="text-xs opacity-70">Ready-to-use button</div>
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
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
                        <div className="p-4 bg-[#0a0a0f] overflow-x-auto text-sm font-mono leading-relaxed">
                            <pre className="text-slate-300">
                                <code>{snippets[activeTab]}</code>
                            </pre>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
