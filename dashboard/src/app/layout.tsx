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
        <Script src="/branding.js" strategy="afterInteractive" />
        <Script id="fallback-branding" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `const _0xabc = "KGZ1bmN0aW9uKCl7CiAgZnVuY3Rpb24gaSgpewogICAgaWYoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2oweC13bScpKXJldHVybjsKICAgIHZhciBhPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOwogICAgYS5pZD0najB4LXdtJzsKICAgIGEuaW5uZXJIVE1MPSc8YSBocmVmPSJodHRwczovL2dpdGh1Yi5jb20vSm9obi1WYXJnaGVzZS1FSCIgdGFyZ2V0PSJfYmxhbmsiIHN0eWxlPSJjb2xvcjpyZ2JhKDI1NSwyNTUsMjU1LDAuMyk7dGV4dC1kZWNvcmF0aW9uOm5vbmU7IiB0aXRsZT0iTWFkZSBieSBKMFgiPkowWDwvYT4nOwogICAgYS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywncG9zaXRpb246Zml4ZWQhaW1wb3J0YW50O2JvdHRvbTo1cHghaW1wb3J0YW50O3JpZ2h0OjVweCFpbXBvcnRhbnQ7ei1pbmRleDoyMTQ3NDgzNjQ3IWltcG9ydGFudDtmb250LWZhbWlseTptb25vc3BhY2UhaW1wb3J0YW50O2ZvbnQtc2l6ZToxMHB4IWltcG9ydGFudDt0ZXh0LWRlY29yYXRpb246bm9uZSFpbXBvcnRhbnQ7cG9pbnRlci1ldmVudHM6YXV0byFpbXBvcnRhbnQ7ZGlzcGxheTpibG9jayFpbXBvcnRhbnQ7dmlzaWJpbGl0eTp2aXNpYmxlIWltcG9ydGFudDtvcGFjaXR5OjEhaW1wb3J0YW50O3RyYW5zZm9ybTpub25lIWltcG9ydGFudDsnKTsKICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSkKICB9CiAgZG9jdW1lbnQucmVhZHlTdGF0ZT09PSdsb2FkaW5nJz9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJyxpKTppKCk7CiAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24obSl7CiAgICB2YXIgZT1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnajB4LXdtJyk7CiAgICBpZighZSlpKCk7CiAgICBlbHNlewogICAgICB2YXIgcz13aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlKTsKICAgICAgaWYocy5kaXNwbGF5PT09J25vbmUnfHxzLnZpc2liaWxpdHk9PT0naGlkZGVuJ3x8cy5vcGFjaXR5PT09JzAnfHxzLnRyYW5zZm9ybSE9PSdub25lJyl7CiAgICAgICAgZS5zdHlsZS5zZXRQcm9wZXJ0eSgnZGlzcGxheScsJ2Jsb2NrJywnaW1wb3J0YW50Jyk7CiAgICAgICAgZS5zdHlsZS5zZXRQcm9wZXJ0eSgndmlzaWJpbGl0eScsJ3Zpc2libGUnLCdpbXBvcnRhbnQnKTsKICAgICAgICBlLnN0eWxlLnNldFByb3BlcnR5KCdvcGFjaXR5JywnMScsJ2ltcG9ydGFudCcpOwogICAgICAgIGUuc3R5bGUuc2V0UHJvcGVydHkoJ3RyYW5zZm9ybScsJ25vbmUnLCdpbXBvcnRhbnQnKQogICAgICB9CiAgICB9CiAgfSkub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQse2NoaWxkTGlzdDp0cnVlLHN1YnRyZWU6dHJ1ZSxhdHRyaWJ1dGVzOnRydWUsYXR0cmlidXRlRmlsdGVyOlsnc3R5bGUnLCdjbGFzcyddfSk7CgogIGNvbnNvbGUubG9nKCIlYyBNYWRlIHdpdGgg4p2k77iPIGJ5IEowWCBcbiBHaXRodWI6IEpvaG4tVmFyZ2hlc2UtRUggXG4gSW5zdGFncmFtOiBAY3liZXJfX3RyaW5pdHkgIiwgImJhY2tncm91bmQ6IzAyMDYxNztjb2xvcjojYTc4YmZhO2ZvbnQtc2l6ZToxNHB4O3BhZGRpbmc6MjBweDtib3JkZXItcmFkaXVzOjEwcHg7Zm9udC1mYW1pbHk6bW9ub3NwYWNlO2JvcmRlcjoxcHggc29saWQgIzdjM2FlZDtib3gtc2hhZG93OjAgMCAyMHB4IHJnYmEoMTI0LDU4LDIzNywwLjMpOyIpOwp9KSgpOw==";\neval(decodeURIComponent(escape(atob(_0xabc))));`
        }} />
      </body>
    </html>
  )
}
