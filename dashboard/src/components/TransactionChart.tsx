'use client'

import { format, subDays } from 'date-fns'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function TransactionChart({ data }: { data: any[] }) {
  const chartData = []
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i)
    const dateStr = format(d, 'MMM dd')
    const match = data.find(x => x.date === dateStr)
    chartData.push({
      date: dateStr,
      volume: match ? Number(match.volume) : 0
    })
  }

  return (
    <div className="h-[300px] w-full mt-4" style={{ minHeight: 200, minWidth: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => '₹' + value.toLocaleString()}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
            itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
            formatter={(value) => ['₹' + Number(value).toLocaleString(), 'Volume']}
          />
          <Area 
            type="monotone" 
            dataKey="volume" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorVolume)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}