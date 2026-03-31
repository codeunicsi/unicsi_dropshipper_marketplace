"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const PUSH_TO_SHOPIFY_ENDPOINT = "dropshipper/shopify/push-product";

export interface PushToShopifyPayload {
  productId: string;
}

export interface ShopifyVariant {
  option1?: string;
  price?: string;
  sku?: string;
}

export interface ShopifyImage {
  src?: string;
}

export interface ShopifyProduct {
  title?: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  status?: string;
  variants?: ShopifyVariant[];
  images?: ShopifyImage[];
}

export interface PushToShopifyResponse {
  access_token?: string;
  shop?: string;
  productData?: {
    product?: ShopifyProduct;
  };
}

export const usePushToShopify = () => {
  const pushProductToShopify = useMutation({
    mutationFn: async (payload: PushToShopifyPayload) =>
      apiClient.post(PUSH_TO_SHOPIFY_ENDPOINT, {
        product_id: payload.productId,
      }),
  });

  return {
    pushProductToShopify,
  };
};
