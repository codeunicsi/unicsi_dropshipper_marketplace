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
  onPushToShopify?: () => void;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  rating = 4.5,
  reviews = 26,
  inStock = true,
  onPushToShopify,
}: ProductCardProps) {
  const router = useRouter();

  // ✅ Main redirect
  const handleRedirect = () => {
    if (!id) return;
    router.push(`/marketplace/product/${id}`);
  };

  // ✅ Prevent redirect when clicking buttons
  const stopPropagation = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const handlePushToShopify = (e: MouseEvent<HTMLButtonElement>) => {
    stopPropagation(e);
    onPushToShopify?.();
  };

  const handleBulkOrder = (e: MouseEvent<HTMLButtonElement>) => {
    stopPropagation(e);
  };

  return (
    <div
      onClick={handleRedirect}
      className="flex flex-col h-full bg-white rounded-lg shadow-sm p-2 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex-1">
        {/* Image */}
        <div className="relative w-full h-36 mb-3 bg-slate-100 rounded-md overflow-hidden">
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
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No image</div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
              {name}
            </h3>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-slate-600">{rating}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900">
              ₹{price.toLocaleString()}
            </span>

            {inStock && (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                In Stock
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 py-2 border-t border-b border-slate-100">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>2.5k sold</span>
            </div>

            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>XL</span>
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
          className="flex-1 bg-white text-xs text-amber-900 border border-amber-900 hover:bg-amber-900/10 font-semibold py-2 rounded-lg"
        >
          Bulk Order
        </Button>
      </div>
    </div>
  );
}
