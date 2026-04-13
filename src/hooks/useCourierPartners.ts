'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

export type CoverageType = 'metro' | 'regional' | 'pan_india' | null

export interface CourierPartner {
  courier_id: string
  name: string
  code: string
  is_active: boolean
  support_cod: boolean
  coverage_type: CoverageType
  access_token?: string | null
  secret_key?: string | null
  pickup_address_id?: string | null
  created_at: string
  updated_at: string
}

export interface CourierPartnerPayload {
  name: string
  code: string
  access_token?: string | null
  secret_key?: string | null
  pickup_address_id?: string | null
}

const BASE = 'admin/logistics/partners'

export function useCourierPartners(activeOnly?: boolean) {
  const [partners, setPartners] = useState<CourierPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const url = activeOnly ? `${BASE}?active_only=true` : BASE
      const res = await apiClient.get(url)
      const data = res?.data ?? []
      setPartners(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch courier partners'
      setError(message)
      setPartners([])
    } finally {
      setLoading(false)
    }
  }, [activeOnly])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const createPartner = useCallback(
    async (payload: CourierPartnerPayload): Promise<CourierPartner> => {
      const res = await apiClient.post(BASE, payload)
      const created = res?.data
      if (created) setPartners((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      return created
    },
    []
  )

  const updatePartner = useCallback(
    async (courierId: string, payload: Partial<CourierPartnerPayload>): Promise<CourierPartner> => {
      const res = await apiClient.put(`${BASE}/${courierId}`, payload)
      const updated = res?.data
      if (updated) {
        setPartners((prev) =>
          prev.map((p) => (p.courier_id === courierId ? updated : p)).sort((a, b) => a.name.localeCompare(b.name))
        )
      }
      return updated
    },
    []
  )

  const setPartnerStatus = useCallback(async (courierId: string, isActive: boolean): Promise<CourierPartner> => {
    const res = await apiClient.put(`${BASE}/${courierId}/status`, { is_active: isActive })
    const updated = res?.data
    if (updated) {
      setPartners((prev) =>
        prev.map((p) => (p.courier_id === courierId ? updated : p)).sort((a, b) => a.name.localeCompare(b.name))
      )
    }
    return updated
  }, [])

  const activeCount = partners.filter((p) => p.is_active).length

  return {
    partners,
    loading,
    error,
    activeCount,
    totalCount: partners.length,
    refetch: fetchPartners,
    createPartner,
    updatePartner,
    setPartnerStatus,
  }
}
