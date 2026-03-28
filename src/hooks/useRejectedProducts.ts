'use client'

import { useState, useEffect, useCallback } from 'react'

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/'

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
        const base = (API_BASE_URL || '').replace(/\/$/, '') + '/'

        // Fetch rejected products
        const productsResponse = await fetch(
          `${base}admin/products/rejected?page=${page}&limit=${limit}`,
          { credentials: 'include' },
        )

        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch rejected products: ${productsResponse.statusText}`)
        }

        const productsData = await productsResponse.json()
        setProducts(productsData.data || [])
        setTotal(productsData.total || 0)

        // Fetch stats
        const statsResponse = await fetch(`${base}admin/products/rejected/stats`, {
          credentials: 'include',
        })
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.data ?? statsData)
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
    const base = (API_BASE_URL || '').replace(/\/$/, '') + '/'
    const response = await fetch(`${base}admin/products/${productId}`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to fetch product')
    const json = await response.json()
    return json?.data ?? null
  }, [])

  const updateProduct = useCallback(async (productId: string, updates: Record<string, unknown>) => {
    const base = (API_BASE_URL || '').replace(/\/$/, '') + '/'
    const response = await fetch(`${base}admin/products/update-product`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, ...updates }),
    })
    if (!response.ok) throw new Error('Failed to update product')
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
      const base = (API_BASE_URL || '').replace(/\/$/, '') + '/'
      const response = await fetch(
        `${base}admin/products/${productId}/rejected`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error('Failed to delete rejected product')
      }

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
