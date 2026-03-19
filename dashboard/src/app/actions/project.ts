'use server'

import { createClient } from '@/utils/supabase/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'

export async function createProjectAction(name: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const rawSecret = `sk_live_${crypto.randomBytes(24).toString('hex')}`
    const rawWebhookSecret = `whsec_${crypto.randomBytes(24).toString('hex')}`
    
    // Salt 12 is sufficient.
    const hashedSecret = bcrypt.hashSync(rawSecret, 12)

    const clientId = uuidv4()

    const { error } = await supabase.from('clients').insert([
        {
            user_id: user.id,
            name: name,
            client_id: clientId,
            secret_hash: hashedSecret,
            webhook_secret: rawWebhookSecret
        }
    ])

    if (error) {
        console.error("Insert error:", error)
        return { error: error.message }
    }

    return { success: true, rawSecret, rawWebhookSecret, clientId }
}
