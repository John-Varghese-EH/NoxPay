'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

// Helper to get authenticated client ownership
const verifyOwnership = async (projectId: string) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: client } = await supabase
        .from('clients')
        .select('id, user_id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

    if (!client) throw new Error("Project not found or unauthorized")
    return { supabase, client, user }
}

export async function saveProjectName(projectId: string, formData: FormData) {
    const name = formData.get('name') as string
    if (!name || name.trim().length === 0) return redirect(`/settings?project=${projectId}&message=Project name cannot be empty`)
    
    try {
        const { supabase } = await verifyOwnership(projectId)
        await supabase.from('clients').update({ name: name.trim() }).eq('id', projectId)
        revalidatePath('/dashboard')
        revalidatePath('/settings')
        return redirect(`/settings?project=${projectId}&message=Project name updated successfully`)
    } catch (e: any) {
        if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) throw e
        return redirect(`/settings?project=${projectId}&error=${encodeURIComponent(e.message)}`)
    }
}

export async function deleteProject(projectId: string) {
    try {
        const { supabase } = await verifyOwnership(projectId)
        await supabase.from('clients').delete().eq('id', projectId)
        revalidatePath('/dashboard')
        revalidatePath('/settings')
        return redirect('/dashboard')
    } catch (e: any) {
        if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) throw e
        return redirect(`/settings?project=${projectId}&error=${encodeURIComponent(e.message)}`)
    }
}

export async function regenerateSecretKey(projectId: string) {
    try {
        const { supabase } = await verifyOwnership(projectId)
        
        // Generate new API Key (Secret Key)
        const newSecret = Array.from(crypto.getRandomValues(new Uint8Array(24)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
        
        const skFormat = `sk_test_${newSecret}`
        const secretHash = await bcrypt.hash(skFormat, 10)

        await supabase.from('clients').update({ secret_hash: secretHash }).eq('id', projectId)
        
        revalidatePath('/settings')
        // Redirect back with the new secret so it can be displayed ONCE
        return redirect(`/settings?project=${projectId}&new_secret=${skFormat}&message=Secret key regenerated successfully`)
    } catch (e: any) {
        if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) throw e
        return redirect(`/settings?project=${projectId}&error=${encodeURIComponent(e.message)}`)
    }
}

export async function regenerateWebhookSecret(projectId: string) {
    try {
        const { supabase } = await verifyOwnership(projectId)
        
        const newSecret = Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
            
        const whFormat = `whsec_${newSecret}`

        await supabase.from('clients').update({ webhook_secret: whFormat }).eq('id', projectId)
        
        revalidatePath('/settings')
        return redirect(`/settings?project=${projectId}&message=Webhook secret regenerated successfully`)
    } catch (e: any) {
        if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) throw e
        return redirect(`/settings?project=${projectId}&error=${encodeURIComponent(e.message)}`)
    }
}

export async function saveVpa(projectId: string, formData: FormData) {
    const vpa = formData.get('upi_vpa') as string
    if (!vpa || !vpa.includes('@')) return redirect(`/settings?project=${projectId}&error=Invalid UPI VPA format`)

    try {
        const { supabase } = await verifyOwnership(projectId)
        await supabase.from('clients').update({ upi_vpa: vpa.trim() }).eq('id', projectId)
        revalidatePath('/settings')
        return redirect(`/settings?project=${projectId}&message=VPA saved successfully`)
    } catch (e: any) {
        if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) throw e
        return redirect(`/settings?project=${projectId}&error=${encodeURIComponent(e.message)}`)
    }
}

export async function saveCryptoWallet(projectId: string, formData: FormData) {
    const wallet = formData.get('crypto_wallet') as string
    if (!wallet) return redirect(`/settings?project=${projectId}&error=Wallet address required`)

    try {
        const { supabase } = await verifyOwnership(projectId)
        await supabase.from('clients').update({ crypto_wallet: wallet.trim() }).eq('id', projectId)
        revalidatePath('/settings')
        return redirect(`/settings?project=${projectId}&message=Crypto wallet saved successfully`)
    } catch (e: any) {
        if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) throw e
        return redirect(`/settings?project=${projectId}&error=${encodeURIComponent(e.message)}`)
    }
}

export async function saveBankDetails(projectId: string, formData: FormData) {
    const account_name = formData.get('account_name') as string
    const account_number = formData.get('account_number') as string
    const ifsc = formData.get('ifsc') as string

    try {
        const { supabase } = await verifyOwnership(projectId)
        await supabase.from('clients').update({
            bank_account: { account_name, account_number, ifsc }
        }).eq('id', projectId)
        revalidatePath('/settings')
        return redirect(`/settings?project=${projectId}&message=Bank details updated`)
    } catch (e: any) {
        if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) throw e
        return redirect(`/settings?project=${projectId}&error=${encodeURIComponent(e.message)}`)
    }
}

export async function saveEmails(projectId: string, formData: FormData) {
    const emailsStr = formData.get('emails') as string
    const emails = emailsStr.split(',').map(e => e.trim()).filter(e => e)

    try {
        const { supabase } = await verifyOwnership(projectId)
        await supabase.from('clients').update({ notification_emails: emails }).eq('id', projectId)
        revalidatePath('/settings')
        return redirect(`/settings?project=${projectId}&message=Notification emails updated`)
    } catch (e: any) {
        if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) throw e
        return redirect(`/settings?project=${projectId}&error=${encodeURIComponent(e.message)}`)
    }
}

export async function savePaymentMethods(projectId: string, formData: FormData) {
    const upi = formData.get('method_upi') === 'on'
    const usdt = formData.get('method_usdt') === 'on'
    const bank_transfer = formData.get('method_bank') === 'on'

    try {
        const { supabase } = await verifyOwnership(projectId)
        await supabase.from('clients').update({
            payment_methods: { upi, usdt, bank_transfer }
        }).eq('id', projectId)
        revalidatePath('/settings')
        return redirect(`/settings?project=${projectId}&message=Payment methods updated`)
    } catch (e: any) {
        if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) throw e
        return redirect(`/settings?project=${projectId}&error=${encodeURIComponent(e.message)}`)
    }
}

export async function saveCheckoutBranding(projectId: string, formData: FormData) {
    const theme_color = formData.get('theme_color') as string
    const logo_url = formData.get('logo_url') as string
    const return_url = formData.get('return_url') as string

    try {
        const { supabase } = await verifyOwnership(projectId)
        await supabase.from('clients').update({
            theme_color,
            logo_url,
            return_url
        }).eq('id', projectId)
        revalidatePath('/settings')
        return redirect(`/settings?project=${projectId}&message=Checkout branding updated`)
    } catch (e: any) {
        if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) throw e
        return redirect(`/settings?project=${projectId}&error=${encodeURIComponent(e.message)}`)
    }
}

export async function saveBankParserRules(projectId: string, formData: FormData) {
    const rulesJson = formData.get('rules') as string

    try {
        const rules = JSON.parse(rulesJson || '[]')

        // Validate each rule has required fields
        for (const rule of rules) {
            if (!rule.bank_name || !rule.detect_keyword || !rule.amount_regex || !rule.utr_regex) {
                return { error: 'Each rule must have bank name, detect keyword, amount regex, and UTR regex.' }
            }
            // Validate regexes are syntactically correct
            try {
                new RegExp(rule.amount_regex, 'i')
                new RegExp(rule.utr_regex, 'i')
                if (rule.sender_regex) new RegExp(rule.sender_regex, 'i')
                if (rule.remark_regex) new RegExp(rule.remark_regex, 'i')
            } catch {
                return { error: `Invalid regex in rule "${rule.bank_name}".` }
            }
        }

        const { supabase } = await verifyOwnership(projectId)
        const { error } = await supabase.from('clients').update({
            bank_parser_rules: rules
        }).eq('id', projectId)

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/settings')
        return { success: true }
    } catch (e: any) {
        if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) throw e
        return { error: e.message || 'Failed to save parser rules' }
    }
}
