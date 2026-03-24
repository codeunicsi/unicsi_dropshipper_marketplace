'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download } from 'lucide-react'
import { useSettlementStats, useSettlementList, type SettlementRow, type SettlementFilters } from '@/hooks/useSettlements'
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

function SettlementsTable({ list, isLoading }: { list: SettlementRow[] | undefined; isLoading: boolean }) {
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
        <p>No settlements found</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Entity Type</TableHead>
          <TableHead>Entity Name</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Bank Reference</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((row: SettlementRow) => (
          <TableRow key={row.settlement_id}>
            <TableCell>
              {row.settlement_date
                ? new Date(row.settlement_date).toLocaleDateString('en-IN')
                : new Date(row.created_at).toLocaleDateString('en-IN')}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{row.entity_type}</Badge>
            </TableCell>
            <TableCell className="font-medium">{row.entity_name}</TableCell>
            <TableCell>{formatCurrency(row.amount)}</TableCell>
            <TableCell>
              <Badge variant={row.settlement_status === 'completed' ? 'default' : 'secondary'}>
                {row.settlement_status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{row.bank_reference ?? '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function SettlementPage() {
  const [filters, setFilters] = useState<SettlementFilters>({})
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: stats, isLoading: statsLoading } = useSettlementStats()

  const { data: list, isLoading: listLoading } = useSettlementList(filters)

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

  const exportCsv = () => {
    if (!list?.length) return
    const headers = ['Date', 'Entity Type', 'Entity Name', 'Amount', 'Status', 'Bank Reference']
    const rows = list.map((r) => [
      r.settlement_date ? new Date(r.settlement_date).toISOString().slice(0, 10) : new Date(r.created_at).toISOString().slice(0, 10),
      r.entity_type,
      r.entity_name,
      r.amount,
      r.settlement_status,
      r.bank_reference ?? '',
    ])
    const csv = [headers.join(','), ...rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `settlements-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settlement Reports</h1>
          <p className="text-muted-foreground">Financial settlement and reconciliation reports</p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-9 w-24 mx-auto mb-1" />
              ) : (
                <p className="text-3xl font-bold text-primary">
                  {stats ? formatCurrency(stats.total_gmv) : '₹0'}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Total GMV</p>
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
                  {stats ? formatCurrency(stats.total_payouts) : '₹0'}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Total Payouts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-9 w-24 mx-auto mb-1" />
              ) : (
                <p className="text-3xl font-bold text-blue-600">
                  {stats ? formatCurrency(stats.platform_revenue) : '₹0'}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Platform Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-9 w-16 mx-auto mb-1" />
              ) : (
                <p className="text-3xl font-bold text-yellow-600">{stats?.reconciliation_rate ?? 0}%</p>
              )}
              <p className="text-sm text-muted-foreground">Reconciliation Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter settlements by entity type, status, and date range</CardDescription>
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
              <option value="supplier">Supplier</option>
              <option value="seller">Partner</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              value={filters.status ?? 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value === 'all' ? undefined : e.target.value })}
              className="flex h-9 w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>From Date</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[140px]"
            />
          </div>
          <div className="space-y-2">
            <Label>To Date</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[140px]"
            />
          </div>
          <Button onClick={applyFilters}>Apply</Button>
          <Button variant="outline" onClick={clearFilters}>Clear</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settlements</CardTitle>
          <CardDescription>Settlement list with entity and status</CardDescription>
        </CardHeader>
        <CardContent>
          <SettlementsTable list={list} isLoading={listLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
