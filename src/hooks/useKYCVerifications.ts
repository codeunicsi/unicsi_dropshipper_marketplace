'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

export interface GSTDetails {
    supplier_gst_info_id: string
    supplier_id: string
    gst_number: string
    gst_name: string
    gst_validity: string
    gst_status: boolean
    gst_image: string
    pan_image: string
    pan_number: string
    andhar_number: string
    andhar_image: string
    created_at: string
    updated_at: string
}

export interface KYCDocument {
    id: string
    supplierId: string
    supplierName: string
    email: string
    phone: string
    accountStatus: 'pending' | 'active' | 'suspended'
    documentType: string
    gstDetails: GSTDetails | null
    submittedAt: string
    status: 'pending' | 'verified' | 'rejected' | 'expired'
    verifiedAt?: string
    rejectionReason?: string
}

export interface KYCVerification {
    pending: number
    verified: number
    rejected: number
    expired: number
}

export function useKYCVerifications() {
    const [documents, setDocuments] = useState<KYCDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchKYCData = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await apiClient.get('admin/get-all-kyc-verifications')

                console.log("kyc-details", data)

                const rows = Array.isArray(data?.data) ? data.data : []

                // Dedupe by supplier_id — API can return duplicate rows (e.g. join quirks), which breaks React keys.
                const bySupplierId = new Map<string, KYCDocument>()
                for (const supplier of rows) {
                    const sid = supplier?.supplier_id
                    if (!sid || bySupplierId.has(sid)) continue

                    const kyc = supplier.kyc_details
                    const rawStatus = kyc?.status
                    const status: KYCDocument['status'] =
                        rawStatus === 'verified' ||
                        rawStatus === 'rejected' ||
                        rawStatus === 'expired' ||
                        rawStatus === 'pending'
                            ? rawStatus
                            : 'pending'

                    bySupplierId.set(sid, {
                        id: sid,
                        supplierId: sid,
                        supplierName: supplier.name ?? '—',
                        email: supplier.email ?? '',
                        phone: supplier.number || 'N/A',
                        accountStatus: supplier.account_status ?? 'pending',
                        documentType: 'KYC_VERIFICATION',
                        gstDetails: supplier.gst_details ?? null,
                        submittedAt: supplier.createdAt ?? supplier.created_at ?? new Date(0).toISOString(),
                        status,
                        verifiedAt: undefined,
                        rejectionReason: undefined,
                    })
                }

                setDocuments(Array.from(bySupplierId.values()))
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch KYC data'
                setError(errorMessage)
                console.error('[v0] KYC fetch error:', errorMessage)
            } finally {
                setLoading(false)
            }
        }

        fetchKYCData()
    }, [])

    const verifyDocument = useCallback(async (documentId: string) => {
        setLoading(true)
        try {
            // Call backend verification API
            await apiClient.post('admin/supplier-verify', {
                supplier_id: documentId,
                status: 'verified',
            })

            setDocuments((prev) =>
                prev.map((doc) =>
                    doc.id === documentId
                        ? {
                            ...doc,
                            status: 'verified' as const,
                            verifiedAt: new Date().toISOString(),
                        }
                        : doc,
                ),
            )
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to verify document'
            console.error('[v0] Verification error:', errorMessage)
        } finally {
            setLoading(false)
        }
    }, [])

    const rejectDocument = useCallback(async (documentId: string, reason: string) => {
        setLoading(true)
        try {
            // Call backend rejection API
            await apiClient.post('admin/supplier/kyc/reject', {
                supplier_id: documentId,
                status: 'rejected',
                rejection_reason: reason,
            })

            setDocuments((prev) =>
                prev.map((doc) =>
                    doc.id === documentId
                        ? {
                            ...doc,
                            status: 'rejected' as const,
                            rejectionReason: reason,
                        }
                        : doc,
                ),
            )
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reject document'
            console.error('[v0] Rejection error:', errorMessage)
        } finally {
            setLoading(false)
        }
    }, [])

    const getStats = useCallback(() => {
        return {
            verified: documents.filter((d) => d.status === 'verified').length,
            pending: documents.filter((d) => d.status === 'pending').length,
            rejected: documents.filter((d) => d.status === 'rejected').length,
            expired: documents.filter((d) => d.status === 'expired').length,
        }
    }, [documents])

    return {
        documents,
        loading,
        error,
        stats: getStats(),
        verifyDocument,
        rejectDocument,
    }
}
