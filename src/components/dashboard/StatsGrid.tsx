import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, TrendingUp, AlertCircle, Clock, DollarSign, Package } from 'lucide-react'

export type StatsGridStats = {
  totalProducts: number
  gmv: number
  rejectionRate: number
  pendingApprovals: number
  activeSuppliers: number
  listedProducts: number
}

const ADMIN_LABELS = [
  'Total Products',
  'GMV',
  'Rejection %',
  'Pending Approvals',
  'Active Suppliers',
  'Products Listed',
] as const

const ADMIN_HINTS = [
  'Across live + pending',
  'Live products GMV',
  'From reviewed products',
  'Needs review',
  'Currently active',
  'Live catalog',
] as const

type StatsGridProps = {
  /** When omitted (e.g. partner analytics shell), shows zeros. */
  stats?: StatsGridStats
  /** Optional overrides for the six cards (same order as admin defaults). */
  labels?: readonly string[]
  hints?: readonly string[]
  /** Partner metrics reuse the same numeric shape with different semantics. */
  variant?: 'admin' | 'partner'
}

const DEFAULT_STATS: StatsGridStats = {
  totalProducts: 0,
  gmv: 0,
  rejectionRate: 0,
  pendingApprovals: 0,
  activeSuppliers: 0,
  listedProducts: 0,
}

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)

export function StatsGrid({
  stats = DEFAULT_STATS,
  labels = ADMIN_LABELS,
  hints = ADMIN_HINTS,
  variant = 'admin',
}: StatsGridProps) {
  const labelAt = (i: number) => labels[i] ?? ADMIN_LABELS[i]
  const hintAt = (i: number) => hints[i] ?? ADMIN_HINTS[i]

  const positiveAt = (index: number) => {
    if (variant === 'partner') {
      if (index === 2) return stats.rejectionRate < 10
      if (index === 3) return stats.pendingApprovals === 0
    }
    if (index === 2) return stats.rejectionRate < 10
    if (index === 3) return false
    return true
  }

  const cards = [
    {
      icon: ShoppingCart,
      label: labelAt(0),
      value: stats.totalProducts.toString(),
      change: hintAt(0),
      positive: positiveAt(0),
    },
    {
      icon: DollarSign,
      label: labelAt(1),
      value: formatINR(stats.gmv),
      change: hintAt(1),
      positive: positiveAt(1),
    },
    {
      icon: AlertCircle,
      label: labelAt(2),
      value: `${stats.rejectionRate.toFixed(1)}%`,
      change: hintAt(2),
      positive: positiveAt(2),
    },
    {
      icon: Clock,
      label: labelAt(3),
      value: stats.pendingApprovals.toString(),
      change: hintAt(3),
      positive: positiveAt(3),
    },
    {
      icon: TrendingUp,
      label: labelAt(4),
      value: stats.activeSuppliers.toString(),
      change: hintAt(4),
      positive: positiveAt(4),
    },
    {
      icon: Package,
      label: labelAt(5),
      value: stats.listedProducts.toString(),
      change: hintAt(5),
      positive: positiveAt(5),
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="border-border bg-card hover:shadow-sm transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p
                    className={`text-xs font-medium ${
                      stat.positive ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
