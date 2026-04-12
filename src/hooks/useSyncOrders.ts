"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { shopifyOrdersApi } from "@/lib/shopify-orders-api";

/**
 * Loads orders from the dropshipper's Shopify store (Admin API).
 * This matches what merchants see in Shopify and works without webhooks.
 *
 * The orders page also calls GET shopify-orders/dropshipper/orders and merges status
 * and tracking from Postgres (webhook + sync backfill).
 */
const SHOPIFY_SYNC_ORDERS = shopifyOrdersApi.dropshipperShopifySync;

export const useSyncOrders = () => {
  const syncOrders = useMutation({
    mutationFn: async () => apiClient.get(SHOPIFY_SYNC_ORDERS),
  });

  return {
    syncOrders,
  };
};
