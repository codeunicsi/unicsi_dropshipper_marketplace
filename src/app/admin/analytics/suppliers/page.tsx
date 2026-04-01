'use client'

import { Card, CardContent } from '@/components/ui/card'

export default function SupplierAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Supplier Performance</h1>
        <p className="text-muted-foreground">Supplier metrics and performance tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground">Active Suppliers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">94.2%</p>
              <p className="text-sm text-muted-foreground">Avg Fulfillment Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">3.8%</p>
              <p className="text-sm text-muted-foreground">Avg RTO Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">4.6/5</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          <p>No supplier analytics yet</p>
        </div>
      </Card>
    </div>
  )
}
