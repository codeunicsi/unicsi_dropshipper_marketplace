/**
 * Shopify order flow — paths relative to api/v1/ (see apiClient API_BASE_URL).
 * Single place to avoid drift between dropshipper UI, admin UI, and backend routes.
 */
export const shopifyOrdersApi = {
  /** GET — dropshipper persisted rows (merge with sync for status/tracking) */
  dropshipperList: (limit = 250) =>
    `shopify-orders/dropshipper/orders?limit=${limit}`,

  /** GET — Shopify Admin API proxy + DB ingest + routing reconcile */
  dropshipperShopifySync: "dropshipper/shopify/sync/orders",

  /** GET / PATCH — admin */
  adminList: (query: string) => `shopify-orders/admin/orders?${query}`,
  adminRoute: (orderId: string) =>
    `shopify-orders/admin/orders/${orderId}/route`,

  /** POST — registered in Shopify (HMAC); not called from browser */
  webhookPathSegment: "shopify-orders/webhook",
} as const;
