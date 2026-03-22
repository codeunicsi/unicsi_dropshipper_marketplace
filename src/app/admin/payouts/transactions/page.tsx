'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTransactionStats, useTransactionList, type TransactionRow, type TransactionFilters } from '@/hooks/useTransactionHistory'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function formatCurrency(amount: number) {
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(1)}Cr`
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(1)}L`
  return `₹${amount.toLocaleString('en-IN')}`
}

function TransactionsTable({ list, isLoading }: { list: TransactionRow[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!list?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No transactions found</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Credit/Debit</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Balance After</TableHead>
          <TableHead>Reference</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((row: TransactionRow) => (
          <TableRow key={row.ledger_id}>
            <TableCell>{new Date(row.created_at).toLocaleString('en-IN')}</TableCell>
            <TableCell>
              <span className="capitalize">{row.reference_type}</span>
            </TableCell>
            <TableCell>
              <span className="font-medium">{row.entity_name}</span>
              <span className="ml-1 text-muted-foreground text-xs">({row.entity_type})</span>
            </TableCell>
            <TableCell>
              <span className={row.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                {row.transaction_type}
              </span>
            </TableCell>
            <TableCell>
              <span className={row.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                {row.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(Number(row.amount))}
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.balance_after != null ? formatCurrency(Number(row.balance_after)) : '—'}
            </TableCell>
            <TableCell className="text-muted-foreground max-w-[180px] truncate" title={row.description ?? row.reference_id}>
              {row.description ?? row.reference_id}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function TransactionHistoryPage() {
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: stats, isLoading: statsLoading } = useTransactionStats()
  const { data: list, isLoading: listLoading } = useTransactionList(filters)

  const applyFilters = () => {
    setFilters({
      ...filters,
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo }),
    })
  }

  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setFilters({})
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
        <p className="text-muted-foreground">Complete payment and transaction logs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-9 w-24 mx-auto mb-1" />
              ) : (
                <p className="text-3xl font-bold text-primary">{stats?.total_transactions?.toLocaleString() ?? 0}</p>
              )}
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-9 w-24 mx-auto mb-1" />
              ) : (
                <p className="text-3xl font-bold text-green-600">
                  {stats ? formatCurrency(stats.total_value) : '₹0'}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-9 w-16 mx-auto mb-1" />
              ) : (
                <p className="text-3xl font-bold text-blue-600">{stats?.success_rate ?? 0}%</p>
              )}
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-9 w-16 mx-auto mb-1" />
              ) : (
                <p className="text-3xl font-bold text-yellow-600">{stats?.failed_retried ?? 0}</p>
              )}
              <p className="text-sm text-muted-foreground">Failed (Retried)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter by entity, transaction type, and date range</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Entity Type</Label>
            <select
              value={filters.entity_type ?? 'all'}
              onChange={(e) => setFilters({ ...filters, entity_type: e.target.value === 'all' ? undefined : e.target.value })}
              className="flex h-9 w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All</option>
              <option value="platform">Platform</option>
              <option value="supplier">Supplier</option>
              <option value="reseller">Reseller</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select
              value={filters.type ?? 'all'}
              onChange={(e) => setFilters({ ...filters, type: e.target.value === 'all' ? undefined : e.target.value })}
              className="flex h-9 w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All</option>
              <option value="order">Order</option>
              <option value="order_item">Order Item</option>
              <option value="payout">Payout</option>
              <option value="refund">Refund</option>
              <option value="rto">RTO</option>
              <option value="commission">Commission</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>From Date</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[140px]" />
          </div>
          <div className="space-y-2">
            <Label>To Date</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[140px]" />
          </div>
          <Button onClick={applyFilters}>Apply</Button>
          <Button variant="outline" onClick={clearFilters}>Clear</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Ledger entries (credits and debits)</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsTable list={list} isLoading={listLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
