"use client";

import { useState, useMemo } from "react";
import { ActiveTabs, TabItem } from "@/components/ui/active-tabs";
import { StoreDropdown } from "@/components/ui/store-dropdown";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { BulkActionDropdown } from "@/components/ui/bulk-action-dropdown";
import { Download, Upload } from "lucide-react";

type NdrData = {
  dateTime: string;
  orderIds: string;
  productDetails: string;
  payment: string;
  customerDetails: string;
  shipmentDetails: string;
  deliveryAttempts: number;
  status: string;
};

const ndrOrders: NdrData[] = [
  {
    dateTime: "27 Feb 2026, 12:30 PM",
    orderIds: "CLT12345 / SHP56789",
    productDetails: "Nike Shoes - Size 9",
    payment: "Prepaid",
    customerDetails: "Rahul Sharma - Delhi",
    shipmentDetails: "BlueDart - TRK123456",
    deliveryAttempts: 1,
    status: "FAILED_DELIVERY",
  },
  {
    dateTime: "26 Feb 2026, 05:10 PM",
    orderIds: "CLT99999 / SHP88888",
    productDetails: "Adidas Sneakers",
    payment: "COD",
    customerDetails: "Aamir Hashmi - Faridabad",
    shipmentDetails: "Delhivery - TRK987654",
    deliveryAttempts: 2,
    status: "OUT_FOR_DELIVERY",
  },
];

const NDR_TABS: TabItem[] = [
  { label: "Failed Delivery", value: "FAILED_DELIVERY" },
  { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "RTO", value: "RTO" },
];

type ExportButtonProps = {
  onClick?: () => void;
};

export default function ManageNdr() {
  const [store, setStore] = useState("xxncby-gx");
  const [activeTab, setActiveTab] = useState("FAILED_DELIVERY");

  /* ---------------- FILTER DATA ---------------- */
  const filteredData = useMemo(() => {
    return ndrOrders.filter((order) => order.status === activeTab);
  }, [activeTab]);

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns: Column<NdrData>[] = [
    {
      header: "Date & Time",
      accessor: "dateTime",
    },
    {
      header: "Order IDs",
      accessor: "orderIds",
    },
    {
      header: "Product Details",
      accessor: "productDetails",
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
      header: "Customer Details",
      accessor: "customerDetails",
    },
    {
      header: "Shipment Details",
      accessor: "shipmentDetails",
    },
    {
      header: "# Delivery Attempts",
      accessor: "deliveryAttempts",
      cell: (row) => (
        <span className="font-medium text-sm">{row.deliveryAttempts}</span>
      ),
    },
    {
      header: "Actions",
      accessor: "orderIds",
      cell: () => (
        <Button size="sm" className="text-xs">
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage NDR</h1>
          <p className="mt-2 text-sm text-black">
            All orders with at least one failed delivery attempt will be shown
            here.
          </p>
        </div>

        <StoreDropdown
          stores={["xxncby-gx", "demo-store", "Others"]}
          value={store}
          onChange={setStore}
        />
      </div>

      <div className="flex justify-end gap-3">
        <BulkActionDropdown
          items={[
            {
              label: "Take Action In Bulk",
              onClick: () => console.log("Bulk Action Clicked"),
            },
            {
              label: "View Bulk NDR Action Report",
              onClick: () => console.log("Report Clicked"),
            },
          ]}
        />
        <button
          onClick={() => console.log("Export clicked")}
          className="flex items-center gap-2 px-4 py-2 border  bg-[#f8f8f8] hover:bg-slate-50 transition text-xs font-semibold"
        >
          <Upload className="w-4 h-4 text-black" />
          Export
        </button>
      </div>

      {/* Tabs */}
      <ActiveTabs tabs={NDR_TABS} active={activeTab} onChange={setActiveTab} />

      {/* Table */}
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}
