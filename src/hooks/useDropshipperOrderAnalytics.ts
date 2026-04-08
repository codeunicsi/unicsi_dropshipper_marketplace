'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import type { DashboardAlert } from '@/hooks/useAdminDashboard'
import type { StatsGridStats } from '@/components/dashboard/StatsGrid'

export type OrderAnalyticsRangePreset = 7 | 30 | 90

export type OrderAnalyticsTimeseriesRow = {
  date: string
  orders: number
  units: number
  gmv: number
  marginPct: number
}

export type OrderAnalyticsByStatusRow = {
  orderStatus: string
  count: number
  gmv: number
}

export type OrderAnalyticsTopProductRow = {
  productId: string
  title: string
  orderCount: number
  units: number
  gmv: number
}

export type OrderAnalyticsBySupplierRow = {
  supplierId: string
  supplierName: string
  orderCount: number
  units: number
  gmv: number
}

export type OrderAnalyticsByPaymentMethodRow = {
  paymentMethod: string
  count: number
  gmv: number
}

export type OrderAnalyticsByPaymentStatusRow = {
  paymentStatus: string
  count: number
  gmv: number
}

export type OrderAnalyticsComparison = {
  range: { from: string; to: string }
  summary: {
    orderCount: number
    units: number
    gmv: number
    platformMargin?: number
    marginPctOfGmv?: number
  }
  byStatus: OrderAnalyticsByStatusRow[]
}

export type RoposoStyleKpis = {
  bulkOrders: number
  inProgress: number
  gmv: number
  marginPctOfGmv: number
  deliveredPct: number
  deliveredCount: number
  rtoPct: number
  rtoCount: number
  cancelledPct: number
  cancelledCount: number
}

type AnalyticsApiData = {
  range: { from: string; to: string }
  summary: {
    orderCount: number
    units: number
    gmv: number
    platformMargin: number
    marginPctOfGmv: number
  }
  byStatus: OrderAnalyticsByStatusRow[]
  byPaymentMethod: OrderAnalyticsByPaymentMethodRow[]
  byPaymentStatus: OrderAnalyticsByPaymentStatusRow[]
  timeseries: OrderAnalyticsTimeseriesRow[]
  topProducts: OrderAnalyticsTopProductRow[]
  bySupplier: OrderAnalyticsBySupplierRow[]
  comparison: OrderAnalyticsComparison | null
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export type OrderAnalyticsRangeState =
  | { kind: 'preset'; days: OrderAnalyticsRangePreset }
  | { kind: 'custom'; from: string; to: string }

function utcTodayStr() {
  return new Date().toISOString().slice(0, 10)
}

function startDateForPreset(endStr: string, days: number) {
  const end = new Date(`${endStr}T00:00:00.000Z`)
  end.setUTCDate(end.getUTCDate() - (days - 1))
  return end.toISOString().slice(0, 10)
}

export function getPresetOrderAnalyticsRange(days: OrderAnalyticsRangePreset): {
  from: string
  to: string
} {
  const to = utcTodayStr()
  const from = startDateForPreset(to, days)
  return { from, to }
}

export function resolveOrderAnalyticsRange(state: OrderAnalyticsRangeState): {
  from: string
  to: string
} {
  if (state.kind === 'preset') {
    return getPresetOrderAnalyticsRange(state.days)
  }
  return { from: state.from, to: state.to }
}

export function validateOrderAnalyticsRange(from: string, to: string): string | null {
  const f = from.trim()
  const t = to.trim()
  if (!DATE_RE.test(f) || !DATE_RE.test(t)) {
    return 'Use valid dates (YYYY-MM-DD).'
  }
  if (f > t) {
    return 'Start date must be on or before end date.'
  }
  const start = new Date(`${f}T00:00:00.000Z`)
  const end = new Date(`${t}T00:00:00.000Z`)
  const days = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1
  if (days > 366) {
    return 'Range cannot exceed 366 days.'
  }
  return null
}

const DELIVERED_STATUSES = new Set(['DELIVERED', 'Delivered'])
const TERMINAL_STATUSES = new Set([
  'DELIVERED',
  'Delivered',
  'CANCELLED',
  'Cancelled',
  'RTO',
  'rto',
])

const RISK_STATUSES = new Set(['RTO', 'CANCELLED', 'Cancelled'])
const CANCELLED_STATUSES = new Set(['CANCELLED', 'Cancelled'])

export function computeRoposoStyleKpis(
  summary: {
    orderCount: number
    gmv: number
    marginPctOfGmv?: number
  },
  byStatus: OrderAnalyticsByStatusRow[],
): RoposoStyleKpis {
  const oc = summary.orderCount
  const delivered = byStatus
    .filter((r) => DELIVERED_STATUSES.has(r.orderStatus))
    .reduce((a, r) => a + r.count, 0)
  const rto = byStatus.filter((r) => r.orderStatus === 'RTO').reduce((a, r) => a + r.count, 0)
  const cancelled = byStatus
    .filter((r) => CANCELLED_STATUSES.has(r.orderStatus))
    .reduce((a, r) => a + r.count, 0)
  const open = byStatus
    .filter((r) => !TERMINAL_STATUSES.has(r.orderStatus))
    .reduce((a, r) => a + r.count, 0)

  return {
    bulkOrders: oc,
    inProgress: open,
    gmv: summary.gmv,
    marginPctOfGmv: summary.marginPctOfGmv ?? 0,
    deliveredPct: oc > 0 ? (delivered / oc) * 100 : 0,
    deliveredCount: delivered,
    rtoPct: oc > 0 ? (rto / oc) * 100 : 0,
    rtoCount: rto,
    cancelledPct: oc > 0 ? (cancelled / oc) * 100 : 0,
    cancelledCount: cancelled,
  }
}

function partnerStatsFromSummary(
  summary: { orderCount: number; units: number; gmv: number },
  byStatus: OrderAnalyticsByStatusRow[],
): StatsGridStats {
  const orderCount = summary.orderCount
  const delivered = byStatus
    .filter((r) => DELIVERED_STATUSES.has(r.orderStatus))
    .reduce((a, r) => a + r.count, 0)
  const deliveredPct = orderCount > 0 ? (delivered / orderCount) * 100 : 0
  const openPipeline = byStatus
    .filter((r) => !TERMINAL_STATUSES.has(r.orderStatus))
    .reduce((a, r) => a + r.count, 0)
  const riskCount = byStatus
    .filter((r) => RISK_STATUSES.has(r.orderStatus))
    .reduce((a, r) => a + r.count, 0)

  return {
    totalProducts: orderCount,
    gmv: summary.gmv,
    rejectionRate: deliveredPct,
    pendingApprovals: openPipeline,
    activeSuppliers: summary.units,
    listedProducts: riskCount,
  }
}

function pctVsPrior(cur: number, prev: number): string {
  if (prev === 0) {
    return cur === 0 ? 'Same as prior period' : 'Up from zero in prior period'
  }
  const d = ((cur - prev) / prev) * 100
  const sign = d >= 0 ? '+' : ''
  return `${sign}${d.toFixed(0)}% vs prior period`
}

function ppVsPrior(cur: number, prev: number): string {
  const d = cur - prev
  if (Math.abs(d) < 0.05) {
    return 'Same as prior period'
  }
  const sign = d >= 0 ? '+' : ''
  return `${sign}${d.toFixed(1)} pp vs prior period`
}

function countVsPrior(cur: number, prev: number): string {
  const d = cur - prev
  if (d === 0) {
    return 'Same as prior period'
  }
  const sign = d > 0 ? '+' : ''
  return `${sign}${d} vs prior period`
}

export function useDropshipperOrderAnalytics(
  range: { from: string; to: string },
  options: { compare?: boolean } = {},
) {
  const compare = options.compare === true
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payload, setPayload] = useState<AnalyticsApiData | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const { from, to } = range

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setPayload(null)

    const run = async () => {
      try {
        const qs = new URLSearchParams({ from, to })
        if (compare) {
          qs.set('compare', '1')
        }
        const json = await apiClient.get(
          `dropshipper/analytics/orders-overview?${qs.toString()}`,
        )
        if (!active) return
        if (!json?.success || !json?.data) {
          const msg =
            typeof json?.error === 'string' ? json.error : 'Failed to load analytics'
          throw new Error(msg)
        }
        setPayload(json.data as AnalyticsApiData)
        setError(null)
      } catch (e) {
        if (!active) return
        setPayload(null)
        setError(e instanceof Error ? e.message : 'Failed to load analytics')
      } finally {
        if (active) setLoading(false)
      }
    }

    void run()
    return () => {
      active = false
    }
  }, [from, to, compare, reloadToken])

  const reload = useCallback(() => {
    setReloadToken((t) => t + 1)
  }, [])

  const stats = useMemo((): StatsGridStats => {
    if (!payload) {
      return {
        totalProducts: 0,
        gmv: 0,
        rejectionRate: 0,
        pendingApprovals: 0,
        activeSuppliers: 0,
        listedProducts: 0,
      }
    }
    return partnerStatsFromSummary(payload.summary, payload.byStatus)
  }, [payload])

  const comparisonHints = useMemo((): (string | undefined)[] | undefined => {
    if (!payload?.comparison) return undefined
    const cur = partnerStatsFromSummary(payload.summary, payload.byStatus)
    const prev = partnerStatsFromSummary(
      payload.comparison.summary,
      payload.comparison.byStatus,
    )
    return [
      pctVsPrior(cur.totalProducts, prev.totalProducts),
      pctVsPrior(cur.gmv, prev.gmv),
      ppVsPrior(cur.rejectionRate, prev.rejectionRate),
      countVsPrior(cur.pendingApprovals, prev.pendingApprovals),
      pctVsPrior(cur.activeSuppliers, prev.activeSuppliers),
      countVsPrior(cur.listedProducts, prev.listedProducts),
    ]
  }, [payload])

  const roposoKpis = useMemo((): RoposoStyleKpis | null => {
    if (!payload) return null
    return computeRoposoStyleKpis(payload.summary, payload.byStatus)
  }, [payload])

  const roposoComparisonHints = useMemo((): (string | undefined)[] | undefined => {
    if (!payload?.comparison || !roposoKpis) return undefined
    const prev = computeRoposoStyleKpis(
      {
        orderCount: payload.comparison.summary.orderCount,
        gmv: payload.comparison.summary.gmv,
        marginPctOfGmv: payload.comparison.summary.marginPctOfGmv,
      },
      payload.comparison.byStatus,
    )
    const cur = roposoKpis
    const gmvHint = pctVsPrior(cur.gmv, prev.gmv)
    const marginHint = ppVsPrior(cur.marginPctOfGmv, prev.marginPctOfGmv)
    return [
      pctVsPrior(cur.bulkOrders, prev.bulkOrders),
      `${gmvHint} · margin ${marginHint}`,
      ppVsPrior(cur.deliveredPct, prev.deliveredPct),
      ppVsPrior(cur.rtoPct, prev.rtoPct),
      ppVsPrior(cur.cancelledPct, prev.cancelledPct),
    ]
  }, [payload, roposoKpis])

  const chartRows = useMemo(() => {
    const rows = payload?.timeseries ?? []
    return rows.map((row) => ({
      ...row,
      marginPct: row.marginPct ?? 0,
      label: new Date(`${row.date}T12:00:00.000Z`).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
    }))
  }, [payload])

  const alerts = useMemo((): DashboardAlert[] => {
    if (!payload || loading) return []
    const out: DashboardAlert[] = []
    const { summary, byStatus } = payload

    if (summary.orderCount === 0) {
      out.push({
        title: 'No orders in this range',
        description: 'Place bulk orders from product pages to see trends here.',
        severity: 'info',
      })
      return out
    }

    const openPipeline = byStatus
      .filter((r) => !TERMINAL_STATUSES.has(r.orderStatus))
      .reduce((a, r) => a + r.count, 0)

    if (openPipeline > 0) {
      out.push({
        title: 'Orders in progress',
        description: `${openPipeline} order${openPipeline === 1 ? '' : 's'} are not yet delivered or closed.`,
        severity: 'info',
      })
    }

    const rto = byStatus.filter((r) => r.orderStatus === 'RTO').reduce((a, r) => a + r.count, 0)
    if (rto > 0) {
      out.push({
        title: 'RTO orders',
        description: `${rto} order${rto === 1 ? '' : 's'} marked RTO in this period.`,
        severity: 'warning',
      })
    }

    return out
  }, [payload, loading])

  const comparisonRangeLabel = payload?.comparison
    ? `${payload.comparison.range.from} — ${payload.comparison.range.to}`
    : null

  return {
    loading,
    error,
    range: { from, to },
    stats,
    comparisonHints,
    comparisonRangeLabel,
    roposoKpis,
    roposoComparisonHints,
    chartRows,
    byStatus: payload?.byStatus ?? [],
    byPaymentMethod: payload?.byPaymentMethod ?? [],
    byPaymentStatus: payload?.byPaymentStatus ?? [],
    topProducts: payload?.topProducts ?? [],
    bySupplier: payload?.bySupplier ?? [],
    summary: payload?.summary ?? null,
    alerts,
    reload,
  }
}

export const ORDER_ANALYTICS_STATS_LABELS = [
  'Bulk orders',
  'GMV',
  'Delivered %',
  'In progress',
  'Units',
  'RTO & cancelled',
] as const

export const ORDER_ANALYTICS_STATS_HINTS = [
  'In selected date range',
  'Sum of order totals (platform)',
  'Delivered ÷ all orders',
  'Not yet delivered or closed',
  'Total quantity ordered',
  'RTO plus cancelled',
] as const
