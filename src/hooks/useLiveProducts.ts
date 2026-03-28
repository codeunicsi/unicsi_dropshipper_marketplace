'use client'

import { useState, useEffect, useCallback } from 'react'
import { mapProductsWithNormalizedVariants } from '@/lib/normalizeSupplierVariantsForAdmin'

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/'

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
        const base = (API_BASE_URL || '').replace(/\/$/, '') + '/'

        // Fetch live products
        const productsResponse = await fetch(
          `${base}admin/products/get-live-products`,
          { credentials: 'include' },
        )

        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch live products: ${productsResponse.statusText}`)
        }

        const productsData = await productsResponse.json()
        console.log(productsData?.data)
        setProducts(mapProductsWithNormalizedVariants(productsData?.data || []))
        setTotal(productsData?.data?.length || 0)

        // Fetch stats
        const statsResponse = await fetch(`${base}admin/products/live/stats`, {
          credentials: 'include',
        })
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.data ?? statsData)
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
      const base = (API_BASE_URL || '').replace(/\/$/, '') + '/'
      const response = await fetch(`${base}admin/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      setProducts((prev) => prev.filter((p) => (p.id ?? p.product_id) !== productId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product'
      console.error('[v0] Delete product error:', errorMessage)
    }
  }, [])

  const updateProductStatus = useCallback(
    async (productId: string, status: 'live' | 'out_of_stock') => {
      try {
        const base = (API_BASE_URL || '').replace(/\/$/, '') + '/'
        const response = await fetch(`${base}admin/products/${productId}/status`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        })

        if (!response.ok) {
          throw new Error('Failed to update product status')
        }

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
      const base = (API_BASE_URL || '').replace(/\/$/, '') + '/'
      const response = await fetch(`${base}admin/products/update-product`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, ...updates }),
      })
      if (!response.ok) throw new Error('Failed to update product')
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
