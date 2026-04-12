"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

/** Fetch from Shopify and persist so admin/supplier dashboards share the same DB rows. */
const PERSIST_SYNC_ENDPOINT = "dropshipper/shopify/sync/orders?persist=1";
const DB_LIST_ENDPOINT = "dropshipper/shopify/orders";

/** When `db`, initial load reads DB only (fast); refresh still persists from Shopify. */
export type ShopifyOrdersLoadIntent = "initial" | "refresh";

const useDbOrdersSource =
  process.env.NEXT_PUBLIC_SHOPIFY_ORDERS_SOURCE === "db";

export const useSyncOrders = () => {
  const syncOrders = useMutation({
    mutationFn: async (intent: ShopifyOrdersLoadIntent = "refresh") => {
      if (useDbOrdersSource) {
        if (intent === "initial") {
          return apiClient.get(DB_LIST_ENDPOINT);
        }
        return apiClient.get(PERSIST_SYNC_ENDPOINT);
      }
      // Default: always persist after fetch (dropshipper UI + admin + supplier use one source of truth)
      return apiClient.get(PERSIST_SYNC_ENDPOINT);
    },
  });

  return {
    syncOrders,
    ordersSourceIsDb: useDbOrdersSource,
  };
};
