"use client";

import { ShoppingCart, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ProductCardProps {
  id?: string;
  name: string;
  price: number;
  image: string;

  stock?: number;
  color?: string;
  size?: string;

  rating?: number;
  reviews?: number;

  onPushToShopify?: () => void;
}

export default function ProductCard({
  name,
  price = 0,
  image = "",
  stock = 0,
  color = "",
  size = "",
  rating = 4.5,
  reviews = 26,
  onPushToShopify,
}: ProductCardProps) {
  const inStock = stock > 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm p-2 hover:shadow-md transition-shadow duration-200">
      <div className="flex-1">
        {/* ✅ Image */}
        <div className="relative w-full h-36 mb-3 bg-slate-100 rounded-md overflow-hidden">
          <Image
            src={image || "/placeholder.png"}
            alt={name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          {/* Name + Rating */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
              {name}
            </h3>

            <div className="flex items-center gap-1 shrink-0">
              <svg
                width="12"
                height="13"
                viewBox="0 0 12 13"
                fill="none"
                className="text-amber-400"
              >
                <path
                  d="M6 0.921875L7.8 6.12188H13.2L9 9.3L11.1 14.5L6 11.3L0.9 14.5L3 9.3L-1.2 6.12188H4.2L6 0.921875Z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-xs text-slate-600">{rating}</span>
            </div>
          </div>

          {/* Price + Stock */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900">
              ₹{price.toLocaleString()}
            </span>

            {inStock ? (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                In Stock
              </span>
            ) : (
              <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                Out of Stock
              </span>
            )}
          </div>

          {/* Variant Info */}
          <div className="flex items-center justify-between text-xs text-slate-600 py-2 border-t border-b border-slate-100">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{stock} available</span>
            </div>

            <div className="flex items-center gap-2">
              {color && (
                <span className="px-2 py-0.5 bg-slate-100 rounded">
                  {color}
                </span>
              )}
              {size && (
                <span className="px-2 py-0.5 bg-slate-100 rounded">{size}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-1 py-2">
        <Button
          onClick={onPushToShopify}
          disabled={!inStock}
          className="flex-1 text-white text-xs bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 font-semibold py-2 rounded-lg"
        >
          Push to Shopify
        </Button>

        <Button
          disabled={!inStock}
          className="flex-1 bg-white text-xs text-amber-900 border border-amber-900 hover:bg-amber-900/10 disabled:opacity-50 font-semibold py-2 rounded-lg"
        >
          Bulk Order
        </Button>
      </div>
    </div>
  );
}
