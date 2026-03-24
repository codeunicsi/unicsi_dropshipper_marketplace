'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  QrCode,
  Save,
  Smartphone,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react'
import {
  usePlatformCollectionAccount,
  type PlatformCollectionAccountPayload,
} from '@/hooks/usePlatformCollectionAccount'
import { uploadsImageDisplayUrl } from '@/lib/media-url'

export default function PlatformPaymentSettingsPage() {
  const { account, loading, error, saveAccount, uploadQr, deleteAllDetails } = usePlatformCollectionAccount()
  const qrInputRef = useRef<HTMLInputElement>(null)
  const [accountHolderName, setAccountHolderName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [bankName, setBankName] = useState('')
  const [branchName, setBranchName] = useState('')
  const [upiId, setUpiId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [qrUploading, setQrUploading] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)

  const hasSavedRecord = Boolean(account?.bankId)

  useEffect(() => {
    if (!account) return
    setAccountHolderName(account.accountHolderName ?? '')
    setAccountNumber(account.accountNumber ?? '')
    setIfscCode(account.ifscCode ?? '')
    setBankName(account.bankName ?? '')
    setBranchName(account.branchName ?? '')
    setUpiId(account.upiId ?? '')
    setQrCode(account.qrCode ?? '')
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setSaveSuccess(false)
    const payload: PlatformCollectionAccountPayload = {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      branchName,
      upiId,
    }
    setSaving(true)
    try {
      await saveAccount(payload)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const isQrImageUrl =
    qrCode.startsWith('http://') ||
    qrCode.startsWith('https://') ||
    qrCode.startsWith('data:image')

  const qrPreviewSrc = uploadsImageDisplayUrl(qrCode)

  const pickQrFile = () => qrInputRef.current?.click()

  const onQrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setQrError('Please choose an image file')
      return
    }
    setQrError(null)
    setQrUploading(true)
    try {
      await uploadQr(file)
    } catch (err) {
      setQrError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setQrUploading(false)
    }
  }

  const onDeleteAllDetails = async () => {
    if (
      !window.confirm(
        'Delete all saved platform payment details (bank, UPI, QR)? Suppliers will see empty instructions until you save again.'
      )
    ) {
      return
    }
    setSaveError(null)
    setSaveSuccess(false)
    setQrError(null)
    setDeletingAll(true)
    try {
      await deleteAllDetails()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeletingAll(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 mt-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">Platform payment details</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Bank and UPI details suppliers see when paying Unicsi manually (wallet top-up, fees). This is not
            supplier payout data — that stays under each supplier&apos;s bank profile.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          <XCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg order-2 lg:order-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Edit receiving account
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="font-medium">Loading…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {account?.bankId && (
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Bank record ID</Label>
                    <Input value={account.bankId} readOnly className="bg-muted/50 font-mono text-xs" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="upi">UPI ID</Label>
                  <Input
                    id="upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="payments@unicsi"
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holder">Account holder name</Label>
                  <Input
                    id="holder"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Unicsi Marketplace Pvt Ltd"
                    className="bg-muted/30"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="acct">Account number</Label>
                    <Input
                      id="acct"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ifsc">IFSC</Label>
                    <Input
                      id="ifsc"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="bg-muted/30 uppercase"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank">Bank name</Label>
                    <Input
                      id="bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="HDFC Bank"
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch name</Label>
                    <Input
                      id="branch"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="bg-muted/30"
                    />
                  </div>
                </div>
                <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                  <Label className="flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    UPI QR image
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Upload a PNG/JPEG/WebP file. Stored on the API server under <code className="text-[11px]">uploads/images</code> (same as supplier catalog images).
                  </p>
                  <input
                    ref={qrInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={onQrFileChange}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={qrUploading || loading}
                      onClick={pickQrFile}
                    >
                      {qrUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Upload QR
                    </Button>
                  </div>
                  {qrError && (
                    <p className="text-sm text-destructive flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {qrError}
                    </p>
                  )}
                  {isQrImageUrl ? (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 pt-1">
                      <div className="rounded-md border bg-background p-2 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrPreviewSrc} alt="Uploaded QR" className="h-24 w-24 object-contain mx-auto sm:mx-0" />
                      </div>
                      <p className="text-[11px] font-mono text-muted-foreground break-all pt-1">{qrCode}</p>
                    </div>
                  ) : null}
                </div>

                <div className="pt-4 border-t flex flex-col gap-4">
                  <div className="min-h-[20px]">
                    {saveError && (
                      <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {saveError}
                      </p>
                    )}
                    {saveSuccess && (
                      <p className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0" /> Saved
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      disabled={deletingAll || saving || loading || !hasSavedRecord}
                      onClick={onDeleteAllDetails}
                      className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive sm:min-w-[140px]"
                    >
                      {deletingAll ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete
                    </Button>
                    <Button type="submit" size="lg" disabled={saving || deletingAll} className="min-w-[140px]">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-muted order-1 lg:order-2">
          <CardHeader>
            <CardTitle className="text-lg">Supplier preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900 p-4 space-y-3">
                <p className="text-xs font-bold tracking-wider text-teal-600 dark:text-teal-400">UPI PAYMENT</p>
                <div>
                  <p className="text-xs text-muted-foreground">UPI ID</p>
                  <p className="font-semibold break-all">{upiId || '—'}</p>
                </div>
                {isQrImageUrl && (
                  <div className="rounded-lg bg-white p-2 border flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrPreviewSrc} alt="UPI QR" className="max-h-36 w-auto object-contain" />
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-border p-4 space-y-3">
                <p className="text-xs font-bold tracking-wider text-muted-foreground">BANK TRANSFER</p>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Account name</dt>
                    <dd className="font-semibold">{accountHolderName || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Account number</dt>
                    <dd className="font-semibold font-mono">{accountNumber || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">IFSC</dt>
                    <dd className="font-semibold font-mono">{ifscCode || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Bank</dt>
                    <dd className="font-semibold">{bankName || '—'}</dd>
                  </div>
                  {branchName ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">Branch</dt>
                      <dd className="font-semibold">{branchName}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="button" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled>
                <Smartphone className="w-4 h-4 mr-2 opacity-80" />
                Payment successful
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
