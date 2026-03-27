'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Product, ProductVariant } from '@/hooks/marketplace/useProduct'
import type { DashboardAlert, DashboardTopSupplier, DashboardTrendPoint } from '@/hooks/useAdminDashboard'
import { API_BASE_URL } from '@/lib/api-client'

/** Labels for `StatsGrid` (same shape as admin). */
export const PARTNER_STATS_LABELS = [
  'Synced products',
  'Est. catalog value',
  'Out-of-stock SKUs %',
  'Low-stock SKUs',
  'Suppliers',
  'Active listings',
] as const

export const PARTNER_STATS_HINTS = [
  'From Shopify catalog',
  'Sum of price × on-hand qty',
  'Share of all variants',
  'Variants with 1–5 units',
  'Unique supplier IDs',
  'Products with active lifecycle',
] as const

function parsePrice(v: string | undefined) {
  const n = parseFloat(v ?? '0')
  return Number.isFinite(n) ? n : 0
}

function variantRows(products: Product[]) {
  const rows: { variant: ProductVariant; supplierId: string; createdAt: string }[] = []
  products.forEach((p) => {
    p.variants?.forEach((v) => {
      rows.push({ variant: v, supplierId: p.supplier_id, createdAt: p.createdAt })
    })
  })
  return rows
}

const lastNDaysKeys = (days: number) => {
  const keys: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    keys.push(d.toISOString().slice(0, 10))
  }
  return keys
}

const toDayKey = (iso?: string) => {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

export function usePartnerDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const base = API_BASE_URL.replace(/\/$/, '') + '/'
        const res = await fetch(`${base}dropshipper/shopify/get-products`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg = typeof json?.message === 'string' ? json.message : res.statusText
          throw new Error(msg || 'Failed to load catalog')
        }
        const list = Array.isArray(json?.data) ? (json.data as Product[]) : []
        if (!cancelled) setProducts(list)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load analytics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const rows = variantRows(products)
    let catalogValue = 0
    let oos = 0
    let lowStock = 0
    const totalVariants = rows.length || 1

    rows.forEach(({ variant: v }) => {
      const qty = v.inventory_quantity ?? 0
      const price = parsePrice(v.price)
      catalogValue += price * qty
      if (qty === 0) oos += 1
      else if (qty > 0 && qty <= 5) lowStock += 1
    })

    const supplierIds = new Set(products.map((p) => p.supplier_id).filter(Boolean))
    const activeListings = products.filter(
      (p) => String(p.lifecycle_status).toLowerCase() === 'active',
    ).length

    return {
      totalProducts: products.length,
      gmv: catalogValue,
      rejectionRate: (oos / totalVariants) * 100,
      pendingApprovals: lowStock,
      activeSuppliers: supplierIds.size,
      listedProducts: activeListings || products.length,
    }
  }, [products])

  const trendData = useMemo<DashboardTrendPoint[]>(() => {
    const dayKeys = lastNDaysKeys(7)
    const map = new Map<string, DashboardTrendPoint>(
      dayKeys.map((key) => [
        key,
        {
          date: new Date(`${key}T00:00:00`).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          submissions: 0,
          approved: 0,
          rejected: 0,
        },
      ]),
    )

    products.forEach((p) => {
      const key = toDayKey(p.createdAt)
      if (!key || !map.has(key)) return
      const pt = map.get(key)
      if (!pt) return
      pt.submissions += 1
    })

    return dayKeys.map((k) => map.get(k)!)
  }, [products])

  const topSuppliers = useMemo<DashboardTopSupplier[]>(() => {
    const byId = new Map<string, number>()
    products.forEach((p) => {
      const id = p.supplier_id
      if (!id) return
      byId.set(id, (byId.get(id) ?? 0) + 1)
    })
    return Array.from(byId.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({
        id: `id:${id}`,
        name: `Supplier ${id.slice(0, 8)}…`,
        totalProducts: count,
        liveProducts: count,
        pendingProducts: 0,
        status: 'Active' as const,
      }))
  }, [products])

  const alerts = useMemo<DashboardAlert[]>(() => {
    const rows = variantRows(products)
    const oos = rows.filter((r) => (r.variant.inventory_quantity ?? 0) === 0).length
    const low = rows.filter(
      (r) => (r.variant.inventory_quantity ?? 0) > 0 && (r.variant.inventory_quantity ?? 0) <= 5,
    ).length
    const out: DashboardAlert[] = []
    if (oos > 0) {
      out.push({
        title: 'Out-of-stock SKUs',
        description: `${oos} variant${oos === 1 ? '' : 's'} have zero inventory. Consider restocking or pausing listings.`,
        severity: 'warning',
      })
    }
    if (low > 0) {
      out.push({
        title: 'Low inventory',
        description: `${low} variant${low === 1 ? '' : 's'} are at 5 units or below.`,
        severity: 'info',
      })
    }
    if (products.length === 0 && !loading && !error) {
      out.push({
        title: 'No synced products yet',
        description: 'Connect your store and sync products from Shopify to see analytics here.',
        severity: 'info',
      })
    }
    return out
  }, [products, loading, error])

  return {
    loading,
    error,
    stats,
    trendData,
    topSuppliers,
    alerts,
  }
}
