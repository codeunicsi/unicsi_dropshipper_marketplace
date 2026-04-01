'use client'

import { useCallback, useState } from 'react'
import { apiClient } from '@/lib/api-client'

const BASE = 'admin/bulk-orders'

export type BulkPaymentFilter = '' | 'PROOF_SUBMITTED' | 'VERIFIED' | 'REJECTED'

export interface AdminBulkOrderPaymentProof {
  paymentId: string
  paymentMode: string
  amount: number
  screenshotUrl: string | null
  verificationStatus: string
  rejectedReason: string | null
  createdAt?: string
}

export interface AdminBulkOrderRow {
  orderId: string
  invoiceNumber: string | null
  productId: string | null
  productTitle: string | null
  supplierId: string | null
  resellerId: string | null
  resellerUserId?: string | null
  resellerName?: string | null
  quantity: number | null
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  deliveryAddress: string | null
  totalPayable: string | number | null
  orderStatus: string | null
  paymentStatus: string | null
  /** Display label from backend (UPI, Bank transfer). */
  paymentType?: string | null
  fulfillmentStatus?: string | null
  reviewStage?: string | null
  transactionReference: string | null
  submittedAt?: string
  paymentProof: AdminBulkOrderPaymentProof | null
}

export interface BulkOrdersListResult {
  count: number
  page: number
  limit: number
  orders: AdminBulkOrderRow[]
}

/** Matches backend rules for PATCH verify/reject (pending proof + order still in proof-submitted stage). */
export function isAwaitingBulkReview(row: AdminBulkOrderRow): boolean {
  return (
    row.paymentStatus === 'PROOF_SUBMITTED' &&
    row.paymentProof?.verificationStatus === 'pending'
  )
}

export function useBulkOrdersAdmin() {
  const [data, setData] = useState<BulkOrdersListResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(
    async (opts: {
      paymentStatus?: BulkPaymentFilter
      page?: number
      limit?: number
      search?: string
    }) => {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (opts.paymentStatus) params.set('paymentStatus', opts.paymentStatus)
      if (opts.search?.trim()) params.set('search', opts.search.trim())
      params.set('page', String(opts.page ?? 1))
      params.set('limit', String(opts.limit ?? 20))
      const qs = params.toString()
      try {
        const res = await apiClient.get(`${BASE}?${qs}`)
        const inner = res?.data as BulkOrdersListResult | undefined
        if (inner && Array.isArray(inner.orders)) {
          setData(inner)
          return inner
        }
        setData(null)
        return null
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load bulk orders'
        setError(msg)
        setData(null)
        return null
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const verifyPayment = useCallback(async (orderId: string, transactionReference?: string) => {
    const body =
      transactionReference && transactionReference.trim()
        ? { transactionReference: transactionReference.trim() }
        : {}
    return apiClient.put(`${BASE}/${orderId}/verify-payment`, body)
  }, [])

  const rejectPayment = useCallback(async (orderId: string, reason: string) => {
    return apiClient.put(`${BASE}/${orderId}/reject-payment`, { reason: reason.trim() })
  }, [])

  return { data, loading, error, fetchOrders, verifyPayment, rejectPayment }
}
