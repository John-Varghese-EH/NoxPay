import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-6 text-center">
      <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6">
          Sovereign Payments, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-blue-500">
            Uncompromised.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          NoxPay is an open-source, self-hosted payment gateway for modern SaaS. Process UPI and Crypto directly to your own accounts with zero third-party fees.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Link
            href="/login"
            className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.3)] w-full sm:w-auto"
          >
            Access Dashboard
          </Link>
          <a
            href="https://github.com/John-Varghese-EH"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium rounded-lg transition-all w-full sm:w-auto"
          >
            View on GitHub
          </a>
        </div>

        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left border-t border-slate-800/60 pt-16">
          <div>
            <div className="h-12 w-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4 border border-violet-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Zero Trust Architecture</h3>
            <p className="text-sm text-slate-500">Payments are confirmed via direct email polling or blockchain RPCs. Your keys, your funds.</p>
          </div>
          <div>
            <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 border border-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Real-time Webhooks</h3>
            <p className="text-sm text-slate-500">Instant HMAC-SHA256 authenticated webhooks delivered directly to your backend on payment success.</p>
          </div>
          <div>
            <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Multi-Tenant Identity</h3>
            <p className="text-sm text-slate-500">Row-Level Security isolates data across merchants, making it ideal for SaaS and marketplace operators.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
