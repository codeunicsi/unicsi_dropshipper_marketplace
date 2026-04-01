"use client";

import { useState, useMemo } from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ActiveTabs, TabItem } from "@/components/ui/active-tabs";

// ─── Types ───────────────────────────────────────────────────────────────────

type NormalOrder = {
  cloutOrderId: string;
  shopifyOrderId: string;
  orderDateNTime: string;
  productDetail: string;
  payment: string;
  consumerDetails: string;
  rtoRisk: string;
  status: string;
};

type BulkOrder = {
  orderId: string;
  productName: string;
  builtyNumber: string;
  builtyDate: string;
  totalUnits: number;
  transporterName: string;
  orderStatus: string;
};

const normalOrders: NormalOrder[] = [];
const bulkOrders: BulkOrder[] = [];

// ─── Tab Configs ──────────────────────────────────────────────────────────────

const NORMAL_ORDER_TABS: TabItem[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Closed", value: "CLOSED" },
  { label: "All Orders", value: "ALL" },
  { label: "Failed to sync", value: "FAILED_TO_SYNC" },
];

const BULK_ORDER_TABS: TabItem[] = [
  { label: "Pending", value: "PENDING" },
  { label: "In Transit", value: "IN_TRANSIT" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "All Orders", value: "ALL" },
];

// ─── Status badge helper ──────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  IN_TRANSIT: "bg-blue-100 text-blue-600",
  DELIVERED: "bg-green-100 text-green-600",
  PENDING: "bg-yellow-100 text-yellow-600",
  CONFIRMED: "bg-purple-100 text-purple-600",
  SHIPPED: "bg-indigo-100 text-indigo-600",
  CLOSED: "bg-gray-100 text-gray-500",
  FAILED_TO_SYNC: "bg-red-100 text-red-500",
};

function StatusBadge({ value }: { value: string }) {
  const color = statusColors[value] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orderType, setOrderType] = useState<"NORMAL" | "BULK">("NORMAL");
  const [activeTab, setActiveTab] = useState("PENDING");
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "COD" | "Prepaid">(
    "ALL",
  );

  // Reset inner tab when switching order type
  function switchOrderType(type: "NORMAL" | "BULK") {
    setOrderType(type);
    setActiveTab("PENDING");
  }

  // ── Normal order tab counts ──
  const normalTabCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPED: 0,
      CLOSED: 0,
      FAILED_TO_SYNC: 0,
    };

    normalOrders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });

    return { ...counts, ALL: normalOrders.length };
  }, [normalOrders]);

  const normalTabs: TabItem[] = NORMAL_ORDER_TABS.map((t) => ({
    ...t,
    count: normalTabCounts[t.value] ?? 0,
  }));

  // ── Bulk order tab counts ──
  const bulkTabCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {
      PENDING: 0,
      IN_TRANSIT: 0,
      DELIVERED: 0,
    };

    bulkOrders.forEach((o) => {
      if (counts[o.orderStatus] !== undefined) {
        counts[o.orderStatus]++;
      }
    });

    return { ...counts, ALL: bulkOrders.length };
  }, [bulkOrders]); // ✅ fix dependency

  const bulkTabs: TabItem[] = BULK_ORDER_TABS.map((t) => ({
    ...t,
    count: bulkTabCounts[t.value] ?? 0,
  }));

  // ── Filtered data ──
  const filteredNormal = useMemo(() => {
    let data =
      activeTab === "ALL"
        ? normalOrders
        : normalOrders.filter((o) => o.status === activeTab);
    if (paymentFilter !== "ALL")
      data = data.filter((o) => o.payment === paymentFilter);
    return data;
  }, [activeTab, paymentFilter]);

  const filteredBulk = useMemo(() => {
    return activeTab === "ALL"
      ? bulkOrders
      : bulkOrders.filter((o) => o.orderStatus === activeTab);
  }, [activeTab]);

  // ── Columns ──
  const normalColumns: Column<NormalOrder>[] = [
    { header: "Clout Order ID", accessor: "cloutOrderId" },
    { header: "Shopify Order ID", accessor: "shopifyOrderId" },
    { header: "Order Date & Time", accessor: "orderDateNTime" },
    { header: "Product Detail", accessor: "productDetail" },
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
    { header: "Consumer Details", accessor: "consumerDetails" },
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

  const bulkColumns: Column<BulkOrder>[] = [
    { header: "Order ID", accessor: "orderId" },
    { header: "Product Name", accessor: "productName" },
    { header: "Builty Number", accessor: "builtyNumber" },
    { header: "Builty Date", accessor: "builtyDate" },
    {
      header: "Total Units",
      accessor: "totalUnits",
      cell: (row) => <span className="font-medium">{row.totalUnits}</span>,
    },
    { header: "Transporter Name", accessor: "transporterName" },
    {
      header: "Order Status",
      accessor: "orderStatus",
      cell: (row) => <StatusBadge value={row.orderStatus} />,
    },
    {
      header: "Action",
      accessor: "orderId",
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
      </div>

      {/* Order Type Toggle — Normal / Bulk */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {(["NORMAL", "BULK"] as const).map((type) => (
          <button
            key={type}
            onClick={() => switchOrderType(type)}
            className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              orderType === type
                ? "border-black text-black"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {type === "NORMAL" ? "Normal Order" : "Bulk Order"}
          </button>
        ))}
      </div>

      {orderType === "NORMAL" ? (
        <>
          {/* Normal Order inner tabs */}
          <ActiveTabs
            tabs={normalTabs}
            active={activeTab}
            onChange={setActiveTab}
          />

          {/* Payment Filter */}
          <div className="flex gap-1">
            {["ALL", "COD", "Prepaid"].map((type) => (
              <button
                key={type}
                onClick={() => setPaymentFilter(type as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${
                  paymentFilter === type
                    ? "bg-black text-white border-black"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <DataTable columns={normalColumns} data={filteredNormal} />
        </>
      ) : (
        <>
          {/* Bulk Order inner tabs */}
          <ActiveTabs
            tabs={bulkTabs}
            active={activeTab}
            onChange={setActiveTab}
          />

          <DataTable columns={bulkColumns} data={filteredBulk} />
        </>
      )}
    </div>
  );
}
