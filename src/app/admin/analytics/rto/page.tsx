'use client'

import { Card, CardContent } from '@/components/ui/card'

export default function RTOAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">RTO Analytics</h1>
        <p className="text-muted-foreground">Return-to-origin patterns and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">3.8%</p>
              <p className="text-sm text-muted-foreground">Overall RTO Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">0</p>
              <p className="text-sm text-muted-foreground">Monthly RTOs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">₹42L</p>
              <p className="text-sm text-muted-foreground">Monthly RTO Cost</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">34.5%</p>
              <p className="text-sm text-muted-foreground">Top Reason Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          <p>No RTO analytics yet</p>
        </div>
      </Card>
    </div>
  )
}
