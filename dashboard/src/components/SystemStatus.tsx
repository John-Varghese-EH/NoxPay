'use client'

import { useEffect, useState } from 'react'

interface Service {
    name: string
    status: 'operational' | 'degraded' | 'down'
    latency?: number
    label: string
}

const SERVICE_DISPLAY: Record<string, { title: string; icon: string }> = {
    supabase: { title: 'Auth & Database', icon: '🗄️' },
    api: { title: 'Payment API', icon: '⚡' },
    worker: { title: 'IMAP Worker', icon: '📧' },
    dashboard: { title: 'Dashboard', icon: '📊' },
}

const STATUS_STYLES: Record<string, { dot: string; badge: string; text: string }> = {
    operational: {
        dot: 'bg-emerald-500 animate-pulse',
        badge: 'text-emerald-500 bg-emerald-500/10',
        text: 'text-emerald-500',
    },
    degraded: {
        dot: 'bg-amber-500 animate-pulse',
        badge: 'text-amber-500 bg-amber-500/10',
        text: 'text-amber-500',
    },
    down: {
        dot: 'bg-red-500',
        badge: 'text-red-500 bg-red-500/10',
        text: 'text-red-500',
    },
}

export default function SystemStatus() {
    const [services, setServices] = useState<Service[]>([])
    const [checkedAt, setCheckedAt] = useState<string>('')
    const [loading, setLoading] = useState(true)

    const fetchStatus = async () => {
        try {
            const res = await fetch('/app-api/health', { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                setServices(data.services)
                setCheckedAt(data.checkedAt)
            }
        } catch {
            // silently fail
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
        const interval = setInterval(fetchStatus, 30000) // refresh every 30s
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                            <div className="w-20 h-4 bg-slate-800 rounded"></div>
                        </div>
                        <div className="w-16 h-4 bg-slate-800 rounded"></div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {services.map((s) => {
                const display = SERVICE_DISPLAY[s.name] || { title: s.name, icon: '🔵' }
                const style = STATUS_STYLES[s.status] || STATUS_STYLES.down

                return (
                    <div key={s.name} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 group hover:border-slate-700 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${style.dot}`}></div>
                            <span className="text-sm font-medium text-slate-300">{display.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {s.latency !== undefined && s.latency > 0 && (
                                <span className="text-[10px] text-slate-600 font-mono hidden group-hover:inline">{s.latency}ms</span>
                            )}
                            <span className={`text-xs ${style.badge} px-2 py-0.5 rounded`}>{s.label}</span>
                        </div>
                    </div>
                )
            })}

            {checkedAt && (
                <p className="text-[10px] text-slate-600 text-right mt-2">
                    Last checked: {new Date(checkedAt).toLocaleTimeString()}
                </p>
            )}
        </div>
    )
}
