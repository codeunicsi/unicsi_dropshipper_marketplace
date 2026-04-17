"use client";

import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  size?: string;
  stock?: number;
  sku?: string;
  onPushToShopify?: () => void;
  onBulkOrder?: () => void;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  inStock = true,
  onPushToShopify,
  stock,
  sku,
}: ProductCardProps) {
  const router = useRouter();
  const stockCount = stock ?? 0;
  const isOutOfStock = stockCount <= 0 || !inStock;

  const handleRedirect = () => {
    if (!id) return;
    router.push(`/marketplace/product/${id}`);
  };

  const handlePushToShopify = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onPushToShopify?.();
  };

  const handleBulkOrder = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/marketplace/bulk-order/${id}`);
  };

  return (
    <div className="flex h-full flex-col rounded-lg bg-white p-2 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-2.5">
      <div className="flex-1">
        <div
          onClick={handleRedirect}
          className="relative mb-2 h-40 w-full cursor-pointer overflow-hidden rounded-md bg-slate-100 sm:mb-3 sm:h-44 lg:h-40"
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-fill transition-transform duration-200 hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop";
                (e.target as HTMLImageElement).onerror = null;
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              No image
            </div>
          )}
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 border-y border-slate-100 py-2 sm:py-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-wide text-slate-500 uppercase sm:text-[11px]">
                Name
              </p>
              <h3 className="mt-1 line-clamp-2 text-[13px] leading-4 font-semibold text-slate-900 sm:text-sm sm:leading-5">
                {name}
              </h3>
            </div>

            <div className="min-w-0 text-right">
              <p className="text-[10px] font-medium tracking-wide text-slate-500 uppercase sm:text-[11px]">
                Price
              </p>
              <span className="mt-1 block text-base leading-none font-bold text-slate-900 sm:text-lg">
                Rs {price.toLocaleString()}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-wide text-slate-500 uppercase sm:text-[11px]">
                SKU
              </p>
              <p className="mt-1 truncate text-[11px] text-slate-700 sm:text-xs">
                {sku || "-"}
              </p>
            </div>

            <div className="min-w-0 text-right">
              <p className="text-[10px] font-medium tracking-wide text-slate-500 uppercase sm:text-[11px]">
                Stock
              </p>
              <span
                className={`mt-1 block text-[11px] font-semibold sm:text-xs ${
                  isOutOfStock ? "text-red-500" : "text-green-600"
                }`}
              >
                {isOutOfStock ? "Out of stock" : stockCount}
              </span>
            </div>
          </div>

        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-1 sm:py-2">
        <Button
          onClick={handlePushToShopify}
          className="min-h-0 flex-1 rounded-lg bg-amber-500 px-2 py-2 text-[11px] leading-none font-semibold text-white hover:bg-amber-600 sm:rounded-lg sm:py-2 sm:text-xs"
        >
          Push to Shopify
        </Button>

        <Button
          onClick={handleBulkOrder}
          className="min-h-0 flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-amber-900 bg-white px-2 py-2 text-[11px] leading-none font-semibold text-amber-900 hover:bg-amber-900/10 sm:rounded-lg sm:py-2 sm:text-xs"
        >
          Bulk Order
        </Button>
      </div>
    </div> 
  );
}
