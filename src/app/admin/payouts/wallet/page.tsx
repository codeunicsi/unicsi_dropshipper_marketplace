'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWalletStats, useWalletList, type WalletRow } from '@/hooks/useWallet'
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

function WalletTable() {
  const { data: list, isLoading } = useWalletList()

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
        <p>No wallets found</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Entity</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Available Balance</TableHead>
          <TableHead>Pending Balance</TableHead>
          <TableHead>Last Activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((row: WalletRow) => (
          <TableRow key={`${row.entity_type}-${row.entity_id}`}>
            <TableCell className="font-medium">{row.entity_name}</TableCell>
            <TableCell>
              <Badge variant="outline">{row.entity_type}</Badge>
            </TableCell>
            <TableCell>{formatCurrency(row.available_balance)}</TableCell>
            <TableCell>{formatCurrency(row.pending_balance)}</TableCell>
            <TableCell className="text-muted-foreground">
              {row.last_activity ? new Date(row.last_activity).toLocaleString('en-IN') : '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function WalletManagementPage() {
  const { data: stats, isLoading: statsLoading } = useWalletStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Wallet Management</h1>
        <p className="text-muted-foreground">Manage supplier and partner wallet balances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-9 w-24 mx-auto mb-1" />
              ) : (
                <p className="text-3xl font-bold text-primary">
                  {stats ? formatCurrency(stats.total_wallet_balance) : '₹0'}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Total Wallet Balance</p>
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
                  {stats ? formatCurrency(stats.supplier_wallets_total) : '₹0'}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Supplier Wallets</p>
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
                  {stats ? formatCurrency(stats.partner_wallets_total) : '₹0'}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Partner Wallets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {statsLoading ? (
                <Skeleton className="h-9 w-16 mx-auto mb-1" />
              ) : (
                <p className="text-3xl font-bold text-yellow-600">{stats?.active_wallets ?? 0}</p>
              )}
              <p className="text-sm text-muted-foreground">Active Wallets</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Details</CardTitle>
          <CardDescription>Suppliers and partners with available and pending balance</CardDescription>
        </CardHeader>
        <CardContent>
          <WalletTable />
        </CardContent>
      </Card>
    </div>
  )
}
