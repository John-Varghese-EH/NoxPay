import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ServiceStatus {
    name: string
    status: 'operational' | 'degraded' | 'down'
    latency?: number
    label: string
}

async function checkService(url: string, headers?: Record<string, string>, timeoutMs = 5000): Promise<{ ok: boolean; latency: number }> {
    const start = Date.now()
    try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeoutMs)
        const res = await fetch(url, { signal: controller.signal, cache: 'no-store', headers })
        clearTimeout(timer)
        return { ok: res.ok, latency: Date.now() - start }
    } catch {
        return { ok: false, latency: Date.now() - start }
    }
}

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || ''
        const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || process.env.WORKER_URL || ''

        const services: ServiceStatus[] = []

        // 1. Supabase Auth / DB
        if (supabaseUrl && supabaseAnonKey) {
            const { ok, latency } = await checkService(
                `${supabaseUrl}/auth/v1/health`,
                undefined,
                5000
            )
            services.push({
                name: 'supabase',
                status: ok ? 'operational' : 'down',
                latency,
                label: ok ? 'Operational' : 'Unreachable',
            })
        } else {
            services.push({ name: 'supabase', status: 'degraded', label: 'Not Configured' })
        }

        // 2. FastAPI (Payment API)
        if (apiUrl) {
            const { ok, latency } = await checkService(`${apiUrl}/health`, undefined, 5000)
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
            const { ok, latency } = await checkService(`${workerUrl}/health`, undefined, 8000)
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
    } catch (e: any) {
        return NextResponse.json(
            { services: [{ name: 'dashboard', status: 'operational', latency: 0, label: 'Operational' }], checkedAt: new Date().toISOString(), error: e?.message },
            { status: 200 }  // Return 200 even on partial failure so the widget doesn't break
        )
    }
}
