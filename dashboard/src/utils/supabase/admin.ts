import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client for public-facing pages (checkout, widget).
 * Uses service role key to bypass RLS. Falls back to anon key if
 * the service role key is not configured (with a console warning).
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!serviceKey) {
        console.warn('[NoxPay] SUPABASE_SERVICE_ROLE_KEY not set — falling back to anon key. Checkout may fail for unauthenticated users due to RLS.')
    }

    return createSupabaseClient(url, serviceKey || anonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
