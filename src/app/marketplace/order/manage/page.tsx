"use client";

import { useState, useMemo } from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ActiveTabs, TabItem } from "@/components/ui/active-tabs";
import { StoreDropdown } from "@/components/ui/store-dropdown";

type Data = {
  cloutOrderId: string;
  shopifyOrderId: string;
  orderDateNTime: string;
  productDetail: string;
  payment: string;
  consumerDetails: string;
  rtoRisk: string;
  status: string;
};

const orders: Data[] = [
  {
    cloutOrderId: "CLT12345",
    shopifyOrderId: "SHP56789",
    orderDateNTime: "2026-02-27 12:30 PM",
    productDetail: "Nike Shoes - Size 9",
    payment: "Prepaid",
    consumerDetails: "Rahul Sharma - Delhi",
    rtoRisk: "Low",
    status: "PENDING",
  },
  {
    cloutOrderId: "CLT99999",
    shopifyOrderId: "SHP88888",
    orderDateNTime: "2026-02-26 05:10 PM",
    productDetail: "Adidas Sneakers",
    payment: "COD",
    consumerDetails: "Aamir Hashmi - Faridabad",
    rtoRisk: "High",
    status: "CONFIRMED",
  },
];

const ORDER_TABS: TabItem[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Closed", value: "CLOSED" },
  { label: "All Orders", value: "ALL" },
  { label: "Failed to sync", value: "FAILED_TO_SYNC" },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "COD" | "Prepaid">(
    "ALL",
  );
  const [store, setStore] = useState("xxncby-gx");

  const tabCounts = useMemo(() => {
    const counts = {
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPED: 0,
      CLOSED: 0,
      FAILED_TO_SYNC: 0,
    };

    orders.forEach((order) => {
      if (counts[order.status as keyof typeof counts] !== undefined) {
        counts[order.status as keyof typeof counts]++;
      }
    });

    return {
      ...counts,
      ALL: orders.length,
    };
  }, [orders]);

  const ORDER_TABS: TabItem[] = [
    { label: "Pending", value: "PENDING", count: tabCounts.PENDING },
    { label: "Confirmed", value: "CONFIRMED", count: tabCounts.CONFIRMED },
    { label: "Shipped", value: "SHIPPED", count: tabCounts.SHIPPED },
    { label: "Closed", value: "CLOSED", count: tabCounts.CLOSED },
    { label: "All Orders", value: "ALL", count: tabCounts.ALL },
    {
      label: "Failed to sync",
      value: "FAILED_TO_SYNC",
      count: tabCounts.FAILED_TO_SYNC,
    },
  ];

  const filteredOrders = useMemo(() => {
    if (activeTab === "ALL") return orders;
    return orders.filter((order) => order.status === activeTab);
  }, [activeTab]);

  const columns: Column<Data>[] = [
    {
      header: "Clout Order ID",
      accessor: "cloutOrderId",
    },
    {
      header: "Shopify Order ID",
      accessor: "shopifyOrderId",
    },
    {
      header: "Order Date & Time",
      accessor: "orderDateNTime",
    },
    {
      header: "Product Detail",
      accessor: "productDetail",
    },
    {
      header: "Payment",
      accessor: "payment",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.payment === "Prepaid"
              ? "bg-green-100 text-green-600"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {row.payment}
        </span>
      ),
    },
    {
      header: "Consumer Details",
      accessor: "consumerDetails",
    },
    {
      header: "RTO Risk",
      accessor: "rtoRisk",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.rtoRisk === "High"
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {row.rtoRisk}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: "cloutOrderId",
      cell: () => (
        <Button size="sm" className="text-xs">
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Orders</h1>
        <div className="text-sm">
          <StoreDropdown
            stores={["xxncby-gx", "demo-store", "Others"]}
            value={store}
            onChange={setStore}
          />
        </div>
      </div>

      {/* Tabs */}
      <ActiveTabs
        tabs={ORDER_TABS}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* Payment Filter */}
      <div className="flex gap-1 mt-4">
        {["ALL", "COD", "Prepaid"].map((type) => (
          <button
            key={type}
            onClick={() => setPaymentFilter(type as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${
              paymentFilter === type
                ? "bg-black text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredOrders} />
    </div>
  );
}
