import './globals.css'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import Sidebar from '@/components/Sidebar'
import { CurrencyProvider } from '@/components/CurrencyContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'NoxPay Dashboard',
  description: 'Sovereign SaaS UPI & Crypto Payment Gateway',
}





import Script from 'next/script'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isPublicPage = true // Layout renders for all routes

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans bg-[#0a0a0f] text-slate-50 min-h-screen`}>
        <CurrencyProvider>
        {isLoggedIn ? (
          <div className="dashboard-layout">
            {/* Sidebar */}
            <Sidebar email={user.email || ""} />

            {/* Main content area */}
            <div className="main-content">
              <main className="flex-1 w-full flex flex-col">
                {children}
              </main>
              <footer className="w-full border-t border-slate-800/60 py-6 mt-auto">
                <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center text-center gap-2">
                  <div className="text-xs font-mono text-slate-500">
                    NoxPay - By J0X | <a href="https://github.com/John-Varghese-EH" target="_blank" className="hover:text-slate-300 transition-colors">Github: John-Varghese-EH</a> | <a href="https://instagram.com/cyber__trinity" target="_blank" className="hover:text-slate-300 transition-colors">Instagram: @cyber__trinity</a>
                  </div>
                  <div className="text-[10px] text-slate-600 max-w-md">
                    Disclaimer: J0X (John Varghese) is not responsible for any issues, payment failures, transaction errors, or financial losses incurred while using this software.
                  </div>
                </div>
              </footer>
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-h-screen">
            <nav className="w-full border-b border-slate-800 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
              <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-xl tracking-tighter cursor-pointer text-violet-400">
                  NoxPay<span className="text-slate-500">.</span>
                </Link>
              </div>
            </nav>
            <main className="flex-1 w-full flex flex-col">
              {children}
            </main>
            <footer className="w-full border-t border-slate-800/60 py-8 mt-12 bg-[#0a0a0f]">
              <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center text-center gap-3">
                <div className="text-sm font-mono text-slate-400">
                  NoxPay — By J0X | <a href="https://github.com/John-Varghese-EH" target="_blank" className="hover:text-slate-300 transition-colors">Github: John-Varghese-EH</a> | <a href="https://instagram.com/cyber__trinity" target="_blank" className="hover:text-slate-300 transition-colors">Instagram: @cyber__trinity</a>
                </div>
                <div className="text-xs text-slate-600 max-w-lg leading-relaxed">
                  Disclaimer: J0X (John Varghese) is not responsible for any issues, payment failures, transaction errors, or financial losses incurred while using this software. Use at your own risk.
                </div>
              </div>
            </footer>
          </div>
        )}
        </CurrencyProvider>
        <Script src="/watermark.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
