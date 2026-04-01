'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SupplierMetricsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Performance Metrics</h1>
        <p className="text-muted-foreground">Track supplier performance indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Fulfillment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">94.2%</p>
            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">↑ 2.3% vs last month</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">RTO Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3.8%</p>
            <Badge variant="outline" className="mt-2 bg-red-50 text-red-700 border-red-200">↑ 0.5% vs last month</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">4.6/5</p>
            <Badge variant="outline" className="mt-2">Based on 2,847 reviews</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Performance Details</CardTitle>
          <CardDescription>Detailed metrics for all suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No metrics yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
