'use client'

import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

const BASE = 'admin/platform-collection-account'

export interface PlatformCollectionAccountData {
  bankId: string | null
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  branchName: string
  upiId: string
  qrCode: string
  updatedAt?: string
}

/** Bank/UPI fields only; QR is updated via multipart upload (same storage as supplier product images). */
export interface PlatformCollectionAccountPayload {
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  branchName: string
  upiId: string
}

export function usePlatformCollectionAccount() {
  const [account, setAccount] = useState<PlatformCollectionAccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccount = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get(BASE)
      const data = res?.data
      setAccount(data ?? null)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load platform payment details'
      setError(message)
      setAccount(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccount()
  }, [fetchAccount])

  const saveAccount = useCallback(async (payload: PlatformCollectionAccountPayload) => {
    setError(null)
    const res = await apiClient.put(BASE, payload)
    const data = res?.data
    if (data) setAccount(data)
    return data
  }, [])

  const uploadQr = useCallback(async (file: File) => {
    setError(null)
    const formData = new FormData()
    formData.append('qrCode', file)
    const res = await apiClient.postForm(`${BASE}/qr`, formData)
    const data = res?.data
    if (data) setAccount(data)
    return data
  }, [])

  /** Deletes the whole saved row: bank, UPI, and QR URL. */
  const deleteAllDetails = useCallback(async () => {
    setError(null)
    const res = await apiClient.delete(BASE)
    const data = res?.data
    setAccount(
      data ?? {
        bankId: null,
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        upiId: '',
        qrCode: '',
      }
    )
    return data
  }, [])

  return { account, loading, error, fetchAccount, saveAccount, uploadQr, deleteAllDetails }
}
