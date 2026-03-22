'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const TRANSACTIONS_BASE = 'admin/payouts/transactions'

export interface TransactionStats {
  total_transactions: number
  total_value: number
  success_rate: number
  failed_retried: number
}

export interface TransactionRow {
  ledger_id: string
  created_at: string
  reference_type: string
  reference_id: string
  entity_type: string
  entity_id: string | null
  entity_name: string
  transaction_type: string
  amount: number
  balance_after: number | null
  description: string | null
}

export interface TransactionFilters {
  entity_type?: string
  type?: string
  date_from?: string
  date_to?: string
}

export function useTransactionStats() {
  return useQuery({
    queryKey: ['transaction-stats'],
    queryFn: async () => {
      const res = await apiClient.get(`${TRANSACTIONS_BASE}/stats`)
      return res.data as TransactionStats
    },
  })
}

export function useTransactionList(filters: TransactionFilters = {}) {
  const params = new URLSearchParams()
  if (filters.entity_type) params.set('entity_type', filters.entity_type)
  if (filters.type) params.set('type', filters.type)
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  const qs = params.toString()

  return useQuery({
    queryKey: ['transaction-list', filters],
    queryFn: async () => {
      const res = await apiClient.get(`${TRANSACTIONS_BASE}${qs ? `?${qs}` : ''}`)
      return res.data as TransactionRow[]
    },
  })
}
