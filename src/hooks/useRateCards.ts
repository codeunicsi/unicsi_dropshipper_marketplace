'use client'

import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

const RATES_BASE = 'admin/logistics/rates'

export type RateZone = 'metro' | 'tier1' | 'regional' | 'remote'

export interface RateCard {
  id: string
  courier_id: string
  zone: RateZone
  weight_slab_min_kg: string
  weight_slab_max_kg: string
  prepaid_rate: string
  cod_rate: string
  effective_from: string | null
  effective_to: string | null
  courier?: { courier_id: string; name: string; code: string }
  created_at?: string
  updated_at?: string
}

export interface RateCardPayload {
  courier_id: string
  zone: RateZone
  weight_slab_min_kg: number
  weight_slab_max_kg: number
  prepaid_rate: number
  cod_rate: number
  effective_from?: string | null
  effective_to?: string | null
}

export interface CalculateResult {
  rate: number
  currency: string
  courier_id: string
  courier_name?: string
  zone: string
  weight_kg: number
  is_cod: boolean
  slab: { min_kg: string; max_kg: string }
}

export function useRateCards() {
  const [list, setList] = useState<RateCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchList = useCallback(async (params?: { courier_id?: string; zone?: string; limit?: number }) => {
    setLoading(true)
    setError(null)
    try {
      const search = new URLSearchParams()
      if (params?.courier_id) search.set('courier_id', params.courier_id)
      if (params?.zone) search.set('zone', params.zone)
      if (params?.limit) search.set('limit', String(params.limit))
      const qs = search.toString()
      const res = await apiClient.get(`${RATES_BASE}${qs ? `?${qs}` : ''}`)
      const data = res?.data ?? []
      const arr = Array.isArray(data) ? data : []
      setList(arr)
      return arr
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch rate cards'
      setError(message)
      setList([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createRateCard = useCallback(async (payload: RateCardPayload) => {
    const res = await apiClient.post(RATES_BASE, payload)
    const created = res?.data
    if (created) setList((prev) => [...prev, created].sort((a, b) => a.zone.localeCompare(b.zone)))
    return created
  }, [])

  const updateRateCard = useCallback(async (id: string, payload: Partial<RateCardPayload>) => {
    const res = await apiClient.put(`${RATES_BASE}/${id}`, payload)
    const updated = res?.data
    if (updated) setList((prev) => prev.map((r) => (r.id === id ? updated : r)))
    return updated
  }, [])

  const calculate = useCallback(
    async (
      courierId: string,
      zone: RateZone,
      weightKg: number,
      isCod: boolean,
      pincode?: string
    ): Promise<CalculateResult | null> => {
      const search = new URLSearchParams({
        courier_id: courierId,
        zone,
        weight_kg: String(weightKg),
        is_cod: String(isCod),
      })
      if (pincode?.trim()) search.set('pincode', pincode.trim())
      const res = await apiClient.get(`${RATES_BASE}/calculate?${search.toString()}`)
      return res?.data ?? null
    },
    []
  )

  return {
    list,
    loading,
    error,
    fetchList,
    createRateCard,
    updateRateCard,
    calculate,
  }
}
