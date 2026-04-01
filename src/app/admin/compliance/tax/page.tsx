'use client'

import { Card, CardContent } from '@/components/ui/card'

export default function TaxConfigurationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tax Configuration</h1>
        <p className="text-muted-foreground">Manage GST and tax settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">18%</p>
              <p className="text-sm text-muted-foreground">Standard GST Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">₹24.5Cr</p>
              <p className="text-sm text-muted-foreground">Monthly GST</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-muted-foreground">Registered Suppliers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">28</p>
              <p className="text-sm text-muted-foreground">Non-Registered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          <p>No tax configuration yet</p>
        </div>
      </Card>
    </div>
  )
}
