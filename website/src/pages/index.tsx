import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

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
  const {siteConfig} = useDocusaurusContext();
  
  return (
    <Layout
      title={`${siteConfig.title} - Sovereign Payment Gateway`}
      description="Accept UPI and Crypto payments with zero fees and full sovereignty. Self-hosted, secure, and robust.">
      
      <main className="flex flex-col items-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
        {/* Hero Section */}
        <section className="w-full max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-full text-sm text-violet-700 dark:text-violet-400 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              Open Source Payment Gateway
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight" style={{lineHeight: 1.1, margin: '1.5rem 0'}}>
              Sovereign Payments,{" "}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 dark:from-violet-500 dark:via-blue-500 dark:to-emerald-500">
                Zero Fees.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              NoxPay is an open-source, self-hosted payment gateway for modern businesses. Process UPI and Crypto payments directly to your accounts — keep 100% of your revenue.
            </p>

            <div className="flex justify-center items-center mt-10">
              <Link
                to="/docs/introduction"
                className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white hover:text-white hover:no-underline font-medium rounded-lg transition-all transform hover:scale-105 shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.23)] w-full sm:w-auto text-lg"
              >
                Read the Docs
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-0" style={{marginBottom: 0}}>0%</div>
                <div className="text-xs text-slate-500 mt-1">Transaction Fees</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-0" style={{marginBottom: 0}}>&lt;30s</div>
                <div className="text-xs text-slate-500 mt-1">Verification Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-0" style={{marginBottom: 0}}>100%</div>
                <div className="text-xs text-slate-500 mt-1">Self-Hosted</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 mt-0" style={{marginTop: 0}}>
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Enterprise-grade payment infrastructure, without the enterprise price tag.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] text-left"
              >
                <div className="text-4xl mb-4" style={{fontSize: '2.25rem', marginBottom: '1rem'}}>{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200 mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mt-0">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-500 leading-relaxed mb-0">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* UPI Link Generator Promo */}
        <section className="w-full max-w-6xl mx-auto px-6 py-12">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-gradient-to-br from-white dark:from-slate-900 via-emerald-50/30 dark:via-slate-900 to-emerald-100/50 dark:to-emerald-950/30" style={{textDecoration: 'none'}}>
            <div className="flex flex-col lg:flex-row items-center gap-8 p-8 sm:p-12 text-left">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full text-xs text-emerald-700 dark:text-emerald-400 mb-4 font-medium">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  FREE TOOL — No Account Required
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 mt-0" style={{marginTop: 0}}>
                  🔗 UPI Payment Link Generator
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
                  Create shareable UPI payment links & QR codes instantly. Works with Google Pay, PhonePe, Paytm, BHIM & all UPI apps. No signup, no fees.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <a
                    href="https://nox-pay.vercel.app/upi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white hover:no-underline font-semibold rounded-lg transition-all transform hover:scale-105 shadow-[0_4px_14px_0_rgba(16,185,129,0.3)] text-center inline-block"
                  >
                    Create Free Link →
                  </a>
                </div>
              </div>
              <div className="flex-shrink-0 grid grid-cols-2 gap-2 text-xs">
                {['✅ 100% Free', '🔒 Zero Data Stored', '📱 All UPI Apps', '📋 QR Code Output'].map((pill) => (
                  <div key={pill} className="px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-700 dark:text-slate-300 text-center whitespace-nowrap">
                    {pill}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full max-w-6xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-800/60">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 mt-0" style={{marginTop: 0}}>
              How It Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Four simple steps from payment creation to confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-left">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%_-_12px)] w-[calc(100%_-_40px)] h-px bg-gradient-to-r from-violet-200 dark:from-violet-500/50 to-transparent z-0"></div>
                )}
                <div className="relative z-10 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
                  <div className="h-10 w-10 bg-violet-100 dark:bg-violet-500/10 rounded-lg flex items-center justify-center mb-4 border border-violet-200 dark:border-violet-500/20">
                    <span className="text-violet-600 dark:text-violet-400 font-bold">{step.step}</span>
                  </div>
                  <h3 className="text-md font-semibold text-slate-900 dark:text-slate-200 mb-2 mt-0">{step.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-500 mb-3">{step.description}</p>
                  <code className="text-xs text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-1 rounded font-mono border-none whitespace-nowrap overflow-hidden text-ellipsis inline-block max-w-full">
                    {step.code}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="w-full mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-800/60 overflow-hidden flex flex-col items-center">
          <div className="text-center mb-16 max-w-6xl w-full">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 mt-0" style={{marginTop: 0}}>
              NoxPay vs The Rest
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              See why developers are choosing self-hosted over traditional gateways.
            </p>
          </div>

          <div className="w-full max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full text-sm m-0 border-collapse table-auto text-left" style={{borderSpacing: 0, margin: '0 auto', border: 'none'}}>
              <thead>
                <tr className="border-[0px] border-b border-solid border-slate-200 dark:border-slate-800 bg-transparent">
                  <th className="text-left py-4 px-4 text-slate-600 dark:text-slate-400 font-medium bg-transparent border-none">Feature</th>
                  <th className="text-center py-4 px-4 text-violet-600 dark:text-violet-400 font-semibold bg-violet-50 dark:bg-violet-500/5 border-none">NoxPay</th>
                  <th className="text-center py-4 px-4 text-slate-600 dark:text-slate-400 font-medium bg-transparent border-none">Razorpay</th>
                  <th className="text-center py-4 px-4 text-slate-600 dark:text-slate-400 font-medium bg-transparent border-none">Stripe</th>
                  <th className="text-center py-4 px-4 text-slate-600 dark:text-slate-400 font-medium bg-transparent border-none">PayPal</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr key={row.feature} className="border-[0px] border-b border-solid border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 bg-transparent transition-colors">
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 border-none font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-emerald-600 dark:text-emerald-400 font-medium bg-violet-50 dark:bg-violet-500/5 border-none">{row.noxpay}</td>
                    <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400 border-none">{row.razorpay}</td>
                    <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400 border-none">{row.stripe}</td>
                    <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400 border-none">{row.paypal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Code Preview */}
        <section className="w-full max-w-6xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-800/60">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 mt-0" style={{marginTop: 0}}>
              Integration in Minutes
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A single API call to create a payment. Works with any language.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden max-w-2xl mx-auto text-left shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
              </div>
              <span className="text-xs text-slate-400 ml-2 font-mono">create-payment.sh</span>
            </div>
            <pre className="p-6 text-sm font-mono overflow-x-auto bg-transparent border-none m-0 rounded-none shadow-none" style={{backgroundColor: 'transparent'}}>
              <code className="text-slate-300 font-mono shadow-none border-none p-0 bg-transparent">
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
        <section className="w-full max-w-6xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-800/60 mb-10">
          <div className="text-center bg-gradient-to-b from-violet-50 dark:from-violet-500/10 to-transparent border border-violet-100 dark:border-violet-500/20 rounded-2xl p-12 sm:p-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 mt-0" style={{marginTop: 0}}>
              Ready to Own Your Payments?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8">
              Deploy NoxPay in minutes. Keep 100% of your revenue. No credit card required.
            </p>
            <div className="flex justify-center mt-6">
              <Link
                to="/docs/introduction"
                className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white hover:text-white hover:no-underline font-medium rounded-lg transition-all transform hover:scale-105 shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.23)] w-full sm:w-auto text-lg"
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}