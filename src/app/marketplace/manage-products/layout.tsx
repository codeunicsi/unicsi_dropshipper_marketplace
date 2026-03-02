"use client";

import { ActiveTabs } from "@/components/ui/active-tabs";
import { StoreDropdown } from "@/components/ui/store-dropdown";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function ManageProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { label: "Pushed To Shopify", value: "pushedToShopify" },
    { label: "Inventory Requests", value: "inventoryRequest" },
  ];

  const [store, setStore] = useState("xxncby-gx");

  //  Active tab derive from route
  const active = pathname.includes("inventoryRequest")
    ? "inventoryRequest"
    : "pushedToShopify";

  return (
    <>
      <div className="flex flex-row justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manage Products</h1>
          <p>Manage all your products and inventory from here.</p>
        </div>
        <div className="text-sm">
          <StoreDropdown
            stores={["xxncby-gx", "demo-store", "Others"]}
            value={store}
            onChange={setStore}
          />
        </div>
      </div>
      <div className="p-6">
        <ActiveTabs
          tabs={tabs}
          active={active}
          onChange={(value) =>
            router.push(`/marketplace/manage-products/${value}`)
          }
        />

        <div className="mt-6">{children}</div>
      </div>
    </>
  );
}
