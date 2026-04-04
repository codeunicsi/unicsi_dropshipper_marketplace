'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import type { KYCDocument } from '@/hooks/useKYCVerifications'

interface KYCDocumentModalProps {
  document: KYCDocument | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerify: (documentId: string) => Promise<void>
  onReject: (documentId: string, reason: string) => Promise<void>
  loading: boolean
}

export function KYCDocumentModal({
  document,
  open,
  onOpenChange,
  onVerify,
  onReject,
  loading,
}: KYCDocumentModalProps) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  if (!document) return null

  const handleVerify = async () => {
    await onVerify(document.id)
    onOpenChange(false)
  }

  const handleRejectSubmit = async () => {
    if (rejectionReason.trim()) {
      await onReject(document.id, rejectionReason)
      setRejectionReason('')
      setShowRejectForm(false)
      onOpenChange(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,100dvh-2rem)] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <div className="shrink-0 space-y-2 border-b px-6 pt-6 pb-4 pr-14">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="flex flex-wrap items-center gap-2 pr-2 text-left">
              {getStatusIcon(document.status)}
              <span className="min-w-0 break-words">{document.supplierName}</span>
            </DialogTitle>
            <DialogDescription className="text-left">
              {document.documentType.replace(/_/g, ' ').toUpperCase()} — Submitted on{' '}
              {formatDate(document.submittedAt)}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          <div className="space-y-6 pb-2">
            {/* Supplier Info — stacked so email/phone are not squeezed side-by-side */}
            <div className="space-y-3 rounded-lg border border-sky-100 bg-sky-50/90 p-4 dark:border-sky-900 dark:bg-sky-950/30">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium [overflow-wrap:anywhere] text-foreground">{document.email}</p>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium [overflow-wrap:anywhere]">{document.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Status</p>
                <Badge variant="outline" className="mt-1">
                  {document.accountStatus.charAt(0).toUpperCase() +
                    document.accountStatus.slice(1)}
                </Badge>
              </div>
            </div>

            {/* GST Details */}
            {document.gstDetails ? (
              <div className="space-y-4">
                <h3 className="font-semibold">KYC Documents</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* GST Document */}
                  <div className="min-w-0 rounded-lg border p-4">
                    <p className="text-sm font-medium mb-2">GST Document</p>
                    <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded bg-muted">
                      {document.gstDetails.gst_image ? (
                        <img
                          src={document.gstDetails.gst_image || '/placeholder.svg'}
                          alt="GST"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground">No image</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">GST Number</p>
                    <p className="font-mono text-sm font-medium [overflow-wrap:anywhere] break-all">
                      {document.gstDetails.gst_number}
                    </p>
                  </div>

                  {/* PAN Document */}
                  <div className="min-w-0 rounded-lg border p-4">
                    <p className="text-sm font-medium mb-2">PAN Document</p>
                    <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded bg-muted">
                      {document.gstDetails.pan_image ? (
                        <img
                          src={document.gstDetails.pan_image || '/placeholder.svg'}
                          alt="PAN"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground">No image</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">PAN Number</p>
                    <p className="font-mono text-sm font-medium [overflow-wrap:anywhere] break-all">
                      {document.gstDetails.pan_number}
                    </p>
                  </div>

                  {/* Aadhar Document */}
                  <div className="min-w-0 rounded-lg border p-4">
                    <p className="text-sm font-medium mb-2">Aadhar Document</p>
                    <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded bg-muted">
                      {document.gstDetails.andhar_image ? (
                        <img
                          src={document.gstDetails.andhar_image || '/placeholder.svg'}
                          alt="Aadhar"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground">No image</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Aadhar Number</p>
                    <p className="font-mono text-sm font-medium [overflow-wrap:anywhere] break-all">
                      {document.gstDetails.andhar_number}
                    </p>
                  </div>
                </div>

                {/* Document Details */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">GST Status</p>
                    <Badge
                      variant={document.gstDetails.gst_status ? 'default' : 'destructive'}
                      className="mt-1"
                    >
                      {document.gstDetails.gst_status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">GST Validity</p>
                    <p className="font-medium [overflow-wrap:anywhere]">
                      {formatDate(document.gstDetails.gst_validity)}
                    </p>
                  </div>
                  <div className="min-w-0 sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Submitted Date</p>
                    <p className="font-medium">{formatDate(document.gstDetails.created_at)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  No KYC documents submitted yet
                </p>
              </div>
            )}

            {/* Current Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Verification Status</p>
                <Badge
                  className="mt-1"
                  variant={
                    document.status === 'verified'
                      ? 'default'
                      : document.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                </Badge>
              </div>
              {document.verifiedAt && (
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Verified On</p>
                  <p className="font-medium">{formatDate(document.verifiedAt)}</p>
                </div>
              )}
              {document.rejectionReason && (
                <div className="min-w-0 sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Rejection Reason</p>
                  <p className="font-medium text-red-600 [overflow-wrap:anywhere]">
                    {document.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {/* Rejection Form */}
            {showRejectForm && document.status === 'pending' && (
              <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
                <p className="text-sm font-medium">Rejection Reason</p>
                <Textarea
                  placeholder="Explain why you're rejecting this document..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-24"
                />
              </div>
            )}

            {/* Actions */}
            {document.status === 'pending' && (
              <div className="flex flex-wrap gap-3 justify-end border-t pt-2">
                {!showRejectForm ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectForm(true)}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={handleVerify}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Verify & Approve
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectForm(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRejectSubmit}
                      disabled={!rejectionReason.trim() || loading}
                      variant="destructive"
                    >
                      Confirm Rejection
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
