"use client";

import type { MouseEvent } from "react";
import { Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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
  size,
  inStock = true,
  onPushToShopify,
  stock,
  sku,
}: ProductCardProps) {
  const router = useRouter();

  // ✅ Image click → product detail
  const handleRedirect = () => {
    if (!id) return;
    router.push(`/marketplace/product/${id}`);
  };

  const handlePushToShopify = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onPushToShopify?.();
  };

  // ✅ Bulk Order → /marketplace/bulk-order
  const handleBulkOrder = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/marketplace/bulk-order/${id}`);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm p-2 hover:shadow-md transition-shadow duration-200">
      <div className="flex-1">
        {/* Image — clicking navigates to product detail */}
        <div
          onClick={handleRedirect}
          className="relative w-full h-36 mb-3 bg-slate-100 rounded-md overflow-hidden cursor-pointer"
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop";
                (e.target as HTMLImageElement).onerror = null;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              No image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
              {name}
            </h3>

            {/* <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-slate-600">{rating}</span>
            </div> */}
          </div>

          <div className="flex items-center justify-between">
            {/* <span className="text-lg font-bold text-slate-900">
              ₹{price.toLocaleString()}
            </span> */}

            <span
              className={`text-xs px-2 py-1 rounded ${
                inStock
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 py-2 border-t border-b border-slate-100">
            {/* <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>2.5k sold</span>
            </div> */}

            <div className="flex items-center gap-20 text-xs text-slate-600 py-2 border-t border-b border-slate-100">
              {/* Size */}
              <div className="flex items-center gap-1 flex-row  whitespace-nowrap">
                <span className="font-medium text-slate-700"></span>
                <span>{sku || "-"}</span>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-700">Stock:</span>
                <span
                  className={`font-semibold ${
                    stock && stock > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {stock ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-1 py-2">
        <Button
          onClick={handlePushToShopify}
          className="flex-1 text-white text-xs bg-amber-500 hover:bg-amber-600 font-semibold py-2 rounded-lg"
        >
          Push to Shopify
        </Button>

        <Button
          onClick={handleBulkOrder}
          className="flex-1 bg-white text-xs text-amber-900 border border-amber-900 hover:bg-amber-900/10 font-semibold py-2 rounded-lg flex items-center justify-center cursor-pointer"
        >
          Bulk Order
        </Button>
      </div>
    </div>
  );
}
