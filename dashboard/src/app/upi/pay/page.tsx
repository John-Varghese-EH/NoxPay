'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

/* ───────────────────── build UPI deep link ───────────────────── */
function buildUpiDeepLink(pa: string, am: string, tn: string): string {
  let link = `upi://pay?pa=${encodeURIComponent(pa)}&pn=NoxPay&cu=INR`
  if (am && parseFloat(am) > 0) {
    const formatted = am.includes('.') ? am : `${am}.0`
    link += `&am=${formatted}`
  }
  if (tn && tn.trim()) {
    link += `&tn=${encodeURIComponent(tn.trim())}`
  }
  return link
}

/* ───────────────── inner component (needs search params) ───────────────── */
function PayPageInner() {
  const searchParams = useSearchParams()
  const pa = searchParams.get('pa') || ''
  const am = searchParams.get('am') || ''
  const tn = searchParams.get('tn') || ''

  const [deepLink, setDeepLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [pageUrl, setPageUrl] = useState('')

  useEffect(() => {
    if (pa) {
      setDeepLink(buildUpiDeepLink(pa, am, tn))
      setPageUrl(window.location.href)
    }
  }, [pa, am, tn])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = pageUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }, [pageUrl])

  if (!pa) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] text-slate-50 px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔗</div>
          <h1 className="text-2xl font-bold text-white mb-3">Invalid Payment Link</h1>
          <p className="text-slate-400 mb-8">This UPI payment link is missing a VPA (UPI ID). Please use a valid link or create one below.</p>
          <Link
            href="/upi"
            className="inline-flex px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            Create a UPI Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#0a0a0f] text-slate-50" style={{ fontFamily: 'var(--font-sans), system-ui, -apple-system, sans-serif' }}>
      {/* Nav */}
      <nav className="w-full border-b border-slate-800 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tighter text-violet-400 hover:text-violet-300 transition-colors">
            NoxPay<span className="text-slate-500">.</span>
          </Link>
          <Link href="/upi" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
            Create a Link →
          </Link>
        </div>
      </nav>

      {/* Payment card */}
      <main className="flex-1 flex items-center justify-center w-full px-6 py-12">
        <div className="w-full max-w-md">
          <div
            className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl"
            style={{ boxShadow: '0 0 80px rgba(124, 58, 237, 0.08)' }}
          >
            {/* Top gradient */}
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500" />

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-white mb-1">UPI Payment</h1>
                <p className="text-sm text-slate-400">Scan QR or tap to pay</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="p-5 bg-white rounded-2xl shadow-[0_0_50px_rgba(124,58,237,0.12)]">
                  <QRCodeSVG
                    value={deepLink}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#0a0a0f"
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Desktop notice */}
              <p className="text-center text-xs text-slate-500 mb-6 hidden sm:block">
                📱 Scan this QR code with any UPI app to pay
              </p>

              {/* Payment details */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 mb-6 space-y-3">
                {/* Payee */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Paying to</span>
                  <span className="text-sm text-white font-mono font-semibold">{pa}</span>
                </div>

                {/* Amount */}
                {am && parseFloat(am) > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Amount</span>
                    <span className="text-lg text-emerald-400 font-bold">₹ {parseFloat(am).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {/* Note */}
                {tn && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Note</span>
                    <span className="text-sm text-slate-300">{tn}</span>
                  </div>
                )}
              </div>

              {/* Pay button (mobile deep link) */}
              <a
                id="upi-pay-btn"
                href={deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3 text-lg block text-center"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Open UPI App
              </a>

              {/* Copy link */}
              <button
                id="upi-pay-copy-btn"
                onClick={handleCopy}
                className="w-full mt-3 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy Payment Link
                  </>
                )}
              </button>

              {/* Trust */}
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-600 leading-relaxed">
                  🔒 Secured by NoxPay · No data stored · <a href="https://github.com/John-Varghese-EH/NoxPay" target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:text-violet-400 underline underline-offset-2">Open Source</a>
                </p>
              </div>
            </div>
          </div>

          {/* Create your own CTA */}
          <div className="text-center mt-8">
            <Link href="/upi" className="text-sm text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors">
              Create your own UPI payment link for free →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/60 py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-2">
          <div className="text-xs font-mono text-slate-500">NoxPay — By J0X</div>
        </div>
      </footer>
    </div>
  )
}

/* ───────────────────── page ───────────────────── */
export default function UpiPayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-pulse text-slate-500">Loading payment...</div>
      </div>
    }>
      <PayPageInner />
    </Suspense>
  )
}
