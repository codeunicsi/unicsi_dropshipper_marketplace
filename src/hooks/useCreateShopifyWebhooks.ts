"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const CREATE_WEBHOOKS_ENDPOINT = "dropshipper/shopify/webhooks";

type CreateShopifyWebhooksPayload = {
  shop_id: number;
};

export const useCreateShopifyWebhooks = () => {
  const createShopifyWebhooks = useMutation({
    mutationFn: async (payload: CreateShopifyWebhooksPayload) =>
      apiClient.post(CREATE_WEBHOOKS_ENDPOINT, payload),
  });

  return {
    createShopifyWebhooks,
  };
};

