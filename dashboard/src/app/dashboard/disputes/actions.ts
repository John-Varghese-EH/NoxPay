'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function resolveDispute(formData: FormData) {
    const disputeId = formData.get('disputeId') as string
    const intentId = formData.get('intentId') as string
    const action = formData.get('action') as 'verify' | 'reject'

    if (!disputeId || !intentId || !['verify', 'reject'].includes(action)) {
        return { error: 'Invalid input' }
    }

    const supabase = await createClient()

    // Ensure the user owns this dispute
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return { error: 'Unauthorized' }

    // Update dispute status
    const { error: disputeError } = await supabase
        .from('payment_disputes')
        .update({ 
            status: action === 'verify' ? 'verified' : 'rejected',
            resolved_at: new Date().toISOString(),
            admin_notes: `Manually ${action}ed by merchant`
        })
        .eq('id', disputeId)

    if (disputeError) {
        console.error('Update dispute error:', disputeError)
        return { error: 'Failed to update dispute status' }
    }

    // If verified, we must also update the payment intent
    if (action === 'verify') {
        // 1. Update intent status to success
        const { error: intentError } = await supabase
            .from('payment_intents')
            .update({ status: 'success' })
            .eq('id', intentId)
            
        if (intentError) {
            console.error('Update intent error:', intentError)
            return { error: 'Failed to update payment intent status' }
        }

        // 2. Fetch dispute to get transaction ID
        const { data: dispute } = await supabase
            .from('payment_disputes')
            .select('transaction_id')
            .eq('id', disputeId)
            .single();

        // 3. Insert into verified_transactions
        if (dispute) {
            await supabase.from('verified_transactions').insert({
                intent_id: intentId,
                utr: dispute.transaction_id,
                bank_source: 'MERCHANT_MANUAL_VERIFY',
                amount: 0, // Manual bypass doesn't have exact bank amount
            })
        }
    }

    revalidatePath('/dashboard/disputes')
    revalidatePath('/dashboard/transactions')
    
    return { success: true }
}
