"use client";

import { type MouseEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
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
  images,
  inStock = true,
  onPushToShopify,
  stock,
  sku,
}: ProductCardProps) {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const stockCount = stock ?? 0;
  const isOutOfStock = stockCount <= 0 || !inStock;
  const fallbackImage =
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop";

  const imageList = useMemo(() => {
    const merged = [...(images ?? []), image];
    const cleaned = merged
      .map((url) => (url ?? "").trim())
      .filter((url) => url.length > 0);
    return cleaned.length > 0 ? cleaned : [fallbackImage];
  }, [image, images]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id, imageList.length]);

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

  const handlePreviousImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (imageList.length <= 1) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? imageList.length - 1 : prev - 1,
    );
  };

  const handleNextImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (imageList.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % imageList.length);
  };

  return (
    <div className="group flex h-full transform-gpu flex-col rounded-lg bg-white p-2 shadow-sm transition-all duration-300 ease-out hover:-translate-y-5 hover:scale-105 hover:shadow-xl focus-within:-translate-y-5 focus-within:shadow-xl sm:p-2.5">
      <div className="flex-1">
        <div
          onClick={handleRedirect}
          className="relative mb-2 h-40 w-full cursor-pointer overflow-hidden rounded-md bg-slate-100 sm:mb-3 sm:h-44 lg:h-40"
        >
          {imageList[activeImageIndex] ? (
            <img
              src={imageList[activeImageIndex]}
              alt={name}
              className="h-full w-full object-fill transition-transform duration-300 ease-out group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackImage;
                (e.target as HTMLImageElement).onerror = null;
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              No image
            </div>
          )}

          {imageList.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePreviousImage}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Next image"
                className="absolute right-2 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
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

      <div className="h-[88px] pt-2 sm:h-[52px]">
        <div className="flex h-full flex-col gap-2 opacity-0 translate-y-2 pointer-events-none transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto sm:flex-row sm:gap-1">
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
    </div>
  );
}
