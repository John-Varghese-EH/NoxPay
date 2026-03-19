'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CurrencyCode, CURRENCIES, convertFromINR, formatCurrency } from '@/utils/currency'

interface CurrencyContextType {
    currency: CurrencyCode
    setCurrency: (c: CurrencyCode) => void
    convert: (amountINR: number) => string
    symbol: string
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: 'INR',
    setCurrency: () => {},
    convert: (a) => '₹' + a.toFixed(2),
    symbol: '₹',
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<CurrencyCode>('INR')

    useEffect(() => {
        const saved = localStorage.getItem('noxpay_currency') as CurrencyCode
        if (saved && CURRENCIES[saved]) {
            setCurrencyState(saved)
        }
    }, [])

    const setCurrency = (c: CurrencyCode) => {
        setCurrencyState(c)
        localStorage.setItem('noxpay_currency', c)
    }

    const convert = (amountINR: number) => {
        const converted = convertFromINR(amountINR, currency)
        return formatCurrency(converted, currency)
    }

    const symbol = CURRENCIES[currency]?.symbol || '₹'

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, convert, symbol }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    return useContext(CurrencyContext)
}
