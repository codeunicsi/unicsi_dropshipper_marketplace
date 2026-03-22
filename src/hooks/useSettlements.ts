'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const SETTLEMENTS_BASE = 'admin/payouts/settlements'

export interface SettlementStats {
  total_gmv: number
  total_payouts: number
  platform_revenue: number
  reconciliation_rate: number
}

export interface SettlementRow {
  settlement_id: string
  entity_type: string
  entity_id: string
  entity_name: string
  amount: number
  settlement_status: string
  bank_reference: string | null
  settlement_date: string | null
  created_at: string
}

export interface SettlementFilters {
  entity_type?: string
  status?: string
  date_from?: string
  date_to?: string
}

export function useSettlementStats() {
  return useQuery({
    queryKey: ['settlement-stats'],
    queryFn: async () => {
      const res = await apiClient.get(`${SETTLEMENTS_BASE}/stats`)
      return res.data as SettlementStats
    },
  })
}

export function useSettlementList(filters: SettlementFilters = {}) {
  const params = new URLSearchParams()
  if (filters.entity_type) params.set('entity_type', filters.entity_type)
  if (filters.status) params.set('status', filters.status)
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  const qs = params.toString()

  return useQuery({
    queryKey: ['settlement-list', filters],
    queryFn: async () => {
      const res = await apiClient.get(`${SETTLEMENTS_BASE}${qs ? `?${qs}` : ''}`)
      return res.data as SettlementRow[]
    },
  })
}
