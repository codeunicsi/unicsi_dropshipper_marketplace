'use client'

import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

const SERVICEABILITY_BASE = 'admin/logistics/serviceability'

export interface ServiceabilityRow {
  id: string
  courier_id: string
  pincode: string
  state: string | null
  is_serviceable: boolean
  cod_available: boolean
  courier?: { courier_id: string; name: string; code: string }
  created_at?: string
  updated_at?: string
}

export interface ServiceabilityCheckResult {
  courier_id: string
  courier_name?: string
  courier_code?: string
  pincode: string
  state: string | null
  is_serviceable: boolean
  cod_available: boolean
}

export interface ServiceabilityUploadRow {
  courier_id: string
  pincode: string
  is_serviceable?: boolean
  cod_available?: boolean
  state?: string
}

export function useServiceability() {
  const [list, setList] = useState<ServiceabilityRow[]>([])
  const [checkResult, setCheckResult] = useState<ServiceabilityCheckResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchList = useCallback(async (params?: { courier_id?: string; pincode?: string; state?: string; limit?: number }) => {
    setLoading(true)
    setError(null)
    try {
      const search = new URLSearchParams()
      if (params?.courier_id) search.set('courier_id', params.courier_id)
      if (params?.pincode) search.set('pincode', params.pincode)
      if (params?.state) search.set('state', params.state)
      if (params?.limit) search.set('limit', String(params.limit))
      const qs = search.toString()
      const res = await apiClient.get(`${SERVICEABILITY_BASE}${qs ? `?${qs}` : ''}`)
      const data = res?.data ?? []
      setList(Array.isArray(data) ? data : [])
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch serviceability'
      setError(message)
      setList([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const check = useCallback(async (pincode: string, courierId?: string) => {
    setLoading(true)
    setError(null)
    setCheckResult(null)
    try {
      const search = new URLSearchParams({ pincode: pincode.trim() })
      if (courierId) search.set('courier_id', courierId)
      const res = await apiClient.get(`${SERVICEABILITY_BASE}/check?${search.toString()}`)
      const data = res?.data ?? []
      setCheckResult(Array.isArray(data) ? data : [])
      return data as ServiceabilityCheckResult[]
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check serviceability'
      setError(message)
      setCheckResult([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const upload = useCallback(async (rows: ServiceabilityUploadRow[]) => {
    setError(null)
    try {
      const res = await apiClient.post(`${SERVICEABILITY_BASE}/upload`, rows)
      return (res?.data ?? { processed: 0, total: 0, skipped: 0 }) as {
        processed: number
        total: number
        skipped?: number
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      throw err
    }
  }, [])

  const serviceableCount = list.filter((r) => r.is_serviceable).length

  return {
    list,
    checkResult,
    loading,
    error,
    serviceableCount,
    totalCount: list.length,
    fetchList,
    check,
    upload,
  }
}
