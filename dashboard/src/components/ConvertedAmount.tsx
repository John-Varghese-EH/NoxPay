'use client'

import { useCurrency } from './CurrencyContext'

export default function ConvertedAmount({ amountINR, className }: { amountINR: number; className?: string }) {
    const { convert, mounted } = useCurrency()

    // During SSR and before hydration, render a stable INR string that matches server output
    if (!mounted) {
        return (
            <span className={className} suppressHydrationWarning>
                {'\u20b9'}{amountINR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
        )
    }

    return <span className={className}>{convert(amountINR)}</span>
}
