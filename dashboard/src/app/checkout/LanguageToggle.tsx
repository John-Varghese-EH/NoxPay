'use client'

import { useState, useRef, useEffect } from 'react'
import { Language } from './CheckoutTranslations'

const LANGUAGES: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'EN', native: 'English' },
    { code: 'hi', label: 'HI', native: '\u0939\u093f\u0902\u0926\u0940' },
    { code: 'ml', label: 'ML', native: '\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02' },
    { code: 'ta', label: 'TA', native: '\u0ba4\u0bae\u0bbf\u0bb4\u0bcd' },
    { code: 'kn', label: 'KN', native: '\u0c95\u0ca8\u0ccd\u0ca8\u0ca1' },
    { code: 'te', label: 'TE', native: '\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41' },
    { code: 'ar', label: 'AR', native: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' },
    { code: 'ja', label: 'JA', native: '\u65e5\u672c\u8a9e' },
    { code: 'th', label: 'TH', native: '\u0e44\u0e17\u0e22' },
    { code: 'fr', label: 'FR', native: 'Fran\u00e7ais' },
    { code: 'ne', label: 'NE', native: '\u0928\u0947\u092a\u093e\u0932\u0940' },
    { code: 'ms', label: 'MS', native: 'Melayu' },
]

interface LanguageToggleProps {
    currentLang: Language
    onChange: (lang: Language) => void
}

export default function LanguageToggle({ currentLang, onChange }: LanguageToggleProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const current = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0]

    return (
        <div ref={ref} className="relative self-start mb-2">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 bg-slate-900/50 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-all"
            >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M9 3v2m6-2v2M3 12h7m4 0h7M5 19h4m6 0h4M9 12v7m6-7v7" /></svg>
                {current.native}
                <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-1 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => { onChange(lang.code); setOpen(false) }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                                currentLang === lang.code
                                    ? 'bg-violet-600/15 text-violet-300'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <span className="text-[10px] font-bold text-slate-500 w-5">{lang.label}</span>
                            <span>{lang.native}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
