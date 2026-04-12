"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface MrpUpdatePayload {
  productId: string;
  newMRP: number;
}

export interface MrpUpdateResponse {
  success: boolean;
  message?: string;
  shopify_product_id?: string | number;
  data?: unknown;
}

/**
 * Push / update catalog product on the dropshipper's Shopify store via backend
 * (persists shopify_product_id on dropshipper mapping — do not use push-product).
 */
export const usePushToShopify = () => {
  const pushProductToShopify = useMutation({
    mutationFn: async (payload: MrpUpdatePayload) =>
      apiClient.post("dropshipper/shopify/mrp-update", payload) as Promise<MrpUpdateResponse>,
  });

  return {
    pushProductToShopify,
  };
};
