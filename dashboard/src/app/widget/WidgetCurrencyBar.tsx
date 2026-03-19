'use client'

import { useCurrency } from '@/components/CurrencyContext'
import CurrencySelector from '@/components/CurrencySelector'

export default function WidgetCurrencyBar({ amountINR }: { amountINR: number }) {
    const { convert, currency } = useCurrency()

    return (
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800/50 bg-slate-950/50">
            <div className="flex items-center gap-2">
                {currency !== 'INR' && (
                    <span className="text-xs text-slate-400">
                        \u2248 <span className="font-medium text-slate-300">{convert(amountINR)}</span>
                    </span>
                )}
            </div>
            <CurrencySelector />
        </div>
    )
}
