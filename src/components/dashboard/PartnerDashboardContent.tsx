'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsGrid } from './StatsGrid'
import { OrdersChart } from './OrdersChart'
import { TopSuppliers } from './TopSuppliers'
import { AlertsSection } from './AlertsSection'
import {
  PARTNER_STATS_HINTS,
  PARTNER_STATS_LABELS,
  usePartnerDashboard,
} from '@/hooks/usePartnerDashboard'

export default function PartnerDashboardContent() {
  const { loading, error, stats, trendData, topSuppliers, alerts } = usePartnerDashboard()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Orders, catalog value, inventory, and suppliers — from your synced Shopify products.
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      <StatsGrid
        stats={stats}
        variant="partner"
        labels={PARTNER_STATS_LABELS}
        hints={PARTNER_STATS_HINTS}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Catalog growth</CardTitle>
              <CardDescription>Products added to your synced catalog in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersChart data={trendData} />
            </CardContent>
          </Card>
        </div>

        <AlertsSection alerts={alerts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopSuppliers
          suppliers={topSuppliers}
          title="Suppliers in your catalog"
          description="By number of synced products per supplier"
        />

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/marketplace/order/manage">Manage orders</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/marketplace/manage-products/pushedToShopify">Manage products</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/marketplace/hands-a-product">Request a product</Link>
              </Button>
            </div>
            {loading && (
              <p className="text-xs text-muted-foreground mt-4">Refreshing analytics…</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
