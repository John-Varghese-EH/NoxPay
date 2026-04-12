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
  const lg = searchParams.get('lg') || ''

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
        <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid Payment Link</h1>
          <p className="text-slate-400 text-sm mb-6">This UPI payment link is missing a VPA (UPI ID). Please use a valid link or create one below.</p>
          <Link
            href="/upi"
            className="inline-flex w-full py-3 items-center justify-center bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm transition-all"
          >
            Create a UPI Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500" style={{ backgroundColor: '#10b9810a', fontFamily: 'var(--font-sans), system-ui, -apple-system, sans-serif' }}>
      
      {/* Nav */}
      <nav className="absolute top-0 w-full border-b border-slate-800/80 bg-slate-950/50 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tighter text-emerald-400 hover:text-emerald-300 transition-colors">
            NoxPay<span className="text-slate-500">.</span>
          </Link>
          <Link href="/upi" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
            Create Link →
          </Link>
        </div>
      </nav>

      <div className="w-full max-w-md flex flex-col mt-20 mb-8">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Header Branding */}
          <div className="p-6 text-center border-b border-slate-800 bg-emerald-500/10">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-slate-900 border border-slate-700 shadow-xl flex items-center justify-center overflow-hidden">
                {lg && lg.startsWith('http') ? (
                   <img src={decodeURIComponent(lg)} alt="Brand Logo" className="w-full h-full object-cover" onError={(e) => { 
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                         e.currentTarget.parentElement.innerHTML = `<span class="text-2xl font-bold text-emerald-400">${pa.charAt(0).toUpperCase()}</span>`;
                      }
                   }} />
                ) : (
                   <span className="text-2xl font-bold text-emerald-400">{pa.charAt(0).toUpperCase()}</span>
                )}
            </div>
            <h2 className="text-lg font-medium text-slate-200">{pa.split('@')[0]}</h2>
            <p className="text-sm text-slate-400 mt-1">Complete your payment</p>
          </div>

          <div className="p-6 flex flex-col gap-6">
            <div className="flex justify-between items-end">
                 <div className="flex flex-col">
                     <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount Due</span>
                     {am && parseFloat(am) > 0 ? (
                         <span className="text-4xl font-bold tracking-tight text-white mb-0 leading-none">
                             ₹{parseFloat(am).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                         </span>
                     ) : (
                         <span className="text-3xl font-bold tracking-tight text-slate-400 mb-0 leading-none flex items-center gap-2">
                             ₹ <span className="text-xl font-normal">Any Amount</span>
                         </span>
                     )}
                 </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col items-center text-center">
                {/* QR Code */}
                <div className="mb-4 p-2 bg-white rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  <QRCodeSVG
                    value={deepLink}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#020617"
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <p className="text-sm text-slate-300 mb-4 w-full">
                    Pay To:
                    <span className="font-mono font-medium text-white break-all mt-1 flex items-center justify-between gap-2 bg-slate-950 py-2 px-3 rounded-lg border border-slate-800 text-left">
                        <span className="truncate">{pa}</span>
                    </span>
                </p>

                {tn && (
                  <div className="w-full text-left space-y-2 mb-4">
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Note</p>
                     <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                        <span className="text-sm text-slate-300">{tn}</span>
                     </div>
                  </div>
                )}

                {/* Mobile Pay App Button */}
                <a
                  id="upi-pay-btn"
                  href={deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Open UPI App
                </a>
            </div>

            {/* Copy / Share actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className={`flex-1 py-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                  copied
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300'
                }`}
              >
                {copied ? 'Link Copied!' : 'Copy Payment Link'}
              </button>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
             <svg className="w-4 h-4 text-emerald-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> 
             Secured by UPI Standards
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────── page ───────────────────── */
export default function UpiPayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-slate-500 animate-pulse text-sm">
        Loading payment...
      </div>
    }>
      <PayPageInner />
    </Suspense>
  )
}
