"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Dot,
  RefreshCcw,
  Store,
} from "lucide-react";
import { useSyncOrders } from "@/hooks/useSyncOrders";
import { apiClient } from "@/lib/api-client";
type PanelTab = "orders" | "webhooks" | "setup";

type OrderRow = {
  id: string;
  date: string;
  customer: string;
  contact: string;
  product: string;
  amount: string;
  amountValue: number;
  shipping: string;
  payment: string;
  status: "Pending" | "Confirmed" | "Paid" | "Fulfilled" | "Cancelled";
};

type WebhookRow = {
  topic: string;
  endpoint: string;
  registered: boolean;
};

type SetupStep = {
  id: string;
  title: string;
  description: string;
  cta?: string;
};

const tabs: Array<{ value: PanelTab; label: string }> = [
  { value: "orders", label: "Orders" },
  { value: "webhooks", label: "Webhooks" },
  { value: "setup", label: "Setup guide" },
];

const orderStatusOptions = [
  "All statuses",
  "Pending",
  "Confirmed",
  "Paid",
  "Fulfilled",
  "Cancelled",
] as const;

const initialWebhooks: WebhookRow[] = [
  {
    topic: "orders/create",
    endpoint: "/api/dropshipper/shopify/webhook/orders",
    registered: true,
  },
  {
    topic: "orders/updated",
    endpoint: "/api/dropshipper/shopify/webhook/orders",
    registered: true,
  },
  {
    topic: "orders/paid",
    endpoint: "/api/dropshipper/shopify/webhook/orders",
    registered: false,
  },
  {
    topic: "orders/cancelled",
    endpoint: "/api/dropshipper/shopify/webhook/orders",
    registered: true,
  },
  {
    topic: "orders/fulfilled",
    endpoint: "/api/dropshipper/shopify/webhook/orders",
    registered: true,
  },
];

const setupSteps: SetupStep[] = [
  {
    id: "1",
    title: "Register webhook on Shopify",
    description:
      "POST to Shopify Admin API with your backend URL as the address. Done once per shop.",
    cta: "View Postman request",
  },
  {
    id: "2",
    title: "Backend receives order payload",
    description:
      "Your endpoint at /webhook/orders processes the JSON Shopify sends on each order event.",
    cta: "View handler code",
  },
  {
    id: "3",
    title: "Orders saved to your database",
    description:
      "Backend upserts the order using shopify_order_id as the unique key to avoid duplicates.",
  },
  {
    id: "4",
    title: "Orders appear in this panel",
    description:
      "The order list queries your DB - no Shopify API call needed at read time.",
  },
  {
    id: "5",
    title: "Enable fulfillment webhook (optional)",
    description:
      "Register orders/fulfilled to auto-update status when you mark an order shipped.",
    cta: "Register now",
  },
];

const formatInr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);

const normalizeStatus = (value: unknown): OrderRow["status"] => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (normalized.includes("fulfill")) return "Fulfilled";
  if (normalized.includes("cancel")) return "Cancelled";
  if (normalized.includes("paid")) return "Paid";
  if (normalized.includes("confirm")) return "Confirmed";
  return "Pending";
};

const extractOrderArray = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  if (Array.isArray(payload.orders)) return payload.orders;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.orders))
    return payload.data.orders;
  if (payload.data && Array.isArray(payload.data.rows))
    return payload.data.rows;
  return [];
};

const normalizeApiOrders = (payload: any): OrderRow[] => {
  const rows = extractOrderArray(payload);

  return rows.map((row: any, index: number) => {
    const customerFirst = String(row?.customer?.first_name ?? "").trim();
    const customerLast = String(row?.customer?.last_name ?? "").trim();
    const customerName = `${customerFirst} ${customerLast}`.trim();
    const customer =
      customerName ||
      String(row?.customer_name ?? row?.customer?.name ?? "Unknown Customer");

    const contact = String(
      row?.customer?.phone ??
        row?.customer?.email ??
        row?.email ??
        row?.phone ??
        "-",
    );

    const lineItem = Array.isArray(row?.line_items) ? row.line_items[0] : null;
    const product = String(
      lineItem?.title ?? row?.product_name ?? row?.product ?? "-",
    );

    const amountValue = Number(
      row?.total_price ??
        row?.amount ??
        row?.total_amount ??
        row?.total ??
        row?.price ??
        0,
    );

    const shippingValue = Number(
      row?.shipping_price ??
        row?.shipping_charges ??
        (Array.isArray(row?.shipping_lines)
          ? row.shipping_lines[0]?.price
          : 0) ??
        0,
    );

    const paymentRaw = String(
      row?.payment_method ??
        row?.financial_status ??
        row?.gateway ??
        row?.payment ??
        "COD",
    );
    const payment =
      paymentRaw.toLowerCase().includes("cod") ||
      paymentRaw.toLowerCase().includes("cash")
        ? "COD"
        : "Prepaid";

    const orderNo = String(
      row?.name ??
        row?.order_number ??
        row?.id ??
        row?.shopify_order_id ??
        index + 1,
    );
    const id = orderNo.startsWith("#") ? orderNo : `#${orderNo}`;

    const dateSource =
      row?.created_at ?? row?.order_date ?? row?.createdAt ?? row?.date;
    const formattedDate = dateSource
      ? new Date(dateSource).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

    return {
      id,
      date: formattedDate,
      customer,
      contact,
      product,
      amount: `Rs ${formatInr(amountValue)}`,
      amountValue,
      shipping:
        shippingValue > 0 ? `+Rs ${formatInr(shippingValue)} ship` : "-",
      payment,
      status: normalizeStatus(
        row?.status ?? row?.fulfillment_status ?? row?.financial_status,
      ),
    } as OrderRow;
  });
};

function SummaryCard({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl bg-[#f1f1ed] p-5">
      <p className="text-base font-medium text-[#444]">{label}</p>
      <p
        className={`mt-2 text-4xl leading-none font-semibold ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function OrdersPage() {
  const { syncOrders } = useSyncOrders();
  const [activeTab, setActiveTab] = useState<PanelTab>("orders");
  const [search, setSearch] = useState("");
  const [orderRows, setOrderRows] = useState<OrderRow[]>([]);
  const [isStoreCheckLoading, setIsStoreCheckLoading] = useState(true);
  const [isStoreConnected, setIsStoreConnected] = useState(false);
  const [storeConnectionMessage, setStoreConnectionMessage] = useState(
    "Shopify store not connected",
  );
  const [connectedStoreUrl, setConnectedStoreUrl] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<(typeof orderStatusOptions)[number]>("All statuses");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);
  const [webhookRows, setWebhookRows] = useState<WebhookRow[]>(initialWebhooks);
  const isDisconnectedSkeleton = !isStoreConnected && !isStoreCheckLoading;

  const handleMarkConfirmed = (orderId: string) => {
    setOrderRows((previousRows) =>
      previousRows.map((row) =>
        row.id === orderId && row.status === "Pending"
          ? { ...row, status: "Confirmed" }
          : row,
      ),
    );
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orderRows.filter((order) => {
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.contact.toLowerCase().includes(query);

      const matchesStatus =
        selectedStatus === "All statuses" || order.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [search, selectedStatus, orderRows]);

  const summary = useMemo(() => {
    const totalOrders = orderRows.length;
    const pendingOrders = orderRows.filter(
      (row) => row.status === "Pending",
    ).length;
    const fulfilledOrders = orderRows.filter(
      (row) => row.status === "Fulfilled",
    ).length;
    const revenue = orderRows.reduce(
      (sum, row) => sum + (row.amountValue || 0),
      0,
    );

    return {
      totalOrders,
      pendingOrders,
      fulfilledOrders,
      revenue,
    };
  }, [orderRows]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkStoreConnection = async () => {
      setIsStoreCheckLoading(true);
      try {
        const response = await apiClient.get(
          "dropshipper/shopify/access-token",
        );
        const stores = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        if (stores.length > 0) {
          setIsStoreConnected(true);
          setConnectedStoreUrl(
            String(stores[0]?.store_url ?? stores[0]?.shop ?? ""),
          );
          setStoreConnectionMessage("");
        } else {
          setIsStoreConnected(false);
          setStoreConnectionMessage("Shopify store not connected");
        }
      } catch (error) {
        setIsStoreConnected(false);
        setStoreConnectionMessage(
          error instanceof Error && error.message
            ? error.message
            : "Shopify store not connected",
        );
      } finally {
        setIsStoreCheckLoading(false);
      }
    };

    checkStoreConnection();
  }, []);

  const handleSyncOrders = async () => {
    if (!isStoreConnected || isStoreCheckLoading) return;
    try {
      const response = await syncOrders.mutateAsync();
      const normalizedOrders = normalizeApiOrders(response);
      setOrderRows(normalizedOrders);
    } catch (error) {
      console.error("Failed to sync orders", error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      <section className="rounded-[6px] p-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl leading-tight font-semibold text-[#1f1f1f]">
              Shopify orders
            </h1>
            <p className="text-sm leading-tight text-[#3f3f3f]">
              {connectedStoreUrl || ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-full bg-[#deeed1] px-3 py-1 text-sm font-medium text-[#3f7c25]">
              <div className="h-3 w-3 rounded-full bg-green-600"></div>
              Webhook live
            </div>

            <button
              type="button"
              onClick={handleSyncOrders}
              disabled={
                syncOrders.isPending || !isStoreConnected || isStoreCheckLoading
              }
              className="inline-flex items-center gap-2 rounded-2xl border border-[#d5d5d0] bg-white px-5 py-3 text-sm font-medium text-[#222]"
            >
              <RefreshCcw
                className={`h-5 w-5 ${syncOrders.isPending ? "animate-spin" : ""}`}
              />
              {syncOrders.isPending ? "Syncing..." : "Sync now"}
            </button>

            <button
              type="button"
              className="rounded-2xl border border-[#d5d5d0] bg-white px-5 py-3 text-sm font-semibold text-[#222]"
            >
              Manage webhooks
            </button>
          </div>
        </header>

        {syncOrders.isError && (
          <p className="mt-2 text-xs text-red-600">
            {(syncOrders.error as Error)?.message || "Failed to sync orders"}
          </p>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isDisconnectedSkeleton ? (
            <>
              {/* {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`summary-skeleton-${index}`}
                  className="rounded-xl bg-[#f1f1ed] p-5"
                >
                  <div className="h-6 w-28 rounded bg-[#e4e4de] animate-pulse" />
                  <div className="mt-4 h-10 w-20 rounded bg-[#e4e4de] animate-pulse" />
                </div>
              ))} */}
            </>
          ) : (
            <>
              <SummaryCard
                label="Total orders"
                value={String(summary.totalOrders)}
              />
              <SummaryCard
                label="Pending"
                value={String(summary.pendingOrders)}
                valueClassName="text-[#bb7723]"
              />
              <SummaryCard
                label="Fulfilled"
                value={String(summary.fulfilledOrders)}
                valueClassName="text-[#3d7b24]"
              />
              <SummaryCard
                label="Revenue (INR)"
                value={`Rs ${formatInr(summary.revenue)}`}
              />
            </>
          )}
        </div>

        <section className="mt-6 rounded-2xl  bg-[#f7f7f5] p-5">
          <div className="border-b border-[#dbdbd6] pb-3">
            {isDisconnectedSkeleton ? (
              <div className="inline-flex overflow-hidden rounded-2xl border border-[#cbcbc7] bg-white">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`tab-skeleton-${index}`}
                    className="border-r border-[#cbcbc7] px-6 py-3 last:border-r-0"
                  >
                    <div className="h-5 w-20 rounded bg-[#e8e8e3] animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="inline-flex overflow-hidden rounded-2xl border border-[#cbcbc7] bg-white">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`border-r border-[#cbcbc7] px-6 py-3 text-sm font-semibold text-[#202020] last:border-r-0 ${
                      activeTab === tab.value ? "bg-[#f2f2ed]" : "bg-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeTab === "orders" && (
            <div className="pt-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                {isDisconnectedSkeleton ? (
                  <div className="h-12 w-full max-w-[430px] rounded-xl border border-[#d8d8d3] bg-white px-4 flex items-center">
                    <div className="h-5 w-56 rounded bg-[#ecece7] animate-pulse" />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by order # or customer..."
                    className="h-12 w-full max-w-[430px] rounded-xl border border-[#d8d8d3] bg-white px-4 text-sm text-[#313131] outline-none placeholder:text-[#8a8a84]"
                  />
                )}

                <div className="relative" ref={statusDropdownRef}>
                  {isDisconnectedSkeleton ? (
                    <div className="inline-flex h-10 min-w-40 items-center justify-between gap-2 rounded-xl border border-[#d8d8d3] bg-white px-4">
                      <div className="h-5 w-20 rounded bg-[#ecece7] animate-pulse" />
                      <div className="h-4 w-4 rounded bg-[#ecece7] animate-pulse" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setIsStatusDropdownOpen(
                          (previousState) => !previousState,
                        )
                      }
                      className="inline-flex h-10 min-w-40 items-center justify-between gap-2 rounded-xl border border-[#d8d8d3] bg-white px-4 text-sm text-[#2f2f2f]"
                    >
                      {selectedStatus}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isStatusDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}

                  {isStatusDropdownOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-[#d8d8d3] bg-white shadow-sm">
                      {orderStatusOptions.map((status) => {
                        const isSelected = selectedStatus === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              setSelectedStatus(status);
                              setIsStatusDropdownOpen(false);
                            }}
                            className={`flex w-full items-center px-4 py-2.5 text-left text-sm text-[#2f2f2f] hover:bg-[#f5f5f3] ${
                              isSelected ? "" : ""
                            }`}
                          >
                            <span>{status}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#dcdcd7] bg-white">
                <table className="w-full border-collapse">
                  <thead className="border-b border-[#dfdfda]">
                    <tr className="text-left text-sm font-medium text-[#474742]">
                      {isDisconnectedSkeleton ? (
                        <>
                          {Array.from({ length: 7 }).map((_, index) => (
                            <th
                              key={`head-skeleton-${index}`}
                              className="px-4 py-3"
                            >
                              <div className="h-5 w-16 rounded bg-[#ecece7] animate-pulse" />
                            </th>
                          ))}
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3">Order</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Payment</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Action</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {isStoreCheckLoading &&
                      Array.from({ length: 3 }).map((_, index) => (
                        <tr
                          key={`skeleton-${index}`}
                          className="border-b border-[#e8e8e2] last:border-b-0 animate-pulse"
                        >
                          <td className="px-4 py-4">
                            <div className="h-4 w-20 rounded bg-[#ececec]" />
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-4 w-28 rounded bg-[#ececec]" />
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-4 w-24 rounded bg-[#ececec]" />
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-4 w-20 rounded bg-[#ececec]" />
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-6 w-16 rounded-full bg-[#ececec]" />
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-6 w-20 rounded-full bg-[#ececec]" />
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-7 w-28 rounded-lg bg-[#ececec]" />
                          </td>
                        </tr>
                      ))}

                    {!isStoreCheckLoading && !isStoreConnected && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-lg font-medium text-black/90"
                        >
                          <div className="flex flex-col items-center justify-center gap-2 text-center">
                            <Store className="w-12 h-12 text-gray-300" />
                            <span>
                              {storeConnectionMessage ||
                                "Shopify store not connected"}
                            </span>
                            <span className="text-xs text-gray-400">
                              Click "Link New Shopify Store" to get started.
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!isStoreCheckLoading &&
                      isStoreConnected &&
                      filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-[#e8e8e2] last:border-b-0"
                        >
                          <td className="px-4 py-4 align-top">
                            <p className="text-xs leading-tight font-semibold text-[#222]">
                              {order.id}
                            </p>
                            <p className="text-xs text-[#4f4f4a]">
                              {order.date}
                            </p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <p className="text-xs leading-tight font-medium text-[#222]">
                              {order.customer}
                            </p>
                            <p className="text-xs text-[#4f4f4a]">
                              {order.contact}
                            </p>
                          </td>
                          <td className="px-4 py-4 align-top text-xs leading-tight text-[#2c2c2c]">
                            {order.product}
                          </td>
                          <td className="px-4 py-4 align-top">
                            <p className="text-xs leading-tight font-semibold text-[#1f1f1f]">
                              {order.amount}
                            </p>
                            <p className="text-xs text-[#4f4f4a]">
                              {order.shipping}
                            </p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <span className="inline-flex items-center rounded-full bg-[#efe5d3] px-3 py-1 text-xs font-semibold text-[#9b641e]">
                              {order.payment}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                order.status === "Confirmed"
                                  ? "bg-[#e2efd6] text-[#3f7c25]"
                                  : "bg-[#efe5d3] text-[#94621e]"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <button
                              type="button"
                              onClick={() => handleMarkConfirmed(order.id)}
                              disabled={order.status !== "Pending"}
                              className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                                order.status === "Pending"
                                  ? "bg-linear-to-r from-[#0097b2] to-[#7ed957] text-white hover:bg-[#f9efd9]"
                                  : "cursor-not-allowed border-[#d8d8d3] bg-[#f4f4f1] text-[#7f7f78]"
                              }`}
                            >
                              {order.status === "Pending"
                                ? "Mark Confirmed"
                                : "Confirmed"}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "webhooks" && (
            <div className="pt-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#30302c]">
                  Auto-sync triggers registered on your Shopify store
                </p>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-1 rounded-xl border border-[#d7d7d2] bg-white px-4 text-sm font-semibold text-[#222]"
                >
                  + Add topic
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-xl border border-[#ddddda] bg-white">
                {webhookRows.map((row) => (
                  <div
                    key={row.topic}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e7e2] px-4 py-3 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm leading-tight font-semibold text-[#1f1f1f]">
                        {row.topic}
                      </p>
                      <p className="text-xs text-[#4e4e49]">{row.endpoint}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          row.registered
                            ? "bg-[#e2efd6] text-[#3f7c25]"
                            : "bg-[#f0efeb] text-[#75756f]"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full m-1 ${
                            row.registered ? "bg-[#3f7c25]" : "bg-[#75756f]"
                          }`}
                        ></div>
                        {row.registered ? "Registered" : "Not registered"}
                      </span>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={row.registered}
                        aria-label={`Toggle ${row.topic}`}
                        onClick={() => {
                          setWebhookRows((prev) =>
                            prev.map((item) =>
                              item.topic === row.topic
                                ? { ...item, registered: !item.registered }
                                : item,
                            ),
                          );
                        }}
                        className={`relative h-7 w-12 rounded-full border transition-colors ${
                          row.registered
                            ? "border-[#9fcb86] bg-[#dceecd]"
                            : "border-[#c9c9c4] bg-[#f8f8f6]"
                        }`}
                      >
                        <span
                          className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                            row.registered ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "setup" && (
            <div className="space-y-3 pt-4">
              {setupSteps.map((step) => (
                <div
                  key={step.id}
                  className="rounded-xl border border-[#e2e2dc] bg-[#f2f2ee] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#e2efd6] text-sm font-bold text-[#3f7c25]">
                      {step.id === "5" ? (
                        step.id
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm leading-tight font-semibold text-[#222]">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm leading-tight text-[#444]">
                        {step.description}
                      </p>
                      {step.cta && (
                        <button
                          type="button"
                          className="mt-3 inline-flex h-10 items-center gap-1 rounded-xl border border-[#d1d1cc] bg-white px-4 text-xs font-semibold text-[#262626]"
                        >
                          {step.cta}
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="mt-4 text-center text-base text-[#51514d]">
          Orders sync automatically via webhooks | Last synced just now
        </p>
      </section>
    </div>
  );
}
