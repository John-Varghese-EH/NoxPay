'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

/* ───────────────────────── helpers ───────────────────────── */
function isValidVpa(vpa: string): boolean {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(vpa)
}

function buildPayUrl(base: string, vpa: string, amount: string, note: string, logo: string): string {
  const params = new URLSearchParams()
  params.set('pa', vpa)
  if (amount && parseFloat(amount) > 0) params.set('am', amount)
  if (note.trim()) params.set('tn', note.trim())
  if (logo.trim()) params.set('lg', logo.trim())
  return `${base}/upi/pay?${params.toString()}`
}

/* ─────────────────── icons (inline svg) ─────────────────── */
function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )
  }
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
      <path strokeLinecap="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
    </svg>
  )
}

/* ────────────────────────── inner component ────────────────────────── */
function UPICreatorInner() {
  const searchParams = useSearchParams()

  const [vpa, setVpa] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [logo, setLogo] = useState('')
  const [error, setError] = useState('')
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  // Pre-fill from URL params
  useEffect(() => {
    setOrigin(window.location.origin)
    const pVpa = searchParams.get('vpa') || searchParams.get('pa') || ''
    const pAmount = searchParams.get('amount') || searchParams.get('am') || ''
    const pNote = searchParams.get('note') || searchParams.get('tn') || ''
    const pLogo = searchParams.get('logo') || searchParams.get('lg') || ''
    if (pVpa) setVpa(pVpa)
    if (pAmount) setAmount(pAmount)
    if (pNote) setNote(pNote)
    if (pLogo) setLogo(decodeURIComponent(pLogo))
  }, [searchParams])

  const generate = useCallback(() => {
    setError('')
    setCopied(false)
    setGeneratedUrl('')

    if (!vpa.trim()) {
      setError('Please enter your UPI ID')
      return
    }
    if (!isValidVpa(vpa.trim())) {
      setError('Invalid UPI ID format. Example: name@okaxis')
      return
    }
    if (amount && (isNaN(parseFloat(amount)) || parseFloat(amount) < 0)) {
      setError('Please enter a valid amount')
      return
    }
    if (logo && !logo.startsWith('http')) {
      setError('Logo URL must start with http:// or https://')
      return
    }

    const url = buildPayUrl(origin, vpa.trim(), amount, note, logo)
    setGeneratedUrl(url)
  }, [vpa, amount, note, logo, origin])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = generatedUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }, [generatedUrl])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'UPI Payment Link',
          text: `Pay via UPI${amount ? ` ₹${amount}` : ''}${note ? ` — ${note}` : ''}`,
          url: generatedUrl,
        })
      } catch {
        // user cancelled
      }
    }
  }, [generatedUrl, amount, note])

  const reset = useCallback(() => {
    setGeneratedUrl('')
    setCopied(false)
    setError('')
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') generate()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500" style={{ backgroundColor: '#7c3aed0a', fontFamily: 'var(--font-sans), system-ui, -apple-system, sans-serif' }}>
      
      {/* Nav */}
      <nav className="absolute top-0 w-full border-b border-slate-800/80 bg-slate-950/50 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tighter text-violet-400 hover:text-violet-300 transition-colors">
            NoxPay<span className="text-slate-500">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              ← Back
            </Link>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-md flex flex-col mt-20 mb-8">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Header Branding */}
          <div className="p-6 text-center border-b border-slate-800 bg-violet-500/10">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center border border-violet-500 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                <div className="text-white"><LinkIcon /></div>
            </div>
            <h2 className="text-lg font-medium text-slate-200">UPI Link Generator</h2>
            <p className="text-sm text-slate-400 mt-1">Create free shareable payment links</p>
          </div>

          <div className="p-6 flex flex-col gap-6">
            {!generatedUrl ? (
              /* ─────── Form ─────── */
              <>
                <div className="space-y-4">
                  {/* VPA */}
                  <div>
                    <label htmlFor="upi-vpa-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                       VPA / UPI ID <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="upi-vpa-input"
                        type="text"
                        placeholder="example@okaxis"
                        className="w-full px-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all text-sm font-mono"
                        value={vpa}
                        onChange={(e) => { setVpa(e.target.value); setError('') }}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  {/* Amount & Note row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="upi-amount-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                         Amount <span className="font-normal">(Opt)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">₹</span>
                        <input
                          id="upi-amount-input"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="upi-note-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                         Note <span className="font-normal">(Opt)</span>
                      </label>
                      <input
                        id="upi-note-input"
                        type="text"
                        placeholder="e.g. dinner"
                        maxLength={50}
                        className="w-full px-3 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all text-sm"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  </div>

                  {/* Logo URL */}
                  <div>
                    <label htmlFor="upi-logo-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                       Brand Logo URL <span className="font-normal">(Opt)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded overflow-hidden">
                        {logo && logo.startsWith('http') ? (
                          <img src={logo} alt="Logo" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        ) : (
                          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        )}
                      </div>
                      <input
                        id="upi-logo-input"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        className="w-full pl-10 pr-3 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all text-sm"
                        value={logo}
                        onChange={(e) => setLogo(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                  </div>
                )}

                {/* Generate button */}
                <button
                  id="upi-generate-btn"
                  onClick={generate}
                  className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] flex items-center justify-center gap-2"
                >
                  <LinkIcon />
                  Generate Payment Link
                </button>
              </>
            ) : (
              /* ─────── Generated Result ─────── */
              <div className="flex flex-col items-center bg-slate-900 rounded-xl p-5 border border-slate-800 animate-in fade-in duration-300">
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 mb-4 font-medium flex items-center gap-1.5">
                  ✅ Successfully Generated
                </div>

                {/* QR Code */}
                <div className="p-3 bg-white rounded-xl mb-4 shadow-[0_0_30px_rgba(124,58,237,0.15)]">
                  <QRCodeSVG
                    value={generatedUrl}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#020617"
                    level="L"
                    includeMargin={false}
                  />
                </div>

                {/* URL display */}
                <div className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 mb-4 flex items-center justify-between gap-2 overflow-hidden">
                   <p className="text-xs text-slate-300 font-mono truncate">{generatedUrl}</p>
                </div>

                {/* Action buttons */}
                <div className="w-full grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={handleCopy}
                    className={`py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                      copied
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                        : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-violet-500/20'
                    }`}
                  >
                    <CopyIcon copied={copied} />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <ShareIcon />
                    Share
                  </button>
                </div>

                <button
                  onClick={reset}
                  className="text-xs text-slate-500 hover:text-white transition-colors underline underline-offset-4"
                >
                  Create another link
                </button>
              </div>
            )}
          </div>

          {/* Footer Security Badge inside card */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col items-center justify-center gap-1 text-xs text-slate-500 font-medium">
             <div className="flex items-center gap-2">
                 <svg className="w-4 h-4 text-emerald-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> Secured by URL Encoding
             </div>
             <p className="font-normal text-[10px] mt-1 text-slate-600">Zero data stored. Client-side only.</p>
          </div>
        </div>

        {/* FAQ - outside card but styled similarly */}
        <div className="mt-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 px-2 uppercase tracking-widest mb-3">Frequently Asked Questions</h3>
          {[
            {
              q: 'What is a UPI payment link?',
              a: 'A shareable URL that allows anyone to pay you directly to your UPI ID (VPA). It opens their favorite UPI app automatically.',
            },
            {
              q: 'Is this tool free?',
              a: 'Yes, 100% free. No account, no signup, no fees.',
            },
            {
              q: 'Is my data stored?',
              a: 'No. NoxPay does not save any data anywhere for this tool. All info lives entirely within the URL parameters.',
            }
          ].map((item, i) => (
            <details
              key={i}
              className="group bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden hover:border-violet-500/30 transition-colors shadow-lg"
            >
              <summary className="px-5 py-4 cursor-pointer text-sm text-slate-200 font-medium hover:text-white transition-colors flex items-center justify-between list-none focus:outline-none">
                <span>{item.q}</span>
                <svg className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3 mx-2">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────── page component ────────────────────────── */
export default function UpiCreatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-slate-500 animate-pulse text-sm">
        Loading Generator...
      </div>
    }>
      <UPICreatorInner />
    </Suspense>
  )
}
