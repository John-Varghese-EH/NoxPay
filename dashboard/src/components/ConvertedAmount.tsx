'use client'

import { useCurrency } from './CurrencyContext'

export default function ConvertedAmount({ amountINR, className }: { amountINR: number; className?: string }) {
    const { convert } = useCurrency()
    return <span className={className}>{convert(amountINR)}</span>
}
