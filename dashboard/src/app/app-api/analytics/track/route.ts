import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { intent_id, client_id, browser, device_type, os, screen_resolution, language, platform, referrer, user_agent } = body

        if (!intent_id || !client_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
        const supabase = createAdminClient()

        const { error: upsertError } = await supabase.from('checkout_analytics').upsert(
            {
                intent_id,
                client_id,
                ip_address: ip,
                browser: browser || 'Unknown',
                device_type: device_type || 'unknown',
                os: os || 'Unknown',
                screen_resolution: screen_resolution || 'unknown',
                language: language || 'unknown',
                platform: platform || 'unknown',
                referrer: referrer || 'direct',
                user_agent: (user_agent || '').substring(0, 500),
            },
            { onConflict: 'intent_id' }
        )
        if (upsertError) {
            return NextResponse.json({ error: 'Supabase Upsert Error: ' + upsertError.message }, { status: 400 })
        }

        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: 'Exception hit: ' + (e.message || String(e)) }, { status: 400 })
    }
}
