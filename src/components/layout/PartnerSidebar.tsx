"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/marketplace/dashboard/analytics/overview",
  },
  { icon: Home, label: "Home", href: "/marketplace" },
  {
    icon: Users,
    label: "Manage Orders",
    href: "/marketplace/order/manage",
  },
  {
    icon: Package,
    label: "Manage Ndr",
    href: "/marketplace/manage-ndr",
  },
  {
    icon: DollarSign,
    label: "Supplier Re-Routing",
    href: "/marketplace/supplier-rerouting",
    // children: [
    //   { label: 'Global Commission', href: '/admin/pricing/global' },
    //   { label: 'Category-wise Pricing', href: '/admin/pricing/category' },
    //   { label: 'Supplier Overrides', href: '/admin/pricing/overrides' },
    //   { label: 'Margin Caps', href: '/admin/pricing/margins' },
    // ],
  },
  {
    icon: ShoppingCart,
    label: "Manage Products",
    href: "#",
    children: [
      {
        label: "Inventory Request",
        href: "/marketplace/manage-products/inventoryRequest",
      },
      {
        label: "Pushed To Shopify",
        href: "/marketplace/manage-products/pushedToShopify",
      },
    ],
    // children: [
    //   { label: 'All Orders', href: '/admin/orders' },
    //   { label: 'Processing', href: '/admin/orders/processing' },
    //   { label: 'Shipped', href: '/admin/orders/shipped' },
    //   { label: 'Delivered', href: '/admin/orders/delivered' },
    //   { label: 'Cancelled', href: '/admin/orders/cancelled' },
    // ],
  },
  {
    icon: Truck,
    label: "Source a Product",
    href: "/marketplace/source-a-product",
    // children: [
    //   { label: 'Courier Partners', href: '/admin/logistics/partners' },
    //   { label: 'Serviceability', href: '/admin/logistics/serviceability' },
    //   { label: 'Rate Cards', href: '/admin/logistics/rates' },
    //   { label: 'COD Settings', href: '/admin/logistics/cod' },
    //   { label: 'AWB Management', href: '/admin/logistics/awb' },
    // ],
  },
  {
    icon: RotateCcw,
    label: "RTO Intelligence",
    href: "#",
    children: [
      {
        label: "High RTO Pin Codes",
        // href: "/marketplace/rto-intelligence/high-rto-pin-codes",
        href: "/marketplace/rto-intelligence/pincodes",
      },
      { label: "RTO FAQs", href: "/marketplace/rto-intelligence/faqs" },
    ],
  },
  {
    icon: DollarSign,
    label: "Reports",
    href: "/marketplace/reports",
  },
  {
    icon: TrendingUp,
    label: "Payments",
    href: "/marketplace/payments",
  },
  {
    icon: Settings,
    label: "GST Invoices",
    href: "/marketplace/gst-invoices",
  },
  { icon: HelpCircle, label: "Support", href: "/marketplace/support" },
  { icon: HelpCircle, label: "FAQs", href: "/marketplace/faqs" },
  // { icon: BarChart3, label: 'Value Added Services', href: '/marketplace/value-added-services' },
  // { icon: HelpCircle, label: 'Clout Training', href: '/marketplace/clout-training' },
  // { icon: HelpCircle, label: 'Clout Feedback', href: '/marketplace/clout-feedback' },
];

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
}

export function PartnerSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const newExpanded = new Set<string>();

    menuItems.forEach((item) => {
      if (item.children?.some((child) => pathname.startsWith(child.href))) {
        newExpanded.add(item.label);
      }
    });

    setExpandedItems(newExpanded);
  }, [pathname]);

  const toggleExpand = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string) => {
    if (href === "/marketplace") {
      return pathname === "/marketplace";
    }

    return pathname === href;
  };

  const isAnyChildActive = (children?: Array<{ href: string }>) => {
    return children?.some((child) => pathname.startsWith(child.href));
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen overflow-y-auto flex flex-col sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full my-button text-primary-foreground flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              <img src="/2.png" alt="" />
            </span>
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
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.has(item.label);
            const active =
              isActive(item.href) || isAnyChildActive(item.children);

            return (
              <li key={item.label}>
                <div
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all",
                    active
                      ? "my-button text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:my-button",
                  )}
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpand(item.label);
                    }
                  }}
                >
                  <Link
                    href={item.href !== "#" ? item.href : "#"}
                    className="flex items-center gap-3 flex-1 no-underline"
                    onClick={(e) => {
                      if (item.href === "#") {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                  {hasChildren && (
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isExpanded && "rotate-90",
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
                          href={child.href !== "#" ? child.href : "#"}
                          className={cn(
                            "block px-4 py-2 rounded-lg text-sm transition-all no-underline",
                            pathname === child.href
                              ? "my-button text-sidebar-primary-foreground"
                              : "text-sidebar-foreground hover:my-button",
                          )}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

import React from "react";
