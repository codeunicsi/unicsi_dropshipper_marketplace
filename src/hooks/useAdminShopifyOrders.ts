"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type AdminShopifyFulfillmentRow = {
  fulfillmentId: string;
  supplierId: string;
  status: string;
  updatedAt?: string;
};

export type AdminShopifySupplierRow = {
  supplierId: string;
  fulfillmentId: string;
  status: string;
};

export type AdminShopifyOrderRow = {
  persistedOrderId: string;
  shopDomain: string;
  shopifyOrderId: string;
  shopifyOrderName: string | null;
  shopifyCreatedAt: string | null;
  financialStatus: string | null;
  /** Shopify checkout fulfillment_status from payload (not per-supplier). */
  shopifyFulfillmentStatus: string | null;
  totalPrice: string | null;
  currency: string | null;
  customerName: string | null;
  resellerUserId: string | null;
  resellerName: string | null;
  resellerEmail: string | null;
  lastWebhookTopic: string | null;
  fulfillments: AdminShopifyFulfillmentRow[];
  suppliers: AdminShopifySupplierRow[];
  aggregateFulfillmentStatus: string;
  courier: string | null;
  awbNumber: string | null;
  shipmentStatus: string | null;
};

export type AdminShopifyOrdersFilters = {
  page?: number;
  limit?: number;
  shop?: string;
  resellerUserId?: string;
  supplierId?: string;
  /** Use UNASSIGNED for orders with no supplier fulfillment rows (mapping gaps). */
  fulfillmentStatus?: string;
  from?: string;
  to?: string;
  /** Search order id / payload text (customer, titles, etc.). */
  q?: string;
};

function toQueryString(filters: AdminShopifyOrdersFilters): string {
  const p = new URLSearchParams();
  if (filters.page != null) p.set("page", String(filters.page));
  if (filters.limit != null) p.set("limit", String(filters.limit));
  if (filters.shop?.trim()) p.set("shop", filters.shop.trim());
  if (filters.resellerUserId?.trim())
    p.set("resellerUserId", filters.resellerUserId.trim());
  if (filters.supplierId?.trim()) p.set("supplierId", filters.supplierId.trim());
  if (filters.fulfillmentStatus?.trim())
    p.set("fulfillmentStatus", filters.fulfillmentStatus.trim());
  if (filters.from?.trim()) p.set("from", filters.from.trim());
  if (filters.to?.trim()) p.set("to", filters.to.trim());
  if (filters.q?.trim()) p.set("q", filters.q.trim());
  const s = p.toString();
  return s ? `?${s}` : "";
}

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    page: number;
    limit: number;
    total: number;
    orders: AdminShopifyOrderRow[];
  };
};

export function useAdminShopifyOrders(filters: AdminShopifyOrdersFilters) {
  return useQuery({
    queryKey: ["admin-shopify-orders", filters],
    queryFn: async () => {
      const res = (await apiClient.get(
        `admin/shopify-orders${toQueryString(filters)}`,
      )) as ApiResponse;
      if (res.success === false) {
        throw new Error(
          typeof res.message === "string"
            ? res.message
            : "Failed to load Shopify orders",
        );
      }
      return res.data;
    },
  });
}
