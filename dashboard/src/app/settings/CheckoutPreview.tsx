'use client'

import { useState } from 'react'
import { ShieldCheck, Clock } from 'lucide-react'

export default function CheckoutPreview({ initialColor, initialLogo, initialName }: { initialColor: string, initialLogo: string, initialName: string }) {
    const [themeColor, setThemeColor] = useState(initialColor)
    const [logoUrl, setLogoUrl] = useState(initialLogo)

    const colorPresets = [
        { name: 'Nox Purple', hex: '#7c3aed' },
        { name: 'Emerald', hex: '#10b981' },
        { name: 'Sky Blue', hex: '#0ea5e9' },
        { name: 'Rose', hex: '#e11d48' },
        { name: 'Amber', hex: '#f59e0b' },
        { name: 'Midnight', hex: '#0f172a' }
    ]

    return (
        <div className="flex flex-col xl:flex-row gap-8">
            {/* Branding Form */}
            <div className="flex-1 max-w-xl">
                <form className="flex flex-col gap-5">
                    <div>
                        <label className="text-sm font-medium text-slate-400 block mb-2">Theme Color (Hex)</label>
                        <div className="flex gap-3">
                            <input
                                type="color"
                                name="theme_color_picker"
                                value={themeColor}
                                className="w-10 h-10 rounded border-none bg-transparent cursor-pointer"
                                onChange={(e) => {
                                    setThemeColor(e.target.value)
                                }}
                            />
                            <input
                                type="text"
                                name="theme_color"
                                value={themeColor}
                                onChange={(e) => setThemeColor(e.target.value)}
                                placeholder="#7c3aed"
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500 font-mono"
                            />
                        </div>

                        {/* Presets */}
                        <div className="flex gap-2 mt-3 flex-wrap">
                            {colorPresets.map(preset => (
                                <button
                                    key={preset.hex}
                                    type="button"
                                    onClick={() => setThemeColor(preset.hex)}
                                    className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-transform hover:scale-110 ${themeColor === preset.hex ? 'border-white scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: preset.hex }}
                                    title={preset.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-400 block mb-2">Brand Logo URL</label>
                        <input
                            type="url"
                            name="logo_url"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://yourbrand.com/logo.png"
                            className="w-full bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-200 focus:ring-violet-500 focus:border-violet-500"
                        />
                    </div>
                </form>
            </div>

            {/* Live Preview Pane */}
            <div className="flex-1 min-w-[320px] max-w-sm ml-auto bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
                <div className="absolute top-2 right-3 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded-full backdrop-blur-sm">Live Preview</span>
                </div>

                {/* Header Branding */}
                <div className="p-5 text-center border-b border-slate-800 transition-colors duration-300" style={{ backgroundColor: `${themeColor}15` }}>
                    {logoUrl ? (
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl overflow-hidden bg-white/5 p-1 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logoUrl} alt={initialName} className="max-w-full max-h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                    ) : (
                        <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700">
                            <span className="text-lg font-bold text-white">{initialName?.charAt(0) || 'M'}</span>
                        </div>
                    )}
                    <h2 className="text-base font-medium text-slate-200">{initialName || 'Merchant Name'}</h2>
                    <p className="text-xs text-slate-400 mt-1">Complete your payment securely.</p>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Amount Due</span>
                            <span className="text-3xl font-bold tracking-tight text-white leading-none">
                                ₹500.00
                            </span>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col items-center text-center">
                        <div className="mb-4 bg-white p-2 rounded-xl inline-block opacity-50 grayscale transition-all duration-300">
                            <div className="w-32 h-32 bg-slate-200/50 rounded flex items-center justify-center">
                                <span className="text-xs text-slate-400 font-mono">QR Code</span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-300 mb-4 w-full">
                            Pay to UPI ID:
                            <span className="font-mono font-medium text-white text-xs mt-1 block bg-slate-950 py-2 px-3 rounded-lg border border-slate-800">
                                merchant@bank
                            </span>
                        </p>

                        <button
                            type="button"
                            className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-white transition-all duration-300"
                            style={{ backgroundColor: themeColor }}
                        >
                            Open UPI App
                        </button>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-4 font-medium uppercase tracking-wide">
                            <Clock className="w-3 h-3" /> Awaiting confirmation
                        </div>
                    </div>
                </div>

                {/* Footer Security Badge */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" /> Secured by NoxPay
                </div>
            </div>

            {/* Hidden inputs to capture state for form submission */}
            <input type="hidden" name="theme_color" value={themeColor} />
            <input type="hidden" name="logo_url" value={logoUrl} />
        </div>
    )
}
