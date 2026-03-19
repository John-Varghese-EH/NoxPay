import Link from "next/link";

const features = [
  {
    icon: "🔐",
    title: "Zero Trust Architecture",
    description: "Payments verified via direct bank email polling or blockchain RPCs. Your keys, your funds — no third-party ever touches your money.",
    color: "violet",
  },
  {
    icon: "⚡",
    title: "Real-time Webhooks",
    description: "HMAC-SHA256 signed webhooks delivered instantly on payment success. Automatic retries with exponential backoff for guaranteed delivery.",
    color: "blue",
  },
  {
    icon: "🌍",
    title: "Global Crypto Payments",
    description: "Accept USDT (TRC20), Solana, and Polygon payments from anywhere in the world with zero gateway fees and zero chargebacks.",
    color: "emerald",
  },
  {
    icon: "💳",
    title: "Modern Checkout",
    description: "Live QR codes, real-time status polling via WebSockets, countdown timers, multi-language support, and embeddable widgets.",
    color: "amber",
  },
  {
    icon: "🏢",
    title: "Multi-Tenant Ready",
    description: "Row-Level Security isolates merchant data at the Postgres level. Perfect for SaaS platforms and marketplace operators.",
    color: "rose",
  },
  {
    icon: "🛠️",
    title: "100% Open Source",
    description: "MIT licensed. Fork it, modify it, deploy it on your own infrastructure. No vendor lock-in, no surprise pricing changes.",
    color: "cyan",
  },
]

const steps = [
  {
    step: "1",
    title: "Create Payment Intent",
    description: "Your server calls the NoxPay API with amount, currency, and order ID.",
    code: 'POST /api/v1/intents/create-payment',
  },
  {
    step: "2",
    title: "Show QR / Redirect",
    description: "Display the QR code or redirect the customer to the hosted checkout page.",
    code: 'checkout_url → customer',
  },
  {
    step: "3",
    title: "Payment Verified",
    description: "Worker detects the bank email or blockchain transaction and verifies it automatically.",
    code: 'status: "pending" → "settled"',
  },
  {
    step: "4",
    title: "Webhook Delivered",
    description: "Your server receives a signed webhook with the payment confirmation.",
    code: 'POST webhook → payment.success',
  },
]

const comparisons = [
  { feature: "Transaction Fee", noxpay: "0%", razorpay: "2%", stripe: "2.9% + 30¢", paypal: "2.9% + 30¢" },
  { feature: "International Fee", noxpay: "0% (crypto)", razorpay: "3%+", stripe: "4.4%+", paypal: "4.4%+" },
  { feature: "Cards/Net Banking", noxpay: "❌ No", razorpay: "✅ Yes", stripe: "✅ Yes", paypal: "✅ Yes" },
  { feature: "Self-Hosted", noxpay: "✅ Yes", razorpay: "❌ No", stripe: "❌ No", paypal: "❌ No" },
  { feature: "Open Source", noxpay: "✅ MIT", razorpay: "❌ No", stripe: "❌ No", paypal: "❌ No" },
  { feature: "UPI Support", noxpay: "✅ Direct", razorpay: "✅ Via API", stripe: "❌ No", paypal: "❌ No" },
  { feature: "Crypto Support", noxpay: "✅ USDT/SOL", razorpay: "❌ No", stripe: "❌ No", paypal: "❌ No" },
  { feature: "Chargebacks", noxpay: "Zero", razorpay: "Possible", stripe: "Possible", paypal: "Frequent" },
  { feature: "Data Sovereignty", noxpay: "✅ Your DB", razorpay: "❌ Theirs", stripe: "❌ Theirs", paypal: "❌ Theirs" },
]

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-sm text-violet-400 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            Open Source Payment Gateway
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            Sovereign Payments,{" "}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500">
              Zero Fees.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            NoxPay is an open-source, self-hosted payment gateway for modern businesses. Process UPI and Crypto payments directly to your accounts — keep 100% of your revenue.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(124,58,237,0.3)] w-full sm:w-auto text-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium rounded-lg transition-all w-full sm:w-auto text-lg"
            >
              Read the Docs
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold text-white">0%</div>
              <div className="text-xs text-slate-500 mt-1">Transaction Fees</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">&lt;30s</div>
              <div className="text-xs text-slate-500 mt-1">Verification Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-500 mt-1">Self-Hosted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Enterprise-grade payment infrastructure, without the enterprise price tag.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-violet-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2 group-hover:text-violet-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/60">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Four simple steps from payment creation to confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%_-_12px)] w-[calc(100%_-_40px)] h-px bg-gradient-to-r from-violet-500/50 to-transparent z-0"></div>
              )}
              <div className="relative z-10 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="h-10 w-10 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4 border border-violet-500/20">
                  <span className="text-violet-400 font-bold">{step.step}</span>
                </div>
                <h3 className="text-md font-semibold text-slate-200 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{step.description}</p>
                <code className="text-xs text-violet-400 bg-violet-500/10 px-2 py-1 rounded font-mono">
                  {step.code}
                </code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="w-full max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/60">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            NoxPay vs The Rest
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            See why developers are choosing self-hosted over traditional gateways.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Feature</th>
                <th className="text-center py-4 px-4 text-violet-400 font-semibold bg-violet-500/5">NoxPay</th>
                <th className="text-center py-4 px-4 text-slate-400 font-medium">Razorpay</th>
                <th className="text-center py-4 px-4 text-slate-400 font-medium">Stripe</th>
                <th className="text-center py-4 px-4 text-slate-400 font-medium">PayPal</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row) => (
                <tr key={row.feature} className="border-b border-slate-800/50 hover:bg-slate-900/30">
                  <td className="py-3 px-4 text-slate-300">{row.feature}</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-medium bg-violet-500/5">{row.noxpay}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{row.razorpay}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{row.stripe}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{row.paypal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Code Preview */}
      <section className="w-full max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/60">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Integration in Minutes
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A single API call to create a payment. Works with any language.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden max-w-2xl mx-auto">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-800">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
            </div>
            <span className="text-xs text-slate-500 ml-2 font-mono">create-payment.sh</span>
          </div>
          <pre className="p-6 text-sm font-mono overflow-x-auto">
            <code className="text-slate-300">
{`curl -X POST https://your-app.vercel.app/api/v1/intents/create-payment \\
  -H "X-Client-ID: your-client-id" \\
  -H "X-Client-Secret: sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 499.00,
    "currency": "UPI",
    "order_id": "ORDER_001"
  }'`}
            </code>
          </pre>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/60">
        <div className="text-center bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/20 rounded-2xl p-12 sm:p-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Own Your Payments?
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
            Deploy NoxPay in minutes. Keep 100% of your revenue. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(124,58,237,0.3)]"
            >
              Start Building
            </Link>
            <a
              href="https://github.com/John-Varghese-EH/NoxPay"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Star on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}