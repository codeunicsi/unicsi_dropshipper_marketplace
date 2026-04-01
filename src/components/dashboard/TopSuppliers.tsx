import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { DashboardTopSupplier } from '@/hooks/useAdminDashboard'

type TopSuppliersProps = {
  suppliers?: DashboardTopSupplier[]
  title?: string
  description?: string
}

export function TopSuppliers({
  suppliers = [],
  title = 'Top Suppliers by Performance',
  description = 'Based on live and pending product volume',
}: TopSuppliersProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suppliers.length === 0 && (
            <p className="text-sm text-muted-foreground">No supplier activity available yet.</p>
          )}
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="flex items-center justify-between rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {supplier.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {supplier.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {supplier.totalProducts} products • Live: {supplier.liveProducts}
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <Badge variant={supplier.status === 'Active' ? 'default' : 'secondary'} className="mb-1 block">
                  {supplier.status}
                </Badge>
                <p className="text-xs text-muted-foreground">Pending: {supplier.pendingProducts}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
