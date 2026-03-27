import {
  ArrowUpRight,
  Banknote,
  Copy,
  HelpCircle,
  Info,
  Store,
  X,
} from "lucide-react";
import React from "react";
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

const maskedToken = (token?: string) => {
  if (!token) return "-";
  if (token.length <= 12) return token;
  return `${token.slice(0, 8)}...${token.slice(-4)}`;
};

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
      <img src={image} alt="Product" className="w-full h-full object-contain rounded-md" />
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
  const selectedVariantPrice = Number(firstVariant?.price ?? selectedProduct?.price ?? 0);
  const shippingDiscount = 57;
  const effectiveCloutPrice = Math.max(selectedVariantPrice - shippingDiscount, 0);
  const margin = 0;
  const effectiveEarnings = margin + shippingDiscount;

  const productTitle =
    product?.title || selectedProduct?.name || "Tangerine Vita C Dark Spot Care Cream 100gm Each (Pack of 2)";
  const productCode = selectedProduct?.id || firstVariant?.sku || "C2463343";
  const productImage =
    selectedProduct?.image || product?.images?.[0]?.src || "/images/vita-c.webp";

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
          <CartItem name={productTitle} productId={productCode} image={productImage} />

          {/* Store Section */}
          <SectionTitle icon={Store} title="Store" />
          <div className="px-6 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">Shop</span>
              <span className="font-semibold text-slate-900">
                {response?.shop || "test2-12412412125457568973.myshopify.com"}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">Access Token</span>
              <span className="font-semibold text-slate-900">
                {maskedToken(response?.access_token)}
              </span>
            </div>
          </div>

          {/* Pricing Section */}
          <SectionTitle icon={Banknote} title="Pricing" />

          <div className="px-6 space-y-4 text-sm">
            {/* Selling Price Label */}
            <div className="flex items-center gap-2 font-semibold border-b border-dashed pb-3">
              Set Your Selling Price (₹)
              <HelpCircle className="w-4 h-4" />
            </div>

            {/* Clout Pricing */}
            <div className="flex justify-between">
              <span>Clout Pricing</span>
              <span className="font-semibold">₹ {selectedVariantPrice}</span>
            </div>

            <p className="text-xs text-gray-600 underline flex items-center gap-1">
              Including GST, Shipping Charges & Discount
              <Info className="w-3 h-3" />
            </p>

            <div className="text-xs space-y-1">
              <p className="font-semibold">Effective Clout Price: ₹{effectiveCloutPrice}</p>
              <p className="text-gray-600">Difference amount will be given as</p>
              <p className="font-semibold text-gray-500">Shipping Discount: ₹{shippingDiscount}</p>
            </div>

            {/* Margin Box */}
            <div className="bg-[#ebf8e5] rounded-sm text-xs">
              <div className="flex justify-between px-3 pt-3 font-bold text-[#3fb700]">
                <span>Your Margin</span>
                <span>₹{margin}</span>
              </div>

              <div className="flex justify-between px-3 py-2">
                <div className="flex gap-1">
                  <span className="font-semibold text-black/80">+ Shipping Discount</span>
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
              RTO and RVP charges are applicable and vary depending on the product weight.{" "}
              <span className="underline font-medium">view charges for this product</span>
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
