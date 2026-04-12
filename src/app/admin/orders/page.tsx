"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { shopifyOrdersApi } from "@/lib/shopify-orders-api";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Admin — Manage Orders page
 *
 * Tab 1: Bulk Orders     (existing flow — links to /admin/orders/bulk-review)
 * Tab 2: Shopify Orders  (new flow — ShopifyOrder model)
 *
 * Uses apiClient (cookie-based auth) — same as all other admin pages.
 * Does NOT touch the existing bulk order flow.
 */

// ── Types ────────────────────────────────────────────────────────────────────
interface ShopifyLineItem {
  title: string;
  quantity: number;
  price: string;
  sku?: string;
}

interface ShopifyOrderRow {
  id: string;
  shopify_order_id: string;
  shopify_order_number: string | null;
  store_id: string;
  dropshipper_user_id: string;
  supplier_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  line_items: ShopifyLineItem[];
  subtotal_price: string | null;
  total_price: string | null;
  currency: string | null;
  status: string;
  tracking_number: string | null;
  tracking_company: string | null;
  shopify_fulfillment_id: string | null;
  fulfilled_at: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Status colours ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: "#fff3e0", text: "#e65100", border: "#ffcc80" },
  routed: { bg: "#e3f2fd", text: "#1565c0", border: "#90caf9" },
  accepted: { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
  packed: { bg: "#f3e5f5", text: "#6a1b9a", border: "#ce93d8" },
  shipped: { bg: "#e0f2f1", text: "#00695c", border: "#80cbc4" },
  fulfilled: { bg: "#e8eaf6", text: "#283593", border: "#9fa8da" },
  delivered: { bg: "#f9fbe7", text: "#558b2f", border: "#c5e1a5" },
  cancelled: { bg: "#fce4ec", text: "#b71c1c", border: "#ef9a9a" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || { bg: "#f5f5f5", text: "#555", border: "#ddd" };
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
      textTransform: "capitalize", whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}

// ── Status filter tabs ────────────────────────────────────────────────────────
const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "New", value: "new" },
  { label: "Routed", value: "routed" },
  { label: "Accepted", value: "accepted" },
  { label: "Shipped", value: "shipped" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Cancelled", value: "cancelled" },
];

// ── Shopify Orders Table ──────────────────────────────────────────────────────
function ShopifyOrdersTable() {
  const [orders, setOrders] = useState<ShopifyOrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [routing, setRouting] = useState<Record<string, boolean>>({});
  const [supplierIds, setSupplierIds] = useState<Record<string, string>>({});
  const LIMIT = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (statusFilter) params.set("status", statusFilter);

      // apiClient uses credentials:"include" (cookie auth) automatically
      const data = await apiClient.get(shopifyOrdersApi.adminList(params.toString()));

      if (data?.success) {
        setOrders(data.data?.orders ?? []);
        setTotal(data.data?.count ?? 0);
      } else {
        setError(data?.error || "Failed to load orders");
      }
    } catch (e: unknown) {
      const err = e as Error;
      setError(err?.message || "Network error — check if backend is running");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const routeOrder = async (id: string) => {
    const sid = supplierIds[id]?.trim();
    if (!sid) return;
    setRouting((p) => ({ ...p, [id]: true }));
    try {
      await apiClient.patch(shopifyOrdersApi.adminRoute(id), { supplierId: sid });
      await fetchOrders();
    } catch (e: unknown) {
      const err = e as Error;
      alert(`Route failed: ${err?.message}`);
    } finally {
      setRouting((p) => ({ ...p, [id]: false }));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading Shopify orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold mb-1">Failed to load orders</p>
          <p className="text-xs opacity-80">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-2 text-xs font-semibold underline underline-offset-2 opacity-70 hover:opacity-100"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2 items-center">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${statusFilter === f.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:bg-muted/60"
              }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={fetchOrders}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {total} order{total !== 1 ? "s" : ""}
        {statusFilter ? ` with status "${statusFilter}"` : " total"}
      </p>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted/30 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No Shopify orders found.
            {!statusFilter && " When a customer purchases from a dropshipper's Shopify store, orders will appear here."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
          <table className="w-full border-collapse text-sm" style={{ minWidth: 960 }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#0097b2,#7ed957)" }}>
                {["Order #", "Date", "Customer", "Items", "Total", "Status", "Tracking", "Route to Supplier"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 14px", color: "#fff", fontWeight: 700,
                      fontSize: 11, textAlign: "left", textTransform: "uppercase",
                      letterSpacing: ".05em", whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr
                  key={o.id}
                  style={{
                    background: i % 2 ? "var(--muted, #fafafa)" : "var(--background, #fff)",
                    borderBottom: "1px solid var(--border, #f0f0f0)",
                  }}
                >
                  {/* Order # */}
                  <td style={{ padding: "13px 14px", fontWeight: 700, color: "#0097b2", fontSize: 13 }}>
                    #{o.shopify_order_number || o.id.slice(0, 8)}
                  </td>

                  {/* Date */}
                  <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--muted-foreground, #666)" }}>
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>

                  {/* Customer */}
                  <td style={{ padding: "13px 14px" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{o.customer_name || "—"}</div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground, #888)" }}>{o.customer_email || ""}</div>
                  </td>

                  {/* Items */}
                  <td style={{ padding: "13px 14px" }}>
                    {(o.line_items || []).map((item, j) => (
                      <div key={j} style={{ fontSize: 12, color: "var(--foreground, #333)" }}>
                        {item.title} ×{item.quantity}
                      </div>
                    ))}
                  </td>

                  {/* Total */}
                  <td style={{ padding: "13px 14px", fontWeight: 600, fontSize: 13 }}>
                    {o.currency || "₹"} {o.total_price || "—"}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "13px 14px" }}>
                    <StatusBadge status={o.status} />
                  </td>

                  {/* Tracking */}
                  <td style={{ padding: "13px 14px", fontSize: 12 }}>
                    {o.tracking_number ? (
                      <div>
                        <span style={{ fontWeight: 600 }}>🚚 {o.tracking_number}</span>
                        {o.tracking_company && (
                          <div style={{ color: "var(--muted-foreground, #999)", fontSize: 11, marginTop: 2 }}>
                            {o.tracking_company}
                          </div>
                        )}
                      </div>
                    ) : "—"}
                  </td>

                  {/* Route */}
                  <td style={{ padding: "13px 14px" }}>
                    {["new", "routed"].includes(o.status) ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <input
                          placeholder="Paste Supplier ID"
                          value={supplierIds[o.id] || ""}
                          onChange={(e) =>
                            setSupplierIds((p) => ({ ...p, [o.id]: e.target.value }))
                          }
                          style={{
                            padding: "5px 10px", border: "1.5px solid var(--border, #ddd)",
                            borderRadius: 6, fontSize: 12, width: 160,
                            outline: "none", background: "var(--background, #fff)",
                            color: "var(--foreground, #333)",
                          }}
                        />
                        <button
                          onClick={() => routeOrder(o.id)}
                          disabled={routing[o.id] || !supplierIds[o.id]?.trim()}
                          style={{
                            padding: "5px 14px", border: "none", borderRadius: 6,
                            background: "#0097b2", color: "#fff",
                            fontSize: 12, fontWeight: 700, cursor: "pointer",
                            opacity: (routing[o.id] || !supplierIds[o.id]?.trim()) ? 0.5 : 1,
                            transition: "opacity .15s",
                          }}
                        >
                          {routing[o.id] ? "…" : "Route"}
                        </button>
                        {o.supplier_id && (
                          <span style={{ fontSize: 10, color: "var(--muted-foreground, #aaa)" }}>
                            Current: {o.supplier_id.slice(0, 8)}…
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--muted-foreground, #aaa)" }}>
                        {o.supplier_id
                          ? `Supplier: ${o.supplier_id.slice(0, 8)}…`
                          : "—"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground disabled:opacity-40 hover:bg-muted/60 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground disabled:opacity-40 hover:bg-muted/60 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"shopify" | "bulk">("bulk");

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 pb-12">
      {/* Header */}
      <div className="mt-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Manage Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Central order visibility across all dropshipper Shopify stores.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-border">
        {(["bulk", "shopify"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {t === "shopify" ? "Shopify Orders" : "Bulk Orders"}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "shopify" ? (
        <ShopifyOrdersTable />
      ) : (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-base font-semibold text-foreground">Bulk Orders</p>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Manage payment-proof bulk orders from the dedicated bulk orders review panel.
            </p>
            <a
              href="/admin/orders/bulk-review"
              className="inline-flex items-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Go to Bulk Orders →
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
