"use client";
import { Column, DataTable } from "@/components/ui/data-table";
import { StoreDropdown } from "@/components/ui/store-dropdown";
import React, { useState } from "react";

type PaymentOrderData = {
  shopify: string;
  orderId: string;
  cloutOrderId: string;
  orderDate: string;
  orderStatus: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentMode: "Prepaid" | "COD";
  paymentStatus: "Paid" | "Pending" | "Failed";
  margin: number;
  rtoReturnCharges: number;
  shipping: number;
  discount: number;
  netPayment: number;
  paymentDate: string;
  transactionId: string;
};

const paymentOrders: PaymentOrderData[] = [
  {
    shopify: "Yes",
    orderId: "SHP56789",
    cloutOrderId: "CLT12345 / SUB001",
    orderDate: "03 Mar 2026",
    orderStatus: "Delivered",
    paymentMode: "Prepaid",
    paymentStatus: "Paid",
    margin: 250,
    rtoReturnCharges: 0,
    shipping: 60,
    discount: 100,
    netPayment: 1650,
    paymentDate: "05 Mar 2026",
    transactionId: "TXN987654321",
  },
  {
    shopify: "Yes",
    orderId: "SHP99999",
    cloutOrderId: "CLT88888 / SUB002",
    orderDate: "02 Mar 2026",
    orderStatus: "Cancelled",
    paymentMode: "COD",
    paymentStatus: "Pending",
    margin: 180,
    rtoReturnCharges: 120,
    shipping: 50,
    discount: 0,
    netPayment: 1400,
    paymentDate: "-",
    transactionId: "-",
  },
];

const columns: Column<PaymentOrderData>[] = [
  {
    header: "Shopify",
    accessor: "shopify",
  },
  {
    header: "Order ID",
    accessor: "orderId",
  },
  {
    header: "CloutOrderID/ SuborderID",
    accessor: "cloutOrderId",
  },
  {
    header: "Order Date",
    accessor: "orderDate",
  },
  {
    header: "Order Status",
    accessor: "orderStatus",
    cell: (row) => (
      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600">
        {row.orderStatus}
      </span>
    ),
  },
  {
    header: "Payment",
    accessor: "paymentMode",
  },
  {
    header: "Status",
    accessor: "paymentStatus",
    cell: (row) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.paymentStatus === "Paid"
            ? "bg-green-100 text-green-600"
            : row.paymentStatus === "Pending"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-red-100 text-red-600"
        }`}
      >
        {row.paymentStatus}
      </span>
    ),
  },
  {
    header: "Margin",
    accessor: "margin",
    cell: (row) => <span>₹{row.margin}</span>,
  },
  {
    header: "RTO/Return Charges",
    accessor: "rtoReturnCharges",
    cell: (row) => <span>₹{row.rtoReturnCharges}</span>,
  },
  {
    header: "Shipping",
    accessor: "shipping",
    cell: (row) => <span>₹{row.shipping}</span>,
  },
  {
    header: "Discount",
    accessor: "discount",
    cell: (row) => <span>-₹{row.discount}</span>,
  },
  {
    header: "Net Payment",
    accessor: "netPayment",
    cell: (row) => (
      <span className="font-semibold text-green-600">₹{row.netPayment}</span>
    ),
  },
  {
    header: "Payment Date",
    accessor: "paymentDate",
  },
  {
    header: "Transaction ID",
    accessor: "transactionId",
  },
];

const OrderPaymentTrackerPage = () => {
  const [store, setStore] = useState("All");
  return (
    <>
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          {" "}
          <p className="text-base text-gray-500">Payments /</p>
          <h1 className="text-2xl text-black font-bold py-1">
            Order Payment Tracker
          </h1>
        </div>
        <div className="flex gap-3">
          {" "}
          <div className="flex flex-col ">
            <label className="text-xs p-1">{"Store"}</label>
            <StoreDropdown
              stores={["xxncby-gx", "demo-store", "Others"]}
              value={store}
              onChange={setStore}
            />
          </div>
          <div className="flex flex-col ">
            <label className="text-xs p-1">{"Order Placed Date"}</label>
            <StoreDropdown
              stores={["xxncby-gx", "demo-store", "Others"]}
              value={store}
              onChange={setStore}
            />
          </div>
          <div className="flex flex-col ">
            <label className="text-xs p-1">{"Product Name"}</label>
            <StoreDropdown
              stores={["xxncby-gx", "demo-store", "Others"]}
              value={store}
              onChange={setStore}
            />
          </div>
        </div>
      </div>
      <div className="py-4 border-b">
        <p className="text-sm text-gray-600">Total Orders Placed: --</p>
        <h3 className="text-lg font-bold py-1">Net Orders for Payment: --</h3>
      </div>
      <div>
        <h3 className="text-lg font-bold py-6">Order Details</h3>
        <div className="overflow-hidden">
          <DataTable columns={columns} data={paymentOrders} />
        </div>
      </div>
    </>
  );
};

export default OrderPaymentTrackerPage;
