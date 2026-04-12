'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

/* ───────────────────────── helpers ───────────────────────── */
function isValidVpa(vpa: string): boolean {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(vpa)
}

function buildPayUrl(base: string, vpa: string, amount: string, note: string): string {
  const params = new URLSearchParams()
  params.set('pa', vpa)
  if (amount && parseFloat(amount) > 0) params.set('am', amount)
  if (note.trim()) params.set('tn', note.trim())
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
    if (pVpa) setVpa(pVpa)
    if (pAmount) setAmount(pAmount)
    if (pNote) setNote(pNote)
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

    const url = buildPayUrl(origin, vpa.trim(), amount, note)
    setGeneratedUrl(url)
  }, [vpa, amount, note, origin])

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
    <div className="min-h-screen flex flex-col items-center bg-[#0a0a0f] text-slate-50" style={{ fontFamily: 'var(--font-sans), system-ui, -apple-system, sans-serif' }}>
      {/* Nav */}
      <nav className="w-full border-b border-slate-800 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tighter text-violet-400 hover:text-violet-300 transition-colors">
            NoxPay<span className="text-slate-500">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero header */}
      <header className="w-full max-w-3xl mx-auto px-6 pt-12 pb-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          100% Free · No Sign-up · No Data Stored
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
          UPI Payment
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500"> Link Generator</span>
        </h1>
        <p className="text-md sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          Create shareable UPI payment links & QR codes instantly. Works with Google Pay, PhonePe, Paytm, BHIM & all UPI apps.
        </p>
      </header>

      {/* Main card */}
      <main className="w-full max-w-xl mx-auto px-6 py-8">
        <div
          className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl"
          style={{ boxShadow: '0 0 80px rgba(124, 58, 237, 0.06)' }}
        >
          {/* Top gradient line */}
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500" />

          <div className="p-8">
            {!generatedUrl ? (
              /* ─────── Form ─────── */
              <>
                {/* VPA */}
                <div className="mb-6">
                  <label htmlFor="upi-vpa-input" className="block text-sm font-semibold text-slate-200 mb-2">
                    VPA / UPI ID <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="upi-vpa-input"
                      type="text"
                      placeholder="example@okaxis"
                      className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-base"
                      value={vpa}
                      onChange={(e) => { setVpa(e.target.value); setError('') }}
                      onKeyDown={handleKeyDown}
                      autoComplete="off"
                      spellCheck={false}
                      aria-required="true"
                      aria-describedby="vpa-hint"
                    />
                    <span id="vpa-hint" className="sr-only">Enter your UPI Virtual Payment Address, like name@okaxis or name@ybl</span>
                  </div>
                </div>

                {/* Amount & Note row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="upi-amount-input" className="block text-sm font-semibold text-slate-200 mb-2">
                      Amount <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
                      <input
                        id="upi-amount-input"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3.5 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="upi-note-input" className="block text-sm font-semibold text-slate-200 mb-2">
                      Note <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="upi-note-input"
                      type="text"
                      placeholder="Payment for..."
                      maxLength={50}
                      className="w-full px-4 py-3.5 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-base"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2" role="alert">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                  </div>
                )}

                {/* Generate button */}
                <button
                  id="upi-generate-btn"
                  onClick={generate}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(124,58,237,0.25)] hover:shadow-[0_0_40px_rgba(124,58,237,0.35)] flex items-center justify-center gap-3 text-lg"
                >
                  <LinkIcon />
                  Generate Link
                </button>

                {/* Trust note */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    🔒 Your data is <strong className="text-slate-400">never stored</strong>. Everything is encoded directly in the URL.
                    <br />This is open-source at{' '}
                    <a href="https://github.com/John-Varghese-EH/NoxPay" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
                      GitHub
                    </a>.
                  </p>
                </div>
              </>
            ) : (
              /* ─────── Generated Result ─────── */
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400 mb-4">
                    ✅ Link Generated Successfully
                  </div>
                  <p className="text-sm text-slate-400">Share this link to receive payment via any UPI app</p>
                </div>

                {/* URL display */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-5 break-all">
                  <p className="text-sm text-violet-300 font-mono leading-relaxed select-all">{generatedUrl}</p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(124,58,237,0.15)]">
                    <QRCodeSVG
                      value={generatedUrl}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#0a0a0f"
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                </div>
                <p className="text-center text-xs text-slate-500 mb-6">Scan or share the QR code</p>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    id="upi-copy-btn"
                    onClick={handleCopy}
                    className={`py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      copied
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                        : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-violet-500/20'
                    }`}
                  >
                    <CopyIcon copied={copied} />
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    id="upi-share-btn"
                    onClick={handleShare}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <ShareIcon />
                    Share
                  </button>
                </div>

                {/* Create another */}
                <button
                  id="upi-reset-btn"
                  onClick={reset}
                  className="w-full py-3 text-sm text-slate-400 hover:text-violet-400 transition-colors underline underline-offset-4"
                >
                  ← Create another link
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* SEO-rich FAQ section */}
      <section className="w-full max-w-3xl mx-auto px-6 py-12" aria-label="Frequently Asked Questions">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'What is a UPI payment link?',
              a: 'A UPI payment link is a shareable URL that allows anyone to pay you directly to your UPI ID (VPA). When someone opens the link, it launches their UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.) with pre-filled payment details.',
            },
            {
              q: 'Is this tool free?',
              a: 'Yes, 100% free. No account, no signup, no fees, no catch. Create unlimited UPI payment links & QR codes at zero cost. NoxPay is open-source.',
            },
            {
              q: 'Which UPI apps are supported?',
              a: 'All UPI-enabled apps are supported — Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, MobiKwik, Jupiter, CRED, and any other app that supports the UPI deep link standard.',
            },
            {
              q: 'Is my data stored or saved?',
              a: 'No. NoxPay does not save any data. All information (VPA, amount, note) lives entirely within the URL. When you close the page, nothing is retained. Zero tracking, zero storage.',
            },
            {
              q: 'Can I pre-fill the form via URL parameters?',
              a: 'Yes! You can create pre-filled links using URL parameters. For example: /upi?vpa=name@upi&amount=100&note=Coffee will pre-fill the form with those values.',
            },
          ].map((item, i) => (
            <details
              key={i}
              className="group bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-violet-500/20 transition-colors"
            >
              <summary className="px-6 py-4 cursor-pointer text-slate-200 font-medium hover:text-white transition-colors flex items-center justify-between list-none">
                <span>{item.q}</span>
                <svg className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-6 pb-4 text-sm text-slate-400 leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* How it works — SEO content */}
      <section className="w-full max-w-3xl mx-auto px-6 pb-12" aria-label="How UPI payment links work">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Enter UPI ID', desc: 'Type your VPA / UPI ID (e.g., name@okaxis)' },
            { step: '2', title: 'Set Details', desc: 'Optionally add amount and payment note' },
            { step: '3', title: 'Share Link', desc: 'Copy or share the generated link & QR code' },
          ].map((s) => (
            <div key={s.step} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 text-center">
              <div className="h-10 w-10 bg-violet-500/10 rounded-lg flex items-center justify-center mb-3 border border-violet-500/20 mx-auto">
                <span className="text-violet-400 font-bold">{s.step}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">{s.title}</h3>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/60 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-3">
          <div className="text-sm font-mono text-slate-400">NoxPay — By J0X</div>
          <div className="text-xs text-slate-600 max-w-lg leading-relaxed">
            Disclaimer: J0X (John Varghese) is not responsible for any issues, payment failures, transaction errors, or financial losses incurred while using this software. Use at your own risk.
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
            <Link href="/" className="hover:text-slate-400 transition-colors">Home</Link>
            <span>·</span>
            <a href="https://github.com/John-Varghese-EH/NoxPay" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ────────────────────────── page component ────────────────────────── */
export default function UpiCreatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    }>
      <UPICreatorInner />
    </Suspense>
  )
}
