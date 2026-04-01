'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Loading from '../loading'

export default function RTOOrdersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">RTO Orders</h1>
            <p className="text-muted-foreground">Track and manage return-to-origin shipments</p>
          </div>
          <Badge variant="destructive" className="text-lg px-4 py-2">
            0 RTOs
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1 flex items-center gap-2 bg-input px-3 py-2 rounded-lg">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order ID or AWB..."
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
                <p className="text-3xl font-bold text-red-600">0</p>
                <p className="text-sm text-muted-foreground">Total RTOs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">184</p>
                <p className="text-sm text-muted-foreground">In Transit Back</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">128</p>
                <p className="text-sm text-muted-foreground">Returned to Supplier</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">₹28.3L</p>
                <p className="text-sm text-muted-foreground">RTO Value</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>RTO Reasons Analysis</CardTitle>
            <CardDescription>Breakdown of RTO causes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-medium">Address Not Found</span>
              <Badge variant="outline">142</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-medium">Customer Unavailable</span>
              <Badge variant="outline">98</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-medium">Refused by Customer</span>
              <Badge variant="outline">67</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-medium">Quality Complaint</span>
              <Badge variant="outline">23</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-medium">Damage During Transit</span>
              <Badge variant="outline">12</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RTO Orders List</CardTitle>
            <CardDescription>All return-to-origin shipments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>No RTO orders yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  )
}
