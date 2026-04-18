"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const REGISTER_WEBHOOKS_ENDPOINT = "dropshipper/shopify/webhook/register";

type RegisterShopifyWebhooksPayload = {
  shop: string;
  access_token: string;
};

export const useRegisterShopifyWebhooks = () => {
  const registerShopifyWebhooks = useMutation({
    mutationFn: async (payload: RegisterShopifyWebhooksPayload) =>
      apiClient.post(REGISTER_WEBHOOKS_ENDPOINT, payload),
  });

  return {
    registerShopifyWebhooks,
  };
};


const UNREGISTER_WEBHOOKS_ENDPOINT = "dropshipper/shopify/webhook/unregister";

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