'use client'

import { useCurrency } from '@/components/CurrencyContext'
import CurrencySelector from '@/components/CurrencySelector'

export default function WidgetCurrencyBar({ amountINR }: { amountINR: number }) {
    const { convert, currency } = useCurrency()

    if (currency === 'INR') {
        return (
            <div className="flex items-center justify-end px-4 py-2 border-t border-slate-800/50 bg-slate-950/50">
                <CurrencySelector />
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-800/50 bg-slate-950/50">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{convert(amountINR)}</span>
                <span className="text-[10px] text-slate-500">\u20b9{amountINR.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR</span>
            </div>
            <CurrencySelector />
        </div>
    )
}
