'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsGrid } from './StatsGrid'
import { OrdersChart } from './OrdersChart'
import { TopSuppliers } from './TopSuppliers'
import { AlertsSection } from './AlertsSection'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'

export function DashboardContent() {
  const { loading, error, stats, trendData, topSuppliers, alerts } = useAdminDashboard()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's your platform health overview.
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Chart */}
        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Product Review Trends</CardTitle>
              <CardDescription>
                Last 7 days of submissions and review outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersChart data={trendData} />
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <AlertsSection alerts={alerts} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Suppliers */}
        <TopSuppliers suppliers={topSuppliers} />

        {/* Quick Actions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/admin/products/pending">Review Pending Products</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/suppliers/kyc">Review KYC Submissions</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/products/live">Manage Live Products</Link>
              </Button>
            </div>
            {loading && <p className="text-xs text-muted-foreground mt-4">Refreshing dashboard data...</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
