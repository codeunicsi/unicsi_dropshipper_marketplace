'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Loading from '../loading'

export default function ShippedOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shipped Orders</h1>
          <p className="text-muted-foreground">Orders in transit to customers</p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          1,234 Shipped
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1 flex items-center gap-2 bg-input px-3 py-2 rounded-lg">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by tracking number..."
              className="bg-transparent flex-1 outline-none text-sm"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">1,234</p>
              <p className="text-sm text-muted-foreground">Total Shipped</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">₹3.8Cr</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">3.2</p>
              <p className="text-sm text-muted-foreground">Avg Transit Days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">45</p>
              <p className="text-sm text-muted-foreground">Delayed Shipments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<Loading />}>
        <Card>
          <CardHeader>
            <CardTitle>Shipped Orders List</CardTitle>
            <CardDescription>Showing 1-10 of 1,234 orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>No shipped orders yet</p>
            </div>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  )
}
