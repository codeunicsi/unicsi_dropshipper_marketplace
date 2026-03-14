'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ProductVariant {
  variant_id: string
  product_id: string
  sku: string
  variant_name: string
  variant_price: string
  variant_stock: number
  attributes: {
    size?: string
    color?: string
    [key: string]: string | undefined
  }
  weight_grams: number
  dimensions_cm: {
    h: number
    l: number
    w: number
  }
  hsn_code: string
  is_active: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  sort_order: number
  createdAt: string
  updatedAt: string
}

export interface PendingProduct {
  product_id: string
  supplier_id: string
  title: string
  description: string
  category_id: string | null
  brand: string
  approval_status: 'submitted' | 'under_review' | 'approved' | 'rejected'
  lifecycle_status: 'active' | 'inactive'
  approved_by?: string
  approved_at?: string
  createdAt: string
  updatedAt: string
  imageCount: string
  variants: ProductVariant[]
  images: ProductImage[]
  supplierName?: string
}

export interface PendingProductsStats {
  total: number
  awaiting_review: number
  needs_revision: number
  approved?: number
  avg_review_time: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export function usePendingProducts() {
  const [products, setProducts] = useState<PendingProduct[]>([])
  const [statsFromApi, setStatsFromApi] = useState<PendingProductsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPendingProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const base = (API_BASE_URL || '').replace(/\/$/, '') + '/'
        const [productsResponse, statsResponse] = await Promise.all([
          fetch(`${base}admin/products/get-pending-products`),
          fetch(`${base}admin/products/pending/stats`),
        ])

        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch pending products: ${productsResponse.statusText}`)
        }

        const data = await productsResponse.json()
        console.log(data?.data)
        setProducts(data?.data || [])

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          const s = statsData?.data ?? statsData
          if (s && typeof s.awaiting_review === 'number') {
            setStatsFromApi({
              total: s.total ?? 0,
              awaiting_review: s.awaiting_review,
              needs_revision: s.needs_revision ?? 0,
              approved: s.approved ?? 0,
              avg_review_time: s.avg_review_time ?? 2.3,
            })
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pending products'
        setError(errorMessage)
        console.error('[v0] Pending products fetch error:', errorMessage)
        // Mock data for development
        setProducts([
          {
            product_id: '01503046-aa8b-46d9-9b46-b87f67d62a9e',
            supplier_id: 'e0eb3837-5039-4fb1-b36e-f3bf1a5e8182',
            title: 'Premium Pajama Set',
            description: 'Comfortable and stylish pajama set for all seasons',
            category_id: 'cat-123',
            brand: 'Nike',
            approval_status: 'submitted',
            lifecycle_status: 'inactive',
            createdAt: '2026-01-30T07:49:35.058Z',
            updatedAt: '2026-01-30T07:49:35.058Z',
            imageCount: '1',
            variants: [
              {
                variant_id: '0e1e674d-22da-43d4-a349-c86f1a3ed150',
                product_id: '01503046-aa8b-46d9-9b46-b87f67d62a9e',
                sku: 'pan-rs',
                variant_name: 'Black M',
                variant_price: '1200',
                variant_stock: 100,
                attributes: {
                  size: 'M',
                  color: 'Black',
                },
                weight_grams: 500,
                dimensions_cm: { h: 30, l: 20, w: 10 },
                hsn_code: '4134',
                is_active: true,
                createdAt: '2026-01-30T07:49:35.144Z',
                updatedAt: '2026-01-30T07:50:05.849Z',
              },
            ],
            images: [
              {
                id: 'b6bcaed9-43b6-4d72-b99d-a787ab886529',
                product_id: '01503046-aa8b-46d9-9b46-b87f67d62a9e',
                image_url: 'http://localhost:8000/uploads/images/1769759375050-868282803.jpeg',
                sort_order: 0,
                createdAt: '2026-01-30T07:49:35.239Z',
                updatedAt: '2026-01-30T07:49:35.239Z',
              },
            ],
            supplierName: 'Tech Supplies Inc.',
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchPendingProducts()
  }, [])

  const refetchStats = useCallback(async () => {
    const base = (API_BASE_URL || '').replace(/\/$/, '') + '/'
    try {
      const r = await fetch(`${base}admin/products/pending/stats`)
      if (r.ok) {
        const d = await r.json()
        const s = d?.data ?? d
        if (s && typeof s.awaiting_review === 'number') {
          setStatsFromApi({
            total: s.total ?? 0,
            awaiting_review: s.awaiting_review,
            needs_revision: s.needs_revision ?? 0,
            approved: s.approved ?? 0,
            avg_review_time: s.avg_review_time ?? 2.3,
          })
        }
      }
    } catch (_) {}
  }, [])

  const approveProduct = useCallback(async (productId: string) => {
    try {
      const base = (API_BASE_URL || '').replace(/\/$/, '') + '/'
      const response = await fetch(`${base}admin/products/${productId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        throw new Error('Failed to approve product')
      }

      setProducts((prev) =>
        prev.map((product) =>
          product.product_id === productId
            ? { ...product, approval_status: 'approved', lifecycle_status: 'active' }
            : product,
        ),
      )
      await refetchStats()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve product'
      console.error('[v0] Approval error:', errorMessage)
      throw err
    }
  }, [refetchStats])

  const rejectProduct = useCallback(async (productId: string, reason: string) => {
    try {
      const base = (API_BASE_URL || '').replace(/\/$/, '') + '/'
      const response = await fetch(`${base}admin/products/${productId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejection_reason: reason,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject product')
      }

      setProducts((prev) =>
        prev.map((product) =>
          product.product_id === productId
            ? { ...product, approval_status: 'rejected', lifecycle_status: 'inactive' }
            : product,
        ),
      )
      await refetchStats()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject product'
      console.error('[v0] Rejection error:', errorMessage)
      throw err
    }
  }, [refetchStats])

  const updateProduct = useCallback(async (productId: string, updates: Partial<PendingProduct>) => {
    try {
      const base = (API_BASE_URL || '').replace(/\/$/, '') + '/'
      const response = await fetch(`${base}admin/products/update-product`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          ...updates,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      setProducts((prev) =>
        prev.map((product) =>
          product.product_id === productId ? { ...product, ...updates } : product,
        ),
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product'
      console.error('[v0] Update error:', errorMessage)
      throw err
    }
  }, [])

  const getStats = useCallback((): PendingProductsStats => {
    if (statsFromApi) return statsFromApi
    return {
      total: products.length,
      awaiting_review: products.filter((p) => p.approval_status === 'submitted').length,
      needs_revision: products.filter((p) => p.approval_status === 'rejected').length,
      approved: products.filter((p) => p.approval_status === 'approved').length,
      avg_review_time: 2.3,
    }
  }, [products, statsFromApi])

  return {
    products,
    loading,
    error,
    stats: getStats(),
    approveProduct,
    rejectProduct,
    updateProduct,
  }
}
