"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, BarChart3, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  { icon: Home, label: "Home", href: "/marketplace" },
  { icon: ShoppingCart, label: "Orders", href: "/marketplace/order/manage" },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/marketplace/dashboard/analytics/overview",
  },
  { icon: Menu, label: "Menu", href: "#", isMenu: true },
];

export function BottomNav({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/marketplace") return pathname === "/marketplace";
    if (href === "#") return false;
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-around h-16 lg:hidden">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        if (item.isMenu) {
          return (
            <button
              key={item.label}
              onClick={onMenuClick}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full",
                "text-gray-500 hover:text-gray-800 transition-colors"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full no-underline transition-colors",
              active
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-800"
            )}
          >
            <div
              className={cn(
                "flex flex-col items-center gap-1",
                active && "border-b-2 border-gray-900 pb-0"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}