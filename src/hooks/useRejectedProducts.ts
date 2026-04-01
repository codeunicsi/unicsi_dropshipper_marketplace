'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

export interface RejectedProduct {
  id: string
  product_id: string
  supplier_id: string
  supplier_name: string
  name: string
  description: string
  category: string
  brand: string
  sku: string
  price: number
  images: string[]
  rejection_reason: string
  rejection_details: string
  rejected_at: string
  resubmit_count: number
  status: 'rejected'
}

export interface RejectionStats {
  total_rejected: number
  resubmitted: number
  avg_rejection_rate: number
  rejection_reasons: {
    [key: string]: number
  }
}

export function useRejectedProducts(page = 1, limit = 20) {
  const [products, setProducts] = useState<RejectedProduct[]>([])
  const [stats, setStats] = useState<RejectionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchRejectedProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const productsData = await apiClient.get(
          `admin/products/rejected?page=${page}&limit=${limit}`,
        )
        setProducts(productsData.data || [])
        setTotal(productsData.total || 0)

        try {
          const statsData = await apiClient.get('admin/products/rejected/stats')
          setStats(statsData.data ?? statsData)
        } catch {
          // stats optional
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rejected products'
        setError(errorMessage)
        console.error('[v0] Rejected products fetch error:', errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchRejectedProducts()
  }, [page, limit])

  const getProductById = useCallback(async (productId: string) => {
    const json = await apiClient.get(`admin/products/${productId}`)
    return json?.data ?? null
  }, [])

  const updateProduct = useCallback(async (productId: string, updates: Record<string, unknown>) => {
    await apiClient.put('admin/products/update-product', {
      product_id: productId,
      ...updates,
    })
    setProducts((prev) =>
      prev.map((p) => {
        if (p.product_id !== productId && p.id !== productId) return p
        return {
          ...p,
          name: (updates.title as string) ?? p.name,
          description: (updates.description as string) ?? p.description,
          brand: (updates.brand as string) ?? p.brand,
        }
      })
    )
  }, [])

  const deleteRejectedProduct = useCallback(async (productId: string) => {
    try {
      await apiClient.delete(`admin/products/${productId}/rejected`)

      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete rejected product'
      console.error('[v0] Delete rejected product error:', errorMessage)
    }
  }, [])

  return {
    products,
    stats,
    loading,
    error,
    total,
    getProductById,
    updateProduct,
    deleteRejectedProduct,
  }
}
