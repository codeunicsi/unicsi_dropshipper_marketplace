'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const PAYOUTS_BASE = 'admin/payouts/partners'

export interface PartnerPayoutStats {
  paid_this_month: number
  pending_payouts: number
  partners_paid: number
  on_time_rate: number
}

export interface PartnerPayoutRow {
  reseller_id: string
  name: string | null
  email: string | null
  phone_number: string | null
  status: string
  rto_score: number
  has_bank_details: boolean
  last_settlement_date: string | null
  last_settlement_amount: number | null
  last_settlement_status: string | null
  available_balance: number
}

export function usePartnerPayoutStats() {
  return useQuery({
    queryKey: ['partner-payout-stats'],
    queryFn: async () => {
      const res = await apiClient.get(`${PAYOUTS_BASE}/stats`)
      return res.data as PartnerPayoutStats
    },
  })
}

export function usePartnerPayoutList() {
  return useQuery({
    queryKey: ['partner-payout-list'],
    queryFn: async () => {
      const res = await apiClient.get(PAYOUTS_BASE)
      return res.data as PartnerPayoutRow[]
    },
  })
}
