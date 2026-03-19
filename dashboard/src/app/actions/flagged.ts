'use server'

import { createClient } from '@/utils/supabase/server'

export async function resolveFlaggedPayment(
    intentId: string,
    resolution: 'approved' | 'rejected'
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const newStatus = resolution === 'approved' ? 'success' : 'failed'

    const { error } = await supabase
        .from('payment_intents')
        .update({
            status: newStatus,
            is_flagged: false,
            resolution,
            resolved_at: new Date().toISOString(),
            resolved_by: user.id,
        })
        .eq('id', intentId)
        .eq('is_flagged', true)

    if (error) {
        console.error('Resolve flagged payment error:', error)
        return { error: error.message }
    }
    return { success: true, newStatus }
}

export async function flagPaymentForReview(intentId: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('payment_intents')
        .update({ status: 'flagged', is_flagged: true, flag_reason: reason })
        .eq('id', intentId)

    if (error) return { error: error.message }
    return { success: true }
}
