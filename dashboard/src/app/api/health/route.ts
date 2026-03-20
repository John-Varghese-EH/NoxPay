import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ServiceStatus {
    name: string
    status: 'operational' | 'degraded' | 'down'
    latency?: number
    label: string
}

async function checkService(url: string, timeoutMs = 5000): Promise<{ ok: boolean; latency: number }> {
    const start = Date.now()
    try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeoutMs)
        const res = await fetch(url, { signal: controller.signal, cache: 'no-store' })
        clearTimeout(timer)
        return { ok: res.ok, latency: Date.now() - start }
    } catch {
        return { ok: false, latency: Date.now() - start }
    }
}

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || ''
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || process.env.WORKER_URL || ''

    const services: ServiceStatus[] = []

    // 1. Supabase Auth / DB
    if (supabaseUrl) {
        const { ok, latency } = await checkService(`${supabaseUrl}/rest/v1/`, 5000)
        services.push({
            name: 'supabase',
            status: ok ? 'operational' : 'down',
            latency,
            label: ok ? 'Operational' : 'Unreachable',
        })
    } else {
        services.push({ name: 'supabase', status: 'down', label: 'Not Configured' })
    }

    // 2. FastAPI (Payment API)
    if (apiUrl) {
        const { ok, latency } = await checkService(`${apiUrl}/health`, 5000)
        services.push({
            name: 'api',
            status: ok ? 'operational' : 'down',
            latency,
            label: ok ? 'Operational' : 'Unreachable',
        })
    } else {
        services.push({ name: 'api', status: 'degraded', label: 'Not Configured' })
    }

    // 3. IMAP Worker (Render service)
    if (workerUrl) {
        const { ok, latency } = await checkService(`${workerUrl}/health`, 8000)
        services.push({
            name: 'worker',
            status: ok ? 'operational' : 'down',
            latency,
            label: ok ? 'Polling Active' : 'Unreachable',
        })
    } else {
        services.push({ name: 'worker', status: 'degraded', label: 'Not Configured' })
    }

    // 4. Dashboard (self)
    services.push({ name: 'dashboard', status: 'operational', latency: 0, label: 'Operational' })

    return NextResponse.json({ services, checkedAt: new Date().toISOString() })
}
