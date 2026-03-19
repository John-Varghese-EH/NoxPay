import Link from 'next/link'

const DOCS_BASE_URL = 'https://John-Varghese-EH.github.io/NoxPay'

const docSections = [
  {
    title: 'Getting Started',
    description: 'Set up NoxPay from scratch — database, dashboard, API, and worker.',
    href: '/docs/getting-started',
    icon: '🚀',
  },
  {
    title: 'API Reference',
    description: 'Create payment intents, check status, manage webhooks via REST API.',
    href: '/docs/api-reference',
    icon: '📡',
  },
  {
    title: 'Security & Compliance',
    description: 'HMAC signatures, bcrypt hashing, RLS policies, and replay protection.',
    href: '/docs/security-compliance',
    icon: '🔒',
  },
  {
    title: 'Checkout Experience',
    description: 'QR codes, real-time polling, multi-language support, and embeddable widgets.',
    href: '/docs/checkout-experience',
    icon: '💳',
  },
  {
    title: 'Worker — UPI Verification',
    description: 'How the IMAP worker detects and verifies UPI payments from bank emails.',
    href: '/docs/worker-upi',
    icon: '📧',
  },
  {
    title: 'Worker — Crypto Verification',
    description: 'Blockchain polling for USDT (TRC20), Solana, and Polygon transactions.',
    href: '/docs/worker-crypto',
    icon: '⛓️',
  },
  {
    title: 'Webhook Verification',
    description: 'Verify HMAC-SHA256 signatures on incoming webhook payloads.',
    href: '/docs/webhook_verification',
    icon: '🔗',
  },
  {
    title: 'Advanced Configuration',
    description: 'Environment variables, bank alert setup, and production hardening.',
    href: '/docs/advanced-config',
    icon: '⚙️',
  },
  {
    title: 'Troubleshooting',
    description: 'Common issues, debugging tips, and solutions.',
    href: '/docs/troubleshooting',
    icon: '🛠️',
  },
]

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
          Documentation
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Everything you need to deploy, integrate, and customize NoxPay.
        </p>
        <a
          href={DOCS_BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
        >
          Open Full Documentation
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {docSections.map((section) => (
          <a
            key={section.title}
            href={`${DOCS_BASE_URL}${section.href}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-violet-500/50 hover:bg-slate-900/80 transition-all duration-300"
          >
            <div className="text-3xl mb-3">{section.icon}</div>
            <h3 className="text-lg font-semibold text-slate-200 group-hover:text-violet-400 transition-colors mb-2">
              {section.title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {section.description}
            </p>
          </a>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-slate-600">
          Docs are powered by{' '}
          <a href="https://docusaurus.io" target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">
            Docusaurus
          </a>{' '}
          and hosted on GitHub Pages.
        </p>
      </div>
    </div>
  )
}