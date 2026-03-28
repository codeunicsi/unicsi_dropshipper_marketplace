'use client'

import { useState, useEffect, useCallback } from 'react'

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export function useKYCVerifications() {
    const [documents, setDocuments] = useState<KYCDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchKYCData = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await fetch(`${API_BASE_URL}admin/get-all-kyc-verifications`, {
                    credentials: 'include',
                })

                if (!response.ok) {
                    throw new Error(`Failed to fetch KYC data: ${response.statusText}`)
                }

                const data = await response.json()

                console.log("kyc-details", data)

                // Transform backend data to KYCDocument format
                const transformedDocuments: KYCDocument[] = data.data.map((supplier: any) => ({
                    id: supplier.supplier_id,
                    supplierId: supplier.supplier_id,
                    supplierName: supplier.name,
                    email: supplier.email,
                    phone: supplier.number || 'N/A',
                    accountStatus: supplier.account_status,
                    documentType: 'KYC_VERIFICATION',
                    gstDetails: supplier.gst_details,
                    submittedAt: supplier.createdAt,
                    status: supplier.kyc_details.status,
                    verifiedAt: undefined,
                    rejectionReason: undefined,
                }))

                setDocuments(transformedDocuments)
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
            const response = await fetch(`${API_BASE_URL}admin/supplier-verify`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    supplier_id: documentId,
                    status: 'verified',
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to verify document')
            }

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
            const response = await fetch(`${API_BASE_URL}admin/supplier/kyc/reject`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    supplier_id: documentId,
                    status: 'rejected',
                    rejection_reason: reason,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to reject document')
            }

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
