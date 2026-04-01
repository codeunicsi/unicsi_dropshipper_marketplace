'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DeliveredOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Delivered Orders</h1>
          <p className="text-muted-foreground">Successfully delivered customer orders</p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          52,847 Delivered
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">52,847</p>
              <p className="text-sm text-muted-foreground">Total Delivered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">₹124.5Cr</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">4.8</p>
              <p className="text-sm text-muted-foreground">Avg Customer Rating</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">2.1%</p>
              <p className="text-sm text-muted-foreground">Return Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Performance Metrics</CardTitle>
          <CardDescription>Analytics for successfully delivered orders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium">On-Time Delivery Rate</p>
              <p className="text-sm text-muted-foreground">Orders delivered by promised date</p>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">94.2%</Badge>
          </div>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium">Average Delivery Days</p>
              <p className="text-sm text-muted-foreground">Days from order to delivery</p>
            </div>
            <Badge variant="outline">5.3 days</Badge>
          </div>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium">Customer Satisfaction</p>
              <p className="text-sm text-muted-foreground">Average rating and reviews</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">4.8/5.0</Badge>
          </div>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium">Returns & Exchanges</p>
              <p className="text-sm text-muted-foreground">Percentage of delivered orders</p>
            </div>
            <Badge variant="outline">2.1%</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>Latest delivered orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No delivered orders yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
