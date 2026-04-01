'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

export interface LiveProduct {
  id: string
  product_id: string
  supplier_id: string
  supplier: {
    name: string
  }
  title: string
  description: string
  category: string
  brand: string
  sku: string
  price: number
  stock: number
  rating: number
  reviews_count: number
  images: string[]
  status: 'live' | 'out_of_stock'
  created_at: string
  updated_at: string
  gmv?: number
  variants: {
    id: string
    product_id: string
    sku: string
    category: string
    variant_price: number
    variant_stock: number
    variant_images: string[]
  }[]
  approval_status: string
  lifecycle_status?: 'active' | 'inactive' | 'paused' | 'archived'
}

export interface LiveProductsStats {
  total_active: number
  total_gmv: number
  conversion_rate: number
  new_this_week: number
}

export function useLiveProducts(page = 1, limit = 20) {
  const [products, setProducts] = useState<LiveProduct[]>([])
  const [stats, setStats] = useState<LiveProductsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const productsData = await apiClient.get('admin/products/get-live-products')
        console.log(productsData?.data)
        setProducts(productsData?.data || [])
        setTotal(productsData?.data?.length || 0)

        try {
          const statsData = await apiClient.get('admin/products/live/stats')
          setStats(statsData.data ?? statsData)
        } catch {
          // stats optional
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch live products'
        setError(errorMessage)
        console.error('[v0] Live products fetch error:', errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchLiveProducts()
  }, [page, limit])

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await apiClient.delete(`admin/products/${productId}`)

      setProducts((prev) => prev.filter((p) => (p.id ?? p.product_id) !== productId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product'
      console.error('[v0] Delete product error:', errorMessage)
    }
  }, [])

  const updateProductStatus = useCallback(
    async (productId: string, status: 'live' | 'out_of_stock') => {
      try {
        await apiClient.put(`admin/products/${productId}/status`, { status })

        const nextLifecycle = status === 'live' ? 'active' : 'paused'
        setProducts((prev) =>
          prev.map((p) =>
            (p.id ?? p.product_id) === productId
              ? { ...p, status, lifecycle_status: nextLifecycle }
              : p
          ),
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update product status'
        console.error('[v0] Update product status error:', errorMessage)
      }
    },
    [],
  )

  const updateProduct = useCallback(
    async (productId: string, updates: Partial<LiveProduct>) => {
      await apiClient.put('admin/products/update-product', {
        product_id: productId,
        ...updates,
      })
      setProducts((prev) =>
        prev.map((p) =>
          (p.id ?? p.product_id) === productId ? { ...p, ...updates } : p
        ),
      )
    },
    [],
  )

  return {
    products,
    stats,
    loading,
    error,
    total,
    deleteProduct,
    updateProductStatus,
    updateProduct,
  }
}
