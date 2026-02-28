'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function RealtimeListener({ intentId, currentStatus }: { intentId: string; currentStatus: string }) {
    const router = useRouter()

    useEffect(() => {
        if (currentStatus === 'success') return

        const supabase = createClient()

        const channel = supabase
            .channel(`public:payment_intents:id=eq.${intentId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'payment_intents', filter: `id=eq.${intentId}` },
                (payload) => {
                    const newStatus = (payload.new as { status?: string }).status
                    if (newStatus === 'success') {
                        // Refresh the current route to fetch new server data
                        router.refresh()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [intentId, currentStatus, router])

    return null
}
