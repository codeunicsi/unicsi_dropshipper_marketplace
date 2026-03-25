'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const PAYOUTS_BASE = 'admin/payouts/suppliers'

export interface SupplierPayoutStats {
  paid_this_month: number
  pending_payouts: number
  suppliers_paid: number
  on_time_rate: number
}

export interface SupplierPayoutRow {
  supplier_id: string
  name: string | null
  email: string | null
  number: string | null
  account_status: string
  has_bank_details: boolean
  last_settlement_date: string | null
  last_settlement_amount: number | null
  last_settlement_status: string | null
  available_balance: number
}

export function useSupplierPayoutStats() {
  return useQuery({
    queryKey: ['supplier-payout-stats'],
    queryFn: async () => {
      const res = await apiClient.get(`${PAYOUTS_BASE}/stats`)
      return res.data as SupplierPayoutStats
    },
  })
}

export function useSupplierPayoutList() {
  return useQuery({
    queryKey: ['supplier-payout-list'],
    queryFn: async () => {
      const res = await apiClient.get(PAYOUTS_BASE)
      return res.data as SupplierPayoutRow[]
    },
  })
}
