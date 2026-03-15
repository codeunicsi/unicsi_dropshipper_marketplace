'use client'

import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

const AWB_BASE = 'admin/logistics/awb'

export interface AwbRow {
  id: string
  courier_id: string
  awb_number: string
  status: 'available' | 'assigned' | 'used'
  fulfillment_id: string | null
  assigned_at: string | null
  courier?: { courier_id: string; name: string; code: string }
  created_at?: string
}

export interface AwbListResponse {
  data: AwbRow[]
  pagination: { page: number; limit: number; total: number }
}

export function useAWB() {
  const [list, setList] = useState<AwbRow[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchList = useCallback(async (params?: { status?: string; courier_id?: string; search?: string; page?: number; limit?: number }) => {
    setLoading(true)
    setError(null)
    try {
      const search = new URLSearchParams()
      if (params?.status) search.set('status', params.status)
      if (params?.courier_id) search.set('courier_id', params.courier_id)
      if (params?.search) search.set('search', params.search)
      if (params?.page) search.set('page', String(params.page))
      if (params?.limit) search.set('limit', String(params.limit))
      const qs = search.toString()
      const res = await apiClient.get(`${AWB_BASE}${qs ? `?${qs}` : ''}`) as AwbListResponse
      const data = res?.data ?? []
      const pag = res?.pagination ?? { page: 1, limit: 50, total: 0 }
      setList(Array.isArray(data) ? data : [])
      setPagination(pag)
      return res
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch AWB list'
      setError(message)
      setList([])
      setPagination({ page: 1, limit: 50, total: 0 })
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const generate = useCallback(async (courierId: string, count: number) => {
    const res = await apiClient.post(`${AWB_BASE}/generate`, { courier_id: courierId, count })
    return res?.data ?? { generated: 0, awbs: [] }
  }, [])

  const assign = useCallback(async (awbNumber: string, fulfillmentId: string) => {
    const res = await apiClient.post(`${AWB_BASE}/assign`, { awb_number: awbNumber, fulfillment_id: fulfillmentId })
    return res?.data
  }, [])

  const track = useCallback(async (trackingIdOrAwb: string) => {
    const res = await apiClient.get(`${AWB_BASE}/track?tracking_id=${encodeURIComponent(trackingIdOrAwb)}`)
    return res?.data ?? null
  }, [])

  return {
    list,
    pagination,
    loading,
    error,
    totalCount: pagination.total,
    fetchList,
    generate,
    assign,
    track,
  }
}
