'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Activity,
  BarChart3,
  ShoppingCart,
  Package,
  Truck,
  RotateCcw,
  DollarSign,
  TrendingUp,
  Settings,
  Users,
  FileText,
  AlertCircle,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
  {
    icon: Users,
    label: 'Supplier Management',
    href: '#',
    children: [
      { label: 'All Suppliers', href: '/admin/suppliers' },
      { label: 'KYC Verification', href: '/admin/suppliers/kyc' },
      // { label: 'Performance Metrics', href: '/admin/suppliers/metrics' },
      // { label: 'Supplier Disputes', href: '/admin/suppliers/disputes' },
    ],
  },
  {
    icon: Package,
    label: 'Product Management',
    href: '#',
    children: [
      { label: 'Pending Approvals', href: '/admin/products/pending' },
      { label: 'Live Products', href: '/admin/products/live' },
      { label: 'Rejected Products', href: '/admin/products/rejected' },
      // { label: 'Categories', href: '/admin/products/categories' },
      // { label: 'Attributes', href: '/admin/products/attributes' },
    ],
  },
  {
    icon: DollarSign,
    label: 'Pricing & Commission',
    href: '#',
    children: [
      { label: 'Global Commission', href: '/admin/pricing/global' },
      { label: 'Category-wise Pricing', href: '/admin/pricing/category' },
      { label: 'Supplier Overrides', href: '/admin/pricing/overrides' },
      { label: 'Margin Caps', href: '/admin/pricing/margins' },
    ],
  },
  {
    icon: ShoppingCart,
    label: 'Order Management',
    href: '#',
    children: [
      { label: 'All Orders', href: '/admin/orders' },
      { label: 'Processing', href: '/admin/orders/processing' },
      { label: 'Shipped', href: '/admin/orders/shipped' },
      { label: 'Delivered', href: '/admin/orders/delivered' },
      { label: 'Cancelled', href: '/admin/orders/cancelled' },
    ],
  },
  {
    icon: Truck,
    label: 'Logistics & Courier',
    href: '#',
    children: [
      { label: 'Courier Partners', href: '/admin/logistics/partners' },
      { label: 'Serviceability', href: '/admin/logistics/serviceability' },
      { label: 'Rate Cards', href: '/admin/logistics/rates' },
      { label: 'COD Settings', href: '/admin/logistics/cod' },
      { label: 'AWB Management', href: '/admin/logistics/awb' },
    ],
  },
  {
    icon: RotateCcw,
    label: 'RTO & Disputes',
    href: '#',
    children: [
      { label: 'RTO Rules', href: '/admin/rto/rules' },
      { label: 'RTO Orders', href: '/admin/rto/orders' },
      { label: 'Dispute Tickets', href: '/admin/rto/tickets' },
      { label: 'Penalties', href: '/admin/rto/penalties' },
      { label: 'RTO Intelligence', href: '/admin/rto/intelligence' },
    ],
  },
  {
    icon: DollarSign,
    label: 'Payouts & Wallet',
    href: '#',
    children: [
      { label: 'Supplier Payouts', href: '/admin/payouts/suppliers' },
      { label: 'Partner Payouts', href: '/admin/payouts/partners' },
      { label: 'Settlement Reports', href: '/admin/payouts/settlement' },
      { label: 'Transaction History', href: '/admin/payouts/transactions' },
      { label: 'Wallet Management', href: '/admin/payouts/wallet' },
    ],
  },
  {
    icon: TrendingUp,
    label: 'Analytics & Reports',
    href: '#',
    children: [
      { label: 'Sales Analytics', href: '/admin/analytics/sales' },
      { label: 'Supplier Performance', href: '/admin/analytics/suppliers' },
      { label: 'RTO Analytics', href: '/admin/analytics/rto' },
      { label: 'Fraud Detection', href: '/admin/analytics/fraud' },
      { label: 'Custom Reports', href: '/admin/analytics/custom' },
    ],
  },
  {
    icon: Settings,
    label: 'Compliance & Settings',
    href: '#',
    children: [
      { label: 'KYC Management', href: '/admin/compliance/kyc' },
      { label: 'Tax Configuration', href: '/admin/compliance/tax' },
      { label: 'Audit Logs', href: '/admin/compliance/audit' },
      { label: 'User Roles', href: '/admin/compliance/roles' },
      { label: 'Feature Flags', href: '/admin/compliance/flags' },
      { label: 'API Keys', href: '/admin/compliance/api-keys' },
    ],
  },
  { icon: BarChart3, label: 'Activity', href: '/admin/activity' },
  { icon: HelpCircle, label: 'Help & Support', href: '/admin/support' },
]

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  children?: Array<{ label: string; href: string }>
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set())

  const toggleExpand = (label: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedItems(newExpanded)
  }

  const isActive = (href: string) => {
    return pathname.startsWith(href) && href !== '#'
  }

  const isAnyChildActive = (children?: Array<{ href: string }>) => {
    return children?.some((child) => pathname.startsWith(child.href))
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen overflow-y-auto flex flex-col sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full my-button text-primary-foreground flex items-center justify-center">
            <span className="text-sm font-bold text-primary">U</span>
          </div>
          <div>
            <p className="font-bold text-sidebar-foreground">UNICSI</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-2">
          {menuItems.map((item: MenuItem) => {
            const Icon = item.icon
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedItems.has(item.label)
            const active =
              isActive(item.href) || isAnyChildActive(item.children)

            return (
              <li key={item.label}>
                <div
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all',
                    active
                      ? 'my-button text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:my-button'
                  )}
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpand(item.label)
                    }
                  }}
                >
                  <Link
                    href={item.href !== '#' ? item.href : '#'}
                    className="flex items-center gap-3 flex-1 no-underline"
                    onClick={(e) => {
                      if (item.href === '#') {
                        e.preventDefault()
                      }
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                  {hasChildren && (
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 transition-transform',
                        isExpanded && 'rotate-90'
                      )}
                    />
                  )}
                </div>

                {/* Sub Items */}
                {hasChildren && isExpanded && (
                  <ul className="ml-4 mt-2 space-y-1 border-l border-sidebar-border pl-3">
                    {item.children?.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href !== '#' ? child.href : '#'}
                          className={cn(
                            'block px-4 py-2 rounded-lg text-sm transition-all no-underline',
                            pathname === child.href
                              ? 'my-button text-sidebar-primary-foreground'
                              : 'text-sidebar-foreground hover:my-button'
                          )}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

import React from 'react'
