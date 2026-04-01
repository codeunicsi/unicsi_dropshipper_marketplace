import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Clock, Zap } from 'lucide-react'
import type { DashboardAlert } from '@/hooks/useAdminDashboard'

type AlertsSectionProps = {
  alerts?: DashboardAlert[]
}

export function AlertsSection({ alerts = [] }: AlertsSectionProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
        <CardDescription>Active alerts requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 && (
            <p className="text-sm text-muted-foreground">No active alerts right now.</p>
          )}
          {alerts.map((alert, index) => {
            const Icon = alert.severity === 'danger' ? Zap : alert.severity === 'warning' ? TrendingUp : Clock
            const bgColor = {
              warning: 'bg-[rgba(126,217,87,0.1)] border-l-4 border-accent',
              info: 'bg-[rgba(0,151,178,0.1)] border-l-4 border-primary',
              danger: 'bg-red-50 border-l-4 border-destructive',
            }[alert.severity]

            const iconColor = {
              warning: 'text-accent',
              info: 'text-primary',
              danger: 'text-destructive',
            }[alert.severity]

            return (
              <div key={index} className={`p-3 rounded ${bgColor}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {alert.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
