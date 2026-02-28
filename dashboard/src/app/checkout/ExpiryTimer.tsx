'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ExpiryTimer({ expiresAt }: { expiresAt: string }) {
    const router = useRouter()
    const [timeLeft, setTimeLeft] = useState<string>('--:--')
    const [isExpiredLocally, setIsExpiredLocally] = useState(false)

    useEffect(() => {
        if (!expiresAt) return

        const targetTime = new Date(expiresAt).getTime()

        const updateTimer = () => {
            const now = new Date().getTime()
            const difference = targetTime - now

            if (difference <= 0) {
                setTimeLeft('00:00')
                setIsExpiredLocally(true)
                // Force a hard refresh so the server re-evaluates the intent status
                router.refresh()
                return
            }

            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            setTimeLeft(
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            )
        }

        updateTimer() // run immediately
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [expiresAt, router])

    if (isExpiredLocally) {
        return (
            <div className="flex items-center gap-1.5 text-[10px] text-red-500 mt-4 font-bold uppercase tracking-wide animate-pulse">
                <Clock className="w-3 h-3" /> Expired
            </div>
        )
    }

    return (
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-4 font-medium uppercase tracking-wide">
            <Clock className="w-3 h-3" /> Expires in <span className="text-amber-400 font-mono text-xs ml-0.5">{timeLeft}</span>
        </div>
    )
}
