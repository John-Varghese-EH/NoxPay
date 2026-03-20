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
        const { data: intent } = await supabase
            .from('payment_intents')
            .select('id, client_id, status, amount, currency')
            .eq('id', intent_id)
            .single()

        if (!intent) {
            return NextResponse.json({ error: 'Payment intent not found' }, { status: 404 })
        }

        // Insert dispute record
        await supabase.from('payment_disputes').insert({
            intent_id,
            client_id: intent.client_id,
            order_id: order_id || null,
            transaction_id: transaction_id.trim(),
            customer_email: customer_email || null,
            status: 'pending',
            amount: intent.amount,
            currency: intent.currency,
        })

        return NextResponse.json({ ok: true, message: 'Dispute report submitted successfully' })
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
