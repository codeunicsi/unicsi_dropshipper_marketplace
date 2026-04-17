"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  QueryFunction,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export interface GetProductsResponse {
  success: boolean;
  message: string;
  count: number;
  data: Product[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  createdAt: string; // or Date
  updatedAt: string; // or Date
}

export interface Product {
  product_id: string;
  supplier_id: string;
  title: string;
  description: string;
  category_id: number | null;
  brand: string;
  approval_status: string;
  lifecycle_status: string;
  approved_by: string;
  approved_at: string;
  createdAt: string;
  updatedAt: string;
  bulk_price: string;
  bulk_price_refresh_days: number;
  variants: ProductVariant[];
  images: ProductImage[];
  category?: Category;
  dropshipperSellingPrice: number;
  gst_rate?:string;
  mrp:string
}

export interface ProductVariant {
  variant_id: string;
  product_id: string;
  sku: string;

  // ✅ Updated fields based on API
  title: string | null;
  price: string;
  compare_at_price: string | null;
  cost_price: string | null;

  inventory_quantity: number;
  inventory_management: string;

  weight_grams: number;

  option1: string | null; // color
  option2: string | null; // size
  option3: string | null;

  shopify_variant_id: string | null;

  attributes: Record<string, any>;

  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VariantAttributes {
  size: string;
  color: string;
}

export interface VariantDimensions {
  h: number;
  l: number;
  w: number;
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

type GetProductResponse = {
  data: Product;
};

export const useProducts = () => {
  return useQuery<
    GetProductsResponse,
    Error,
    GetProductsResponse,
    readonly unknown[]
  >({
    queryKey: ["products"],
    queryFn: async () =>
      await apiClient.get("dropshipper/shopify/get-products"),
  });
};

export const useGetAllProducts = () => {
  return useQuery<
    GetProductsResponse,
    Error,
    GetProductsResponse,
    readonly unknown[]
  >({
    queryKey: ["getAllProducts"],
    queryFn: async () => await apiClient.get("dropshipper/products"),
  });
};

export const useGetProductById = (productId: string) => {
  console.log("Fetching product with ID:", productId);
  return useQuery<GetProductResponse>({
    queryKey: ["product", productId],
    queryFn: async () =>
      await apiClient.get(`dropshipper/products/${productId}`),
    enabled: !!productId,
  });
};
