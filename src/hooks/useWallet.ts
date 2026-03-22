'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const WALLET_BASE = 'admin/payouts/wallet'

export interface WalletStats {
  total_wallet_balance: number
  supplier_wallets_total: number
  partner_wallets_total: number
  active_wallets: number
}

export interface WalletRow {
  entity_type: string
  entity_id: string
  entity_name: string
  available_balance: number
  pending_balance: number
  last_activity: string | null
}

export function useWalletStats() {
  return useQuery({
    queryKey: ['wallet-stats'],
    queryFn: async () => {
      const res = await apiClient.get(`${WALLET_BASE}/stats`)
      return res.data as WalletStats
    },
  })
}

export function useWalletList() {
  return useQuery({
    queryKey: ['wallet-list'],
    queryFn: async () => {
      const res = await apiClient.get(WALLET_BASE)
      return res.data as WalletRow[]
    },
  })
}
