'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ProcessingOrdersPage() {
  const searchParams = useSearchParams()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Processing Orders</h1>
          <p className="text-muted-foreground">Orders being prepared for shipment</p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          847 Processing
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
              placeholder="Search by order ID or customer..."
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
              <p className="text-3xl font-bold text-yellow-600">847</p>
              <p className="text-sm text-muted-foreground">Total Processing</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">₹1.2Cr</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">2.1</p>
              <p className="text-sm text-muted-foreground">Avg Processing Days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">23</p>
              <p className="text-sm text-muted-foreground">Delayed Orders</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Processing Orders List</CardTitle>
          <CardDescription>Showing 1-10 of 847 orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No orders in processing yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function WrappedProcessingOrdersPage() {
  return (
    <Suspense fallback={null}>
      <ProcessingOrdersPage />
    </Suspense>
  )
}
