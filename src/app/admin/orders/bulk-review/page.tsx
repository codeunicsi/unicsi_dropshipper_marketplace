'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { uploadsImageDisplayUrl } from '@/lib/media-url'
import {
  useBulkOrdersAdmin,
  isAwaitingBulkReview,
  type AdminBulkOrderRow,
  type BulkPaymentFilter,
} from '@/hooks/useBulkOrdersAdmin'
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Loader2,
  Search,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type TabKey = 'all' | 'pending' | 'verified' | 'rejected'

const TAB_TO_STATUS: Record<TabKey, BulkPaymentFilter> = {
  all: '',
  pending: 'PROOF_SUBMITTED',
  verified: 'VERIFIED',
  rejected: 'REJECTED',
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Processing' },
  { key: 'verified', label: 'Confirm' },
  { key: 'rejected', label: 'On hold' },
]

export default function BulkOrderReviewPage() {
  const { data, loading, error, fetchOrders, verifyPayment, rejectPayment } = useBulkOrdersAdmin()
  const [tab, setTab] = useState<TabKey>('all')
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [selected, setSelected] = useState<AdminBulkOrderRow | null>(null)
  const [txRef, setTxRef] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState<Set<string>>(new Set())

  useEffect(() => {
    const t = window.setTimeout(() => setSearchDebounced(searchInput.trim()), 400)
    return () => window.clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [tab, searchDebounced])

  const load = useCallback(() => {
    const status = TAB_TO_STATUS[tab]
    return fetchOrders({
      paymentStatus: status || undefined,
      page,
      limit: 20,
      search: searchDebounced || undefined,
    })
  }, [fetchOrders, tab, page, searchDebounced])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setRowSelection(new Set())
  }, [data?.orders, tab, page, searchDebounced])

  const closeDialog = () => {
    setSelected(null)
    setTxRef('')
    setRejectReason('')
    setActionError(null)
  }

  const runReviewMutation = async (fn: () => Promise<unknown>) => {
    setActionError(null)
    setActionLoading(true)
    try {
      await fn()
      closeDialog()
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setActionLoading(false)
    }
  }

  const onVerify = () => {
    if (!selected) return
    void runReviewMutation(() => verifyPayment(selected.orderId, txRef))
  }

  const onReject = () => {
    if (!selected) return
    if (rejectReason.trim().length < 3) {
      setActionError('Reason must be at least 3 characters.')
      return
    }
    void runReviewMutation(() => rejectPayment(selected.orderId, rejectReason))
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.count / data.limit)) : 1

  const allIdsOnPage = useMemo(
    () => (data?.orders ?? []).map((r) => r.orderId),
    [data?.orders],
  )

  const allSelected =
    allIdsOnPage.length > 0 && allIdsOnPage.every((id) => rowSelection.has(id))

  const toggleAll = () => {
    if (allSelected) {
      setRowSelection(new Set())
      return
    }
    setRowSelection(new Set(allIdsOnPage))
  }

  const toggleRow = (id: string) => {
    setRowSelection((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const exportCsv = () => {
    if (!data?.orders.length) return
    const headers = [
      'Invoice',
      'Order ID',
      'Submitted',
      'Customer',
      'Reseller',
      'Amount',
      'Payment type',
      'Fulfillment',
      'Stage',
      'Order status',
      'Payment status',
    ]
    const rows = data.orders.map((r) => [
      r.invoiceNumber ?? '',
      r.orderId,
      r.submittedAt ?? '',
      r.customerName ?? '',
      r.resellerName ?? '',
      String(r.totalPayable ?? ''),
      paymentTypeDisplay(r),
      r.fulfillmentStatus ?? '',
      r.reviewStage ?? '',
      r.orderStatus ?? '',
      r.paymentStatus ?? '',
    ])
    const esc = (cell: string) => `"${String(cell).replace(/"/g, '""')}"`
    const body = [headers, ...rows].map((line) => line.map(esc).join(',')).join('\n')
    const blob = new Blob([body], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bulk-orders-page-${data.page}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 pb-12">
      <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bulk orders</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Offline payment proofs for B2B bulk orders. Match invoices to screenshots, then approve or
            reject. Verified orders surface to suppliers for fulfillment.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="icon" className="rounded-full" title="Filters">
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            title="Export this page"
            onClick={exportCsv}
            disabled={!data?.orders.length}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, invoice, order id, transaction ref…"
          className="h-11 rounded-xl border-border bg-card pl-10 shadow-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              tab === key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border bg-card text-muted-foreground hover:bg-muted/60',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Card className="overflow-hidden rounded-xl border-border shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">Orders</span>
            {data && (
              <span className="text-xs text-muted-foreground">
                {data.count} total · page {data.page} of {totalPages}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !data?.orders.length ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No bulk orders in this view.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-10 pl-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border accent-primary"
                        checked={allSelected}
                        onChange={toggleAll}
                        aria-label="Select all on page"
                      />
                    </TableHead>
                    <TableHead className="min-w-[140px]">Order</TableHead>
                    <TableHead className="min-w-[120px]">Date</TableHead>
                    <TableHead className="min-w-[120px]">Name</TableHead>
                    <TableHead className="min-w-[100px]">Amount</TableHead>
                    <TableHead className="min-w-[90px]">Payment</TableHead>
                    <TableHead className="min-w-[110px]">Fulfillment</TableHead>
                    <TableHead className="min-w-[100px]">Stage</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[100px] pr-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.orders.map((row) => (
                    <TableRow key={row.orderId} className="border-border">
                      <TableCell className="pl-4 align-top">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border accent-primary"
                          checked={rowSelection.has(row.orderId)}
                          onChange={() => toggleRow(row.orderId)}
                          aria-label={`Select ${row.invoiceNumber ?? row.orderId}`}
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-mono text-xs font-semibold text-foreground">
                          {row.invoiceNumber ?? row.orderId.slice(0, 8) + '…'}
                        </div>
                        <PaymentSubBadge row={row} />
                      </TableCell>
                      <TableCell className="align-top text-sm text-foreground">
                        {formatSubmittedAt(row.submittedAt)}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="max-w-[180px] truncate text-sm font-medium text-foreground">
                          {row.customerName ?? '—'}
                        </div>
                        {row.resellerName ? (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                            <span className="h-1 w-1 rounded-full bg-amber-500" />
                            {truncate(row.resellerName, 22)}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="align-top text-sm font-medium tabular-nums text-foreground">
                        {formatInr(row.totalPayable)}
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="inline-flex rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {paymentTypeDisplay(row)}
                        </span>
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="inline-flex rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
                          {row.fulfillmentStatus ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="inline-flex rounded-full border border-primary/40 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {row.reviewStage ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell className="align-top">
                        <OrderStatusPill status={row.orderStatus} />
                      </TableCell>
                      <TableCell className="pr-4 text-right align-top">
                        {isAwaitingBulkReview(row) ? (
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-full px-4"
                            onClick={() => setSelected(row)}
                          >
                            Review
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full px-4"
                            onClick={() => setSelected(row)}
                          >
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {data && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 border-t border-border py-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Bulk order · {selected?.invoiceNumber ?? selected?.orderId}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <Detail k="Product" v={selected.productTitle ?? '—'} full />
                <Detail k="Quantity" v={String(selected.quantity ?? '—')} />
                <Detail k="Reseller" v={selected.resellerName ?? '—'} full />
                <Detail k="Payment status" v={selected.paymentStatus ?? '—'} />
                <Detail k="Order status" v={selected.orderStatus ?? '—'} />
                <Detail k="Total" v={formatInr(selected.totalPayable)} />
                <Detail k="Txn ref" v={selected.transactionReference ?? '—'} />
                <Detail
                  k="Proof amount"
                  v={
                    selected.paymentProof != null
                      ? formatInr(selected.paymentProof.amount)
                      : '—'
                  }
                />
              </div>
              <Detail k="Delivery" v={selected.deliveryAddress ?? '—'} full />
              <Detail k="Phone" v={selected.customerPhone ?? '—'} />
              <Detail k="Email" v={selected.customerEmail ?? '—'} />
              {selected.paymentProof?.screenshotUrl && (
                <div className="space-y-2">
                  <Label>Payment screenshot</Label>
                  <a
                    href={uploadsImageDisplayUrl(selected.paymentProof.screenshotUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-lg border bg-muted/30"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadsImageDisplayUrl(selected.paymentProof.screenshotUrl)}
                      alt="Payment proof"
                      className="max-h-64 w-full object-contain"
                    />
                  </a>
                </div>
              )}

              {selected.paymentStatus === 'VERIFIED' && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                  Payment verified. This bulk order is confirmed and visible to the supplier for
                  fulfillment.
                </div>
              )}

              {selected.paymentStatus === 'REJECTED' && (
                <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <p className="font-semibold text-destructive">Payment proof was rejected</p>
                  {selected.paymentProof?.rejectedReason ? (
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Reason: </span>
                      {selected.paymentProof.rejectedReason}
                    </p>
                  ) : null}
                </div>
              )}

              {selected.paymentStatus === 'PROOF_SUBMITTED' && !isAwaitingBulkReview(selected) && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
                  No pending payment proof on this order. Refresh the list or check another tab.
                </div>
              )}

              {isAwaitingBulkReview(selected) && (
                <div className="space-y-3 border-t pt-3">
                  <div className="space-y-2">
                    <Label htmlFor="tx">Adjust transaction reference (optional)</Label>
                    <Input
                      id="tx"
                      value={txRef}
                      onChange={(e) => setTxRef(e.target.value)}
                      placeholder="If different from buyer entry"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={actionLoading}
                      onClick={onVerify}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve payment
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rej">Reject reason (min 3 chars)</Label>
                    <Textarea
                      id="rej"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="e.g. Amount mismatch / unreadable screenshot"
                      className="rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      className="rounded-full"
                      disabled={actionLoading}
                      onClick={onReject}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject proof
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {actionError && (
                <p className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {actionError}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-full" onClick={closeDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Detail({ k, v, full }: { k: string; v: string; full?: boolean }) {
  return (
    <div className={cn(full && 'col-span-2')}>
      <p className="text-xs text-muted-foreground">{k}</p>
      <p className="break-words font-medium">{v}</p>
    </div>
  )
}

function formatInr(v: string | number | null | undefined) {
  const n = Number(v)
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
}

function formatSubmittedAt(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const day = format(d, 'do')
  const rest = format(d, 'MMM yyyy')
  const time = `${format(d, 'h:mm')}${format(d, 'a').toLowerCase()}`
  return `${day} ${rest} · ${time}`
}

function paymentTypeDisplay(row: AdminBulkOrderRow) {
  if (row.paymentType) return row.paymentType
  const m = row.paymentProof?.paymentMode
  if (!m) return '—'
  return m === 'upi' ? 'UPI' : m === 'bank_transfer' ? 'Bank transfer' : m
}

function truncate(s: string, max: number) {
  if (s.length <= max) return s
  return `${s.slice(0, max - 1)}…`
}

function PaymentSubBadge({ row }: { row: AdminBulkOrderRow }) {
  if (isAwaitingBulkReview(row)) {
    return (
      <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-950/60 dark:text-amber-100">
        Pending proof
      </span>
    )
  }
  if (row.paymentStatus === 'VERIFIED') {
    return (
      <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100">
        Paid
      </span>
    )
  }
  if (row.paymentStatus === 'REJECTED') {
    return (
      <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-900 dark:bg-red-950/60 dark:text-red-100">
        Rejected
      </span>
    )
  }
  return (
    <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {row.paymentStatus ?? '—'}
    </span>
  )
}

function OrderStatusPill({ status }: { status: string | null | undefined }) {
  const s = status ?? '—'
  const isConfirmed = /confirmed/i.test(s)
  const isPendingPay = /pending/i.test(s)
  const cls = isConfirmed
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
    : isPendingPay
      ? 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100'
      : 'border-border bg-muted/40 text-foreground'
  return (
    <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium', cls)}>
      {s}
    </span>
  )
}
