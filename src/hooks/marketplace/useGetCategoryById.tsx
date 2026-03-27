import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

import { listCategories } from "@/lib/api/categories";

export interface ProductVariant {
  variant_id: string;
  product_id: string;
  sku: string;
  title: string;
  price: string;
  compare_at_price: string | null;
  cost_price: string | null;
  inventory_quantity: number;
  inventory_management: string | null;
  weight_grams: number | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  shopify_variant_id: string | null;
  attributes: Record<string, unknown>;
  is_active: boolean;
  dimension_cm: { width: number; height: number; length: number };
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  image_url: string;
  shopify_image_id: string | null;
  alt_text: string | null;
  sort_order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  product_id: string;
  supplier_id: string;
  title: string;
  description: string | null;
  category_id: string;
  brand: string | null;
  mrp: string | null;
  bulk_price: string | null;
  transfer_price: string | null;
  gst_rate: string;
  minimum_order_quantity: number;
  bulk_price_refresh_days: number;
  bulk_price_updated_at: string | null;
  bulk_price_last_reminded_at: string | null;
  approval_status: "approved" | "pending" | "rejected";
  lifecycle_status: "active" | "inactive" | "draft";
  approved_by: string | null;
  approved_at: string | null;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  images: ProductImage[];
  category: ProductCategory;
}

export interface ProductListResponse {
  success: boolean;
  count: number;
  data: Product[];
}

export const useGetProductsByCategory = (categoryId: string) => {
  return useQuery<ProductListResponse>({
    queryKey: ["products", "category", categoryId],
    queryFn: async () =>
      await apiClient.get(`dropshipper/products/category/${categoryId}`),
    enabled: !!categoryId,
  });
};

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories({ active: true }),
  });
};
