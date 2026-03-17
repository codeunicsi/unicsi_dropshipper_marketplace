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
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface ProductVariant {
  variant_id: string;
  product_id: string;
  sku: string;
  variant_name: string;
  variant_price: string; // change to number if backend returns number
  variant_stock: number;
  attributes: VariantAttributes;
  weight_grams: number;
  dimensions_cm: VariantDimensions;
  hsn_code: string;
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
  image_url: string;
  sort_order: number;
  createdAt: string;
  updatedAt: string;
}

export const useProducts = () => {
  return useQuery<
    GetProductsResponse,
    Error,
    GetProductsResponse,
    readonly unknown[]
  >({
    queryKey: ["products"],
    queryFn: async () =>
      await apiClient.get<GetProductsResponse>(
        "dropshipper/shopify/get-products",
      ),
  });
};
