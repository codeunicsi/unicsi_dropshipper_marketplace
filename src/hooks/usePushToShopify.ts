"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const PUSH_TO_SHOPIFY_ENDPOINT = "dropshipper/shopify/push-product";

export interface ShopifyVariant {
  option1?: string;
  price?: string;
  sku?: string;
  weight_grams?: number | string;
  weight?: number | string;
  shipping_discount?: number | string;
  rto_charges?: number | string;
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

export interface PushToShopifyPayload {
  access_token: string;
  shop: string;
  productData: any; // or define proper interface later
  productId?: string;
}

export interface PushToShopifyResponse {
  success: boolean;
  message: string;
  productId?: string;
}

export const usePushToShopify = () => {
  const pushProductToShopify = useMutation({
    mutationFn: async (payload: PushToShopifyPayload) =>
      apiClient.post(PUSH_TO_SHOPIFY_ENDPOINT, payload), // ✅ send full payload directly
  });

  return {
    pushProductToShopify,
  };
};
