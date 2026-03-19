// Approximate conversion rates from INR (updated periodically)
// In a production app, you'd fetch live rates from an API like exchangerate-api.com
export const CURRENCIES: Record<string, { symbol: string; name: string; rate: number }> = {
    INR: { symbol: '₹', name: 'Indian Rupee', rate: 1 },
    USD: { symbol: '$', name: 'US Dollar', rate: 0.0119 },
    EUR: { symbol: '€', name: 'Euro', rate: 0.0110 },
    GBP: { symbol: '£', name: 'British Pound', rate: 0.0094 },
    AED: { symbol: 'د.إ', name: 'UAE Dirham', rate: 0.0437 },
    SGD: { symbol: 'S$', name: 'Singapore Dollar', rate: 0.0159 },
    JPY: { symbol: '¥', name: 'Japanese Yen', rate: 1.78 },
    THB: { symbol: '฿', name: 'Thai Baht', rate: 0.406 },
    MYR: { symbol: 'RM', name: 'Malaysian Ringgit', rate: 0.0527 },
    QAR: { symbol: 'QR', name: 'Qatari Riyal', rate: 0.0433 },
    OMR: { symbol: 'ر.ع.', name: 'Omani Rial', rate: 0.00458 },
    LKR: { symbol: 'Rs', name: 'Sri Lankan Rupee', rate: 3.53 },
    NPR: { symbol: 'रू', name: 'Nepalese Rupee', rate: 1.60 },
    BTN: { symbol: 'Nu.', name: 'Bhutanese Ngultrum', rate: 1.0 },
    MUR: { symbol: '₨', name: 'Mauritian Rupee', rate: 0.544 },
}

export type CurrencyCode = keyof typeof CURRENCIES

export function convertFromINR(amountINR: number, targetCurrency: CurrencyCode): number {
    const rate = CURRENCIES[targetCurrency]?.rate ?? 1
    return amountINR * rate
}

export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
    const curr = CURRENCIES[currencyCode]
    if (!curr) return amount.toFixed(2)
    
    // Use appropriate locale formatting
    if (currencyCode === 'JPY') {
        return curr.symbol + Math.round(amount).toLocaleString()
    }
    return curr.symbol + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
