import {
  ArrowUpRight,
  Banknote,
  Calculator,
  ChevronRight,
  Copy,
  HelpCircle,
  Info,
  Store,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { PushToShopifyResponse } from "@/hooks/usePushToShopify";

interface DrawerProduct {
  id: string;
  name: string;
  image: string;
  price: number;
}

interface CartDrawerProps {
  onClose: () => void;
  selectedProduct: DrawerProduct | null;
  response: PushToShopifyResponse | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

/* -------------------- Cart Item -------------------- */
const CartItem = ({
  name,
  productId,
  image,
}: {
  name: string;
  productId: string;
  image: string;
}) => (
  <div className="flex items-start gap-3 bg-gray-100 rounded-md p-3">
    <div className="h-16 shrink-0">
      <img
        src={image}
        alt="Product"
        className="w-full h-full object-contain rounded-md"
      />
    </div>

    <div className="flex flex-col gap-1 flex-1">
      <p className="text-sm font-medium text-slate-900 leading-tight">{name}</p>

      <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
        <span>C-Code:</span>
        <span className="font-bold text-slate-900">{productId}</span>
        <Copy strokeWidth={2.5} className="w-4 h-4 cursor-pointer" />
      </div>
    </div>
  </div>
);

/* -------------------- Section Title -------------------- */
const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center gap-2 font-semibold text-black/80 border-b px-6 py-4">
    <Icon className="w-6 h-6" />
    {title}
  </div>
);

/* -------------------- Main Component -------------------- */
const CartDrawer = ({
  onClose,
  selectedProduct,
  response,
  isLoading,
  error,
  onRetry,
}: CartDrawerProps) => {
  const product = response?.productData?.product;
  const firstVariant = product?.variants?.[0];
  const cloutPrice = Number(firstVariant?.price ?? selectedProduct?.price ?? 0);

  const [sellingPrice, setSellingPrice] = useState<number>(cloutPrice);

  useEffect(() => {
    setSellingPrice(cloutPrice);
  }, [cloutPrice]);

  const safeSellingPrice = Number.isFinite(sellingPrice) ? sellingPrice : 0;
  const shippingDiscount = 57;
  const shippingCharges = Math.round(cloutPrice * 0.45);
  const productPrice = Math.max(cloutPrice - shippingCharges, 0);
  const effectiveCloutPrice = Math.max(cloutPrice - shippingDiscount, 0);
  const margin = Math.max(safeSellingPrice - cloutPrice, 0);
  const effectiveEarnings = margin + shippingDiscount;

  const productTitle =
    product?.title ||
    selectedProduct?.name ||
    "Tangerine Vita C Dark Spot Care Cream 100gm Each (Pack of 2)";
  const productCode = selectedProduct?.id || firstVariant?.sku || "C2463343";
  const productImage =
    selectedProduct?.image ||
    product?.images?.[0]?.src ||
    "/images/vita-c.webp";

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="w-120 bg-white shadow-xl animate-slideIn flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-2xl font-bold">Push To Shopify</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Cart Item */}
          <CartItem
            name={productTitle}
            productId={productCode}
            image={productImage}
          />

          {/* Store Section */}
          <div className="flex justify-between items-center">
            <SectionTitle icon={Store} title="Store" />
            <div className="flex justify-between gap-2">
              <span className="text-sm text-slate-900">
                {response?.shop || "test2-12412412125457568973.myshopify.com"}
              </span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="flex justify-between items-center gap-4">
            <SectionTitle icon={Banknote} title="Pricing" />
            {/* START: Expected Price Calculator UI (purple card shown on right side) */}
            <button
              type="button"
              className="min-w-62 bg-[#e9e3f8] hover:bg-[#e3daf8] transition-colors rounded-md px-3 py-1 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg text-[#7c3aed] flex items-center justify-center">
                  <Calculator className="w-6 h-6" />
                </div>
                <span className="text-[#5b2fd1] font-semibold underline text-xs">
                  Calculate Expected Profit
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
            {/* END: Expected Price Calculator UI */}
          </div>

          <div className="px-6 space-y-4 text-sm">
            {/* Selling Price Label + input */}
            <div className="flex items-center justify-between gap-3 font-semibold border-b border-dashed pb-3">
              <div className="flex items-center gap-2">
                Set Your Selling Price (₹)
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="h-11 min-w-26 border border-black/60 rounded-sm px-3 flex items-center gap-2 bg-white">
                <span className="font-semibold">₹</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={Number.isNaN(sellingPrice) ? "" : sellingPrice}
                  onChange={(e) => {
                    const nextValue = Number(e.target.value);
                    setSellingPrice(Number.isNaN(nextValue) ? 0 : nextValue);
                  }}
                  className="w-14 bg-transparent outline-none text-right font-medium"
                />
              </div>
            </div>

            {/* Clout Pricing */}
            <div className="flex justify-between">
              <span> Price</span>
              <span className="font-semibold">₹{cloutPrice}</span>
            </div>

            {/* START: Hover trigger text for GST/Shipping/Discount tooltip */}
            <div className="relative inline-flex group">
              <p className="text-xs text-gray-600 underline flex items-center gap-1 cursor-default">
                Including GST, Shipping Charges & Discount
                <Info className="w-3 h-3" />
              </p>

              {/* START: Hover tooltip popup content (dark card) */}
              <div className="absolute left-0 top-full mt-3 z-20 hidden group-hover:block group-focus-within:block">
                <div className="relative bg-[#474747] text-white rounded-md shadow-xl min-w-85 p-4">
                  <div className="absolute -top-2 left-10 w-4 h-4 bg-[#474747] rotate-45" />

                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Price</span>
                    <span>₹{cloutPrice}</span>
                  </div>

                  <div className="mt-3 space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="font-semibold">• Product Price</p>
                        <p className="text-gray-300 text-xs">
                          (Includes 18% Product GST)
                        </p>
                      </div>
                      <span className="font-semibold">₹{productPrice}</span>
                    </div>

                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="font-semibold">• Shipping Charges</p>
                        <p className="text-gray-300 text-xs">
                          (Includes 18% Shipping GST)
                        </p>
                      </div>
                      <span className="font-semibold">₹{shippingCharges}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* END: Hover tooltip popup content */}
            </div>
            {/* END: Hover trigger text for GST/Shipping/Discount tooltip */}

            <div className="text-xs space-y-1">
              <p className="font-semibold">
                Effective Price: ₹{effectiveCloutPrice}
              </p>
              <p className="text-gray-600">
                Difference amount will be given as
              </p>
              <p className="font-semibold text-gray-500">
                Shipping Discount: ₹{shippingDiscount}
              </p>
            </div>

            {/* Margin Box */}
            <div className="bg-[#ebf8e5] rounded-sm text-xs">
              <div className="flex justify-between px-3 pt-3 font-bold text-[#3fb700]">
                <span>Your Margin</span>
                <span>₹{margin}</span>
              </div>

              <div className="flex justify-between px-3 py-2">
                <div className="flex gap-1">
                  <span className="font-semibold text-black/80">
                    + Shipping Discount
                  </span>
                  <span>(1-59 orders)</span>
                </div>
                <span className="font-semibold">₹{shippingDiscount}</span>
              </div>

              <div className="flex justify-between bg-[#3fb700] text-white font-semibold px-3 py-2 rounded-sm text-sm">
                <span>Your Effective Earnings</span>
                <span>₹{effectiveEarnings}</span>
              </div>
            </div>

            {/* RTO Info */}
            <div className="text-xs bg-gray-100 rounded-sm p-4 text-center">
              RTO and RVP charges are applicable and vary depending on the
              product weight.{" "}
              <span className="underline font-medium">
                view charges for this product
              </span>
            </div>
          </div>

          {/* Button */}
          <Button
            className="flex items-center justify-center w-full bg-black font-medium"
            disabled={isLoading || !!error}
            onClick={error ? onRetry : undefined}
          >
            <ArrowUpRight />
            {error ? "Retry Push To Shopify" : "Push To Shopify"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
