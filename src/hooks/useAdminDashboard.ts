'use client'

import { useEffect, useMemo, useState } from 'react'

type PendingProduct = {
  supplier_id?: string
  supplierName?: string
  supplier?: { name?: string }
  createdAt?: string
  approval_status?: 'submitted' | 'under_review' | 'approved' | 'rejected' | string
}

type LiveProduct = {
  supplier_id?: string
  supplier?: {
    name?: string
  }
  createdAt?: string
  created_at?: string
}

type Supplier = {
  supplier_id?: string
  id?: string
  name?: string
  account_status?: string
}

type PendingStats = {
  awaiting_review?: number
  needs_revision?: number
  approved?: number
}

export type DashboardTrendPoint = {
  date: string
  submissions: number
  approved: number
  rejected: number
}

export type DashboardTopSupplier = {
  id: string
  name: string
  totalProducts: number
  liveProducts: number
  pendingProducts: number
  status: 'Active' | 'Pending'
}

export type DashboardAlert = {
  title: string
  description: string
  severity: 'warning' | 'info' | 'danger'
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/'

const getBaseUrl = () => `${API_BASE_URL.replace(/\/$/, '')}/`

const toDateKey = (value?: string) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

const lastNDays = (days: number) => {
  const keys: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    keys.push(date.toISOString().slice(0, 10))
  }
  return keys
}

export function useAdminDashboard() {
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([])
  const [liveProducts, setLiveProducts] = useState<LiveProduct[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [pendingStats, setPendingStats] = useState<PendingStats>({})
  const [liveStatsGmv, setLiveStatsGmv] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        const base = getBaseUrl()
        const [pendingRes, pendingStatsRes, liveRes, liveStatsRes, suppliersRes] = await Promise.all([
          fetch(`${base}admin/products/get-pending-products`),
          fetch(`${base}admin/products/pending/stats`),
          fetch(`${base}admin/products/get-live-products`),
          fetch(`${base}admin/products/live/stats`),
          fetch(`${base}admin/get-all-suppliers`),
        ])

        if (!pendingRes.ok || !liveRes.ok || !suppliersRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const [pendingJson, pendingStatsJson, liveJson, liveStatsJson, suppliersJson] =
          await Promise.all([
            pendingRes.json(),
            pendingStatsRes.ok ? pendingStatsRes.json() : Promise.resolve({}),
            liveRes.json(),
            liveStatsRes.ok ? liveStatsRes.json() : Promise.resolve({}),
            suppliersRes.json(),
          ])

        if (cancelled) return

        setPendingProducts((pendingJson?.data as PendingProduct[]) || [])
        setLiveProducts((liveJson?.data as LiveProduct[]) || [])
        setSuppliers((suppliersJson?.data as Supplier[]) || [])

        const normalizedPendingStats = (pendingStatsJson?.data ?? pendingStatsJson ?? {}) as PendingStats
        setPendingStats({
          awaiting_review: normalizedPendingStats.awaiting_review ?? 0,
          needs_revision: normalizedPendingStats.needs_revision ?? 0,
          approved: normalizedPendingStats.approved ?? 0,
        })

        const gmv = Number(liveStatsJson?.data?.total_gmv ?? liveStatsJson?.total_gmv ?? 0)
        setLiveStatsGmv(Number.isFinite(gmv) ? gmv : 0)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDashboardData()
    return () => {
      cancelled = true
    }
  }, [])

  const trendData = useMemo<DashboardTrendPoint[]>(() => {
    const dayKeys = lastNDays(7)
    const dayMap = new Map<string, DashboardTrendPoint>(
      dayKeys.map((key) => [
        key,
        {
          date: new Date(`${key}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          submissions: 0,
          approved: 0,
          rejected: 0,
        },
      ]),
    )

    pendingProducts.forEach((product) => {
      const key = toDateKey(product.createdAt)
      if (!key || !dayMap.has(key)) return
      const point = dayMap.get(key)
      if (!point) return
      point.submissions += 1
      if (product.approval_status === 'approved') point.approved += 1
      if (product.approval_status === 'rejected') point.rejected += 1
    })

    return dayKeys.map((key) => dayMap.get(key)!)
  }, [pendingProducts])

  const topSuppliers = useMemo<DashboardTopSupplier[]>(() => {
    const nameBySupplierId = new Map<string, string>()
    suppliers.forEach((s) => {
      const id = (s.supplier_id ?? s.id)?.toString().trim()
      const n = s.name?.trim()
      if (id && n) nameBySupplierId.set(id, n)
    })

    /** Stable merge key: never use row index (that split one supplier into many rows). */
    const bucketKey = (supplierId?: string, explicitName?: string) => {
      const sid = supplierId?.trim()
      if (sid) return `id:${sid}`
      const norm = (explicitName ?? '').trim().toLowerCase()
      if (norm) return `name:${norm}`
      return '__unknown__'
    }

    const resolveDisplayName = (supplierId: string | undefined, explicitName: string | undefined) => {
      const sid = supplierId?.trim()
      if (sid) {
        const fromList = nameBySupplierId.get(sid)
        if (fromList) return fromList
      }
      const fromProduct = (explicitName ?? '').trim()
      if (fromProduct) return fromProduct
      if (sid) return `Supplier ${sid.slice(0, 8)}…`
      return 'Unknown supplier'
    }

    const map = new Map<
      string,
      { id: string; name: string; liveProducts: number; pendingProducts: number }
    >()

    const bump = (
      supplierId: string | undefined,
      explicitName: string | undefined,
      field: 'liveProducts' | 'pendingProducts',
    ) => {
      const key = bucketKey(supplierId, explicitName)
      const display = resolveDisplayName(supplierId, explicitName)
      const prev =
        map.get(key) ?? { id: key, name: display, liveProducts: 0, pendingProducts: 0 }
      prev[field] += 1
      // Prefer real name over placeholder once we see it
      if (prev.name === 'Unknown supplier' && display !== 'Unknown supplier') {
        prev.name = display
      }
      map.set(key, prev)
    }

    liveProducts.forEach((product) => {
      bump(product.supplier_id, product.supplier?.name, 'liveProducts')
    })

    pendingProducts.forEach((product) => {
      const explicit =
        product.supplierName?.trim() || product.supplier?.name?.trim()
      bump(product.supplier_id, explicit, 'pendingProducts')
    })

    return Array.from(map.values())
      .map((row) => ({
        id: row.id,
        name: row.name,
        totalProducts: row.liveProducts + row.pendingProducts,
        liveProducts: row.liveProducts,
        pendingProducts: row.pendingProducts,
        status: (row.liveProducts > 0 ? 'Active' : 'Pending') as DashboardTopSupplier['status'],
      }))
      .sort((a, b) => b.totalProducts - a.totalProducts)
      .slice(0, 5)
  }, [liveProducts, pendingProducts, suppliers])

  const stats = useMemo(() => {
    const listedProducts = liveProducts.length
    const totalProducts = listedProducts + pendingProducts.length
    const rejected = pendingStats.needs_revision ?? 0
    const approved = pendingStats.approved ?? pendingProducts.filter((p) => p.approval_status === 'approved').length
    const reviewedTotal = approved + rejected
    const rejectionRate = reviewedTotal > 0 ? (rejected / reviewedTotal) * 100 : 0
    const activeSuppliers = suppliers.filter((s) => s.account_status === 'active').length
    const pendingApprovals =
      pendingStats.awaiting_review ??
      pendingProducts.filter(
        (p) => p.approval_status === 'submitted' || p.approval_status === 'under_review',
      ).length

    return {
      totalProducts,
      gmv: liveStatsGmv,
      rejectionRate,
      pendingApprovals,
      activeSuppliers,
      listedProducts,
    }
  }, [liveProducts, pendingProducts, pendingStats, suppliers, liveStatsGmv])

  const alerts = useMemo<DashboardAlert[]>(() => {
    const nextAlerts: DashboardAlert[] = []
    if (stats.rejectionRate >= 15) {
      nextAlerts.push({
        title: 'High Product Rejection Rate',
        description: `Rejection rate is ${stats.rejectionRate.toFixed(1)}%, review product quality checks.`,
        severity: 'danger',
      })
    }
    nextAlerts.push({
      title: 'Pending Product Approvals',
      description: `${stats.pendingApprovals} products awaiting admin action.`,
      severity: stats.pendingApprovals > 10 ? 'warning' : 'info',
    })
    nextAlerts.push({
      title: 'Active Supplier Coverage',
      description: `${stats.activeSuppliers} suppliers are currently active on the platform.`,
      severity: 'info',
    })
    return nextAlerts
  }, [stats])

  return {
    loading,
    error,
    stats,
    trendData,
    topSuppliers,
    alerts,
  }
}
