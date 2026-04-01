'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function RTOIntelligencePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">RTO Intelligence</h1>
        <p className="text-muted-foreground">Advanced analytics and insights for return-to-origin management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">3.8%</p>
              <p className="text-sm text-muted-foreground">Current RTO Rate</p>
              <div className="flex items-center justify-center gap-1 mt-2 text-red-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">+0.3% vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">94.2%</p>
              <p className="text-sm text-muted-foreground">On-Time Delivery Rate</p>
              <div className="flex items-center justify-center gap-1 mt-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">+1.2% vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">₹42L</p>
              <p className="text-sm text-muted-foreground">Monthly RTO Cost</p>
              <div className="flex items-center justify-center gap-1 mt-2 text-red-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">+₹3.2L vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-muted-foreground">RTOs This Month</p>
              <div className="flex items-center justify-center gap-1 mt-2 text-red-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">+27 vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top RTO Reasons (This Month)</CardTitle>
          <CardDescription>Most common causes of returns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm font-medium">Address Not Found / Incorrect</span>
            <Badge variant="outline">34.5%</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm font-medium">Customer Not Available</span>
            <Badge variant="outline">28.2%</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm font-medium">Customer Refused / Changed Mind</span>
            <Badge variant="outline">19.6%</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm font-medium">Product Quality Issues</span>
            <Badge variant="outline">10.8%</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm font-medium">Package Damaged</span>
            <Badge variant="outline">6.9%</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supplier RTO Performance Ranking</CardTitle>
          <CardDescription>Top performing and at-risk suppliers by RTO rate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm font-semibold mb-3 text-green-700">Best Performers</div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg mb-4">
            <p className="text-sm font-medium">Premium Electronics Co.</p>
            <Badge className="bg-green-100 text-green-800">0.8% RTO</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg mb-4">
            <p className="text-sm font-medium">Fashion Hub Ltd</p>
            <Badge className="bg-green-100 text-green-800">1.2% RTO</Badge>
          </div>

          <div className="text-sm font-semibold mb-3 mt-6 text-red-700">At Risk</div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <p className="text-sm font-medium">Quality Home Goods</p>
            <Badge className="bg-red-100 text-red-800">8.4% RTO</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <p className="text-sm font-medium">New Seller Inc</p>
            <Badge className="bg-red-100 text-red-800">7.2% RTO</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Predictive Insights</CardTitle>
          <CardDescription>AI-powered RTO forecasting and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-900">Electronics Category Alert</p>
            <p className="text-sm text-blue-800 mt-1">RTO rate trending higher (4.2% vs 3.5% average). Recommend supplier communications and quality checks.</p>
          </div>
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <p className="font-medium text-yellow-900">Seasonal Pattern Detected</p>
            <p className="text-sm text-yellow-800 mt-1">RTO rates typically increase 15% during monsoon season. Prepare logistics partnerships accordingly.</p>
          </div>
          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
            <p className="font-medium text-green-900">Positive Trend</p>
            <p className="text-sm text-green-800 mt-1">Overall marketplace RTO rate decreasing. On-time delivery improvements showing positive impact.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
