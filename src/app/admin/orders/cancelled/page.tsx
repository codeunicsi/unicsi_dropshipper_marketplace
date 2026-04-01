'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function CancelledOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cancelled Orders</h1>
          <p className="text-muted-foreground">Orders cancelled by customers or system</p>
        </div>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          3,247 Cancelled
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">3,247</p>
              <p className="text-sm text-muted-foreground">Total Cancelled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">₹8.2Cr</p>
              <p className="text-sm text-muted-foreground">Lost Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">2.8%</p>
              <p className="text-sm text-muted-foreground">Cancellation Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">₹2.5Cr</p>
              <p className="text-sm text-muted-foreground">Refunded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cancellation Reasons</CardTitle>
          <CardDescription>Why orders are being cancelled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm font-medium">Customer Request</span>
            <Badge variant="outline">1,847</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm font-medium">Out of Stock</span>
            <Badge variant="outline">892</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm font-medium">Supplier Unavailable</span>
            <Badge variant="outline">0</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm font-medium">Payment Failed</span>
            <Badge variant="outline">123</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm font-medium">Fraudulent Activity</span>
            <Badge variant="outline">43</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cancelled Orders List</CardTitle>
          <CardDescription>Showing 1-10 of 3,247 cancelled orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No cancelled orders yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
