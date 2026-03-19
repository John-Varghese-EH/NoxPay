'use client'

import { Download } from 'lucide-react'

export default function ExportCSV({ data }: { data: any[] }) {
    const handleExport = () => {
        if (!data || data.length === 0) return

        const headers = ['Order ID', 'Amount', 'Currency', 'Status', 'Created At', 'UTR', 'Bank Source', 'Flagged', 'Flag Reason']
        const rows = data.map((d: any) => {
            const tx = d.verified_transactions?.[0]
            return [
                d.order_id || '',
                d.amount || '',
                d.currency || '',
                d.status || '',
                d.created_at || '',
                tx?.utr || '',
                tx?.bank_source || '',
                d.is_flagged ? 'Yes' : 'No',
                d.flag_reason || '',
            ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
        })

        const csv = [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `noxpay_transactions_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <button
            onClick={handleExport}
            disabled={!data || data.length === 0}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-violet-500/30 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Download className="w-3.5 h-3.5" />
            Export CSV
        </button>
    )
}
