'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CurrencyCode, CURRENCIES, convertFromINR, formatCurrency } from '@/utils/currency'

interface CurrencyContextType {
    currency: CurrencyCode
    setCurrency: (c: CurrencyCode) => void
    convert: (amountINR: number) => string
    symbol: string
    mounted: boolean
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: 'INR',
    setCurrency: () => {},
    convert: (a) => '\u20b9' + a.toFixed(2),
    symbol: '\u20b9',
    mounted: false,
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<CurrencyCode>('INR')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('noxpay_currency') as CurrencyCode
        if (saved && CURRENCIES[saved]) {
            setCurrencyState(saved)
        }
        setMounted(true)
    }, [])

    const setCurrency = (c: CurrencyCode) => {
        setCurrencyState(c)
        localStorage.setItem('noxpay_currency', c)
    }

    const convert = (amountINR: number) => {
        const converted = convertFromINR(amountINR, currency)
        return formatCurrency(converted, currency)
    }

    const symbol = CURRENCIES[currency]?.symbol || '\u20b9'

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, convert, symbol, mounted }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    return useContext(CurrencyContext)
}
