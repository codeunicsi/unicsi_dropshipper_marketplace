"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const UNREGISTER_WEBHOOKS_ENDPOINT = "dropshipper/shopify/webhooks/unregister";

type UnregisterShopifyWebhooksPayload = {
  shop: string;
  access_token: string;
};

export const useUnregisterShopifyWebhooks = () => {
  const unregisterShopifyWebhooks = useMutation({
    mutationFn: async (payload: UnregisterShopifyWebhooksPayload) =>
      apiClient.post(UNREGISTER_WEBHOOKS_ENDPOINT, payload),
  });

  return {
    unregisterShopifyWebhooks,
  };
};

