'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type OrderTrendChartRow = {
  label: string
  orders: number
  gmv: number
}

const ORDERS_COLOR = '#EAB308'
const GMV_COLOR = '#7C3AED'

const formatInrTick = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0)

type OrderTrendsChartProps = {
  data: OrderTrendChartRow[]
  /** Period totals for legend (Roposo-style). */
  legendOrderCount?: number
  legendGmv?: number
}

export function OrderTrendsChart({
  data,
  legendOrderCount,
  legendGmv,
}: OrderTrendsChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        No data for this range.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
        <XAxis dataKey="label" stroke="#71717A" style={{ fontSize: 11 }} />
        <YAxis
          yAxisId="left"
          allowDecimals={false}
          stroke="#71717A"
          style={{ fontSize: 11 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#71717A"
          style={{ fontSize: 11 }}
          tickFormatter={(v) => formatInrTick(Number(v))}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E4E4E7',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: number, name: string) =>
            name === 'GMV (₹)' ? formatInrTick(value) : value
          }
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          formatter={(value, entry) => {
            if (entry.dataKey === 'orders' && legendOrderCount !== undefined) {
              return `${value} ${legendOrderCount}`
            }
            if (entry.dataKey === 'gmv' && legendGmv !== undefined) {
              return `${value} ${formatInrTick(legendGmv)}`
            }
            return value
          }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="orders"
          stroke={ORDERS_COLOR}
          strokeWidth={2}
          name="Orders"
          dot={{ fill: ORDERS_COLOR, r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="gmv"
          stroke={GMV_COLOR}
          strokeWidth={2}
          name="GMV (₹)"
          dot={{ fill: GMV_COLOR, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
