'use client'

import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

const COD_BASE = 'admin/logistics/cod'

export interface CODSettingsData {
  id?: string
  scope?: string
  max_cod_limit_per_order: number
  cod_commission_pct: number
  cod_fee_per_order: number
  failed_cod_fee: number
  chargeback_fee_pct: number | null
  updated_at?: string
}

export interface CODSettingsPayload {
  max_cod_limit_per_order: number
  cod_commission_pct: number
  cod_fee_per_order: number
  failed_cod_fee: number
  chargeback_fee_pct?: number | null
}

export function useCODSettings() {
  const [settings, setSettings] = useState<CODSettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get(COD_BASE)
      const data = res?.data
      setSettings(data ?? null)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch COD settings'
      setError(message)
      setSettings(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = useCallback(async (payload: CODSettingsPayload) => {
    setError(null)
    const res = await apiClient.put(COD_BASE, payload)
    const data = res?.data
    if (data) setSettings(data)
    return data
  }, [])

  return { settings, loading, error, fetchSettings, updateSettings }
}
