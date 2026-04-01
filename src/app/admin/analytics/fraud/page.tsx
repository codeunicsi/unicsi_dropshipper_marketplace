'use client'

import { Card, CardContent } from '@/components/ui/card'

export default function FraudDetectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Fraud Detection</h1>
        <p className="text-muted-foreground">Monitor and track fraudulent activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">12</p>
              <p className="text-sm text-muted-foreground">Flagged Cases</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">0.12%</p>
              <p className="text-sm text-muted-foreground">Fraud Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">₹8.2L</p>
              <p className="text-sm text-muted-foreground">Loss Prevented</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">97.8%</p>
              <p className="text-sm text-muted-foreground">Detection Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          <p>No fraud analytics yet</p>
        </div>
      </Card>
    </div>
  )
}
