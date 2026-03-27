'use client'

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import type { DashboardTrendPoint } from '@/hooks/useAdminDashboard'

type OrdersChartProps = {
  /** When omitted, renders a flat 7-day zero series (partner shell / loading). */
  data?: DashboardTrendPoint[]
}

const defaultSevenDayZeros = (): DashboardTrendPoint[] => {
  const out: DashboardTrendPoint[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    out.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      submissions: 0,
      approved: 0,
      rejected: 0,
    })
  }
  return out
}

export function OrdersChart({ data }: OrdersChartProps) {
  const chartData = data && data.length > 0 ? data : defaultSevenDayZeros()
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
        <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="submissions"
          stroke="#0097B2"
          strokeWidth={2}
          name="Submissions"
          dot={{ fill: '#0097B2', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="approved"
          stroke="#7ED957"
          strokeWidth={2}
          name="Approved"
          dot={{ fill: '#7ED957', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="rejected"
          stroke="#ef4444"
          strokeWidth={2}
          name="Rejected"
          dot={{ fill: '#ef4444', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
