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

const MARGIN_COLOR = '#EAB308'

export type MarginPctChartRow = {
  label: string
  marginPct: number
}

type MarginPctChartProps = {
  data: MarginPctChartRow[]
  periodMarginPct?: number
}

export function MarginPctChart({ data, periodMarginPct = 0 }: MarginPctChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        No data for this range.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
        <XAxis dataKey="label" stroke="#71717A" style={{ fontSize: 11 }} />
        <YAxis
          stroke="#71717A"
          style={{ fontSize: 11 }}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 'auto']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E4E4E7',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: number) => [`${Number(value).toFixed(1)}%`, 'Margin']}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          formatter={() => `Margin ${periodMarginPct.toFixed(1)}%`}
        />
        <Line
          type="monotone"
          dataKey="marginPct"
          stroke={MARGIN_COLOR}
          strokeWidth={2}
          name="Margin %"
          dot={{ fill: MARGIN_COLOR, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
