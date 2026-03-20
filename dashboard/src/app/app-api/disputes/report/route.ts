import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { intent_id, order_id, transaction_id, customer_email } = body

        if (!intent_id || !transaction_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Verify the intent exists
        const { data: intent, error: intentError } = await supabase
            .from('payment_intents')
            .select('id, client_id, status, amount, currency')
            .eq('id', intent_id)
            .single()

        if (intentError || !intent) {
            return NextResponse.json({ error: 'Payment intent not found or DB error: ' + (intentError?.message || '') }, { status: 404 })
        }

        // Insert dispute record
        const { error: insertError } = await supabase.from('payment_disputes').insert({
            intent_id,
            client_id: intent.client_id,
            order_id: order_id || null,
            transaction_id: transaction_id.trim(),
            customer_email: customer_email || null,
            status: 'pending',
            amount: intent.amount,
            currency: intent.currency,
        })
        
        if (insertError) {
            return NextResponse.json({ error: 'Supabase Insert Error: ' + insertError.message }, { status: 400 })
        }

        return NextResponse.json({ ok: true, message: 'Dispute report submitted successfully' })
    } catch (e: any) {
        // Return 400 so the UI error handler triggers, but not 500 so it doesn't mask anything
        return NextResponse.json({ 
            error: 'Exception hit: ' + (e.message || String(e)),
            envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
            envKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing' 
        }, { status: 400 })
    }
}
