'use client'

import { useState, useRef, useEffect } from 'react'
import { useCurrency } from './CurrencyContext'
import { CURRENCIES, CurrencyCode } from '@/utils/currency'

export default function CurrencySelector() {
    const { currency, setCurrency } = useCurrency()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const curr = CURRENCIES[currency]

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-all"
            >
                <span className="text-sm">{curr.symbol}</span>
                <span>{currency}</span>
                <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-80 overflow-y-auto custom-scrollbar">
                    {Object.entries(CURRENCIES).map(([code, c]) => (
                        <button
                            key={code}
                            onClick={() => { setCurrency(code as CurrencyCode); setOpen(false) }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                                currency === code 
                                    ? 'bg-violet-600/15 text-violet-300'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <span className="text-base w-6 text-center font-medium">{c.symbol}</span>
                            <span className="flex-1">{c.name}</span>
                            <span className="text-xs text-slate-500 font-mono">{code}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
