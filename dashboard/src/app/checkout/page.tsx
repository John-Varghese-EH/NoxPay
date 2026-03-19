import { createClient } from '@/utils/supabase/server'
import CheckoutClient from './CheckoutClient'

// Render a dynamic, branded checkout page
export default async function CheckoutPage(props: { searchParams: Promise<any> }) {
    const searchParams = await props.searchParams;
    const intentId = searchParams.intent

    if (!intentId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
                <div className="glass-card p-8 max-w-md w-full text-center">
                    <h1 className="text-xl font-bold text-white mb-2">Invalid Checkout Link</h1>
                    <p className="text-slate-400 text-sm">No payment intent specified.</p>
                </div>
            </div>
        )
    }

    const supabase = await createClient()

    // Fetch intent details
    const { data: intent } = await supabase
        .from('payment_intents')
        .select(`
            *,
            clients (
                name,
                theme_color,
                logo_url,
                return_url,
                crypto_wallet
            )
        `)
        .eq('id', intentId)
        .single()

    if (!intent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
                <div className="glass-card p-8 max-w-md w-full text-center">
                    <h1 className="text-xl font-bold text-white mb-2">Payment Not Found</h1>
                    <p className="text-slate-400 text-sm">The requested payment session does not exist or has expired.</p>
                </div>
            </div>
        )
    }

    const clientBrand = intent.clients

    return <CheckoutClient intent={intent} clientBrand={clientBrand} />
}
// We need to import lucide icons properly above.
