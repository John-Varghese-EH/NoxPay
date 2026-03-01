'use client'

import { Language } from './CheckoutTranslations'

interface LanguageToggleProps {
    currentLang: Language
    onChange: (lang: Language) => void
}

export default function LanguageToggle({ currentLang, onChange }: LanguageToggleProps) {
    return (
        <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/5 self-end mb-2">
            <button
                onClick={() => onChange('en')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${currentLang === 'en'
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => onChange('hi')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${currentLang === 'hi'
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
            >
                हिंदी
            </button>
        </div>
    )
}
