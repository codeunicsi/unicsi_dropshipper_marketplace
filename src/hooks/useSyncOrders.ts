"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const SYNC_ORDERS_ENDPOINT = "dropshipper/shopify/sync/orders";

export const useSyncOrders = () => {
  const syncOrders = useMutation({
    mutationFn: async () => apiClient.get(SYNC_ORDERS_ENDPOINT),
  });

  return {
    syncOrders,
  };
};

