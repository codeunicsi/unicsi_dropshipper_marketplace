'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download } from 'lucide-react'
import { usePartnerPayoutStats, usePartnerPayoutList, type PartnerPayoutRow } from '@/hooks/usePartnerPayouts'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function formatCurrency(amount: number) {
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(1)}Cr`
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(1)}L`
  return `₹${amount.toLocaleString('en-IN')}`
}

function PartnerPayoutsTable() {
  const { data: list, isLoading } = usePartnerPayoutList()

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
        <p>No partners found</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Partner</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Bank</TableHead>
          <TableHead>Available</TableHead>
          <TableHead>Last Payout</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((row: PartnerPayoutRow) => (
          <TableRow key={row.reseller_id}>
            <TableCell className="font-medium">{row.name ?? '—'}</TableCell>
            <TableCell>
              <span className="block">{row.email ?? '—'}</span>
              {row.phone_number && (
                <span className="block text-muted-foreground text-sm">{row.phone_number}</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={row.has_bank_details ? 'default' : 'secondary'}>
                {row.has_bank_details ? 'Added' : 'Missing'}
              </Badge>
            </TableCell>
            <TableCell>{formatCurrency(row.available_balance)}</TableCell>
            <TableCell>
              {row.last_settlement_date
                ? new Date(row.last_settlement_date).toLocaleDateString('en-IN')
                : '—'}
              {row.last_settlement_amount != null && (
                <span className="block text-muted-foreground text-sm">
                  {formatCurrency(row.last_settlement_amount)}
                </span>
              )}
            </TableCell>
            <TableCell>
              {row.last_settlement_status ? (
                <Badge variant={row.last_settlement_status === 'completed' ? 'default' : 'secondary'}>
                  {row.last_settlement_status}
                </Badge>
              ) : (
                <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>{row.status}</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function PartnerPayoutsPage() {
  const { data: stats, isLoading: statsLoading } = usePartnerPayoutStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Partner Payouts</h1>
          <p className="text-muted-foreground">Manage logistics and service partner payments</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-9 w-24 mx-auto mb-1" />
              ) : (
                <p className="text-3xl font-bold text-green-600">
                  {stats ? formatCurrency(stats.paid_this_month) : '₹0'}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Paid This Month</p>
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
                  {stats ? formatCurrency(stats.pending_payouts) : '₹0'}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Pending Payouts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-9 w-16 mx-auto mb-1" />
              ) : (
                <p className="text-3xl font-bold text-primary">{stats?.partners_paid ?? 0}</p>
              )}
              <p className="text-sm text-muted-foreground">Partners Paid</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-9 w-16 mx-auto mb-1" />
              ) : (
                <p className="text-3xl font-bold text-yellow-600">{stats?.on_time_rate ?? 0}%</p>
              )}
              <p className="text-sm text-muted-foreground">On-Time Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout Status</CardTitle>
          <CardDescription>Current payout cycle status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium">Paid Payouts</p>
              <p className="text-sm text-muted-foreground">Successfully transferred</p>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {statsLoading ? '—' : stats ? formatCurrency(stats.paid_this_month) : '₹0'}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium">Pending Payouts</p>
              <p className="text-sm text-muted-foreground">Waiting for next cycle</p>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              {statsLoading ? '—' : stats ? formatCurrency(stats.pending_payouts) : '₹0'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partners</CardTitle>
          <CardDescription>Partners (resellers) with payout history</CardDescription>
        </CardHeader>
        <CardContent>
          <PartnerPayoutsTable />
        </CardContent>
      </Card>
    </div>
  )
}
