"use client";

import { type ReactNode, use, useState } from "react";
import {
  ArrowUpRight,
  Boxes,
  CopyIcon,
  Info,
  Layers,
  Package,
  RotateCcw,
  Ruler,
  ShieldCheck,
  Tag,
  Truck,
  Weight,
} from "lucide-react";
import DownloadMediaDropdown from "@/components/partner/download-media-dropdown";
import CartDrawer from "@/components/partner/cart-drawer";
import { useGetProductById } from "@/hooks/marketplace/useProduct";
import { UnicsiLoader } from "@/components/partner/unicsi-loader";

type ProductDetailPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

type DrawerProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
  weightGrams?: number;
};

function Badge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const colors = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors[variant]}`}
    >
      {label}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <span className="w-36 shrink-0 text-xs text-slate-500">{label}</span>
      <span className="break-all text-xs font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
}

function ProductInfo({
  product,
  onPushToShopify,
}: {
  product: any;
  onPushToShopify: () => void;
}) {
  const variant = product.variants?.find((item: any) => item.is_active);
  const skuValue =
    variant?.sku ?? product.variants?.[0]?.sku ?? "SKU not available";
  const price = Number(variant?.price ?? product.mrp ?? 0);
  const mrp = Number(product.mrp ?? 0);
  const bulkPrice = Number(product.bulk_price ?? 0);
  const gstRate = product.gst_rate
    ? `${(Number(product.gst_rate) * 100).toFixed(0)}%`
    : "-";
  const moq = product.minimum_order_quantity ?? "-";
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-xl border bg-white p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Tag className="h-3.5 w-3.5" />
          SKU:
          <button
            className="group flex items-center gap-1.5 font-semibold text-slate-800 transition-colors hover:text-black"
            onClick={() => navigator.clipboard.writeText(skuValue)}
          >
            <span className="font-mono">{skuValue}</span>
            <CopyIcon className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-lg font-semibold text-slate-900">
            {product.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {product.brand && (
              <Badge label={`Brand: ${product.brand}`} variant="default" />
            )}
            {product.category?.name && (
              <Badge label={product.category.name} variant="default" />
            )}
            <Badge
              label={product.approval_status}
              variant={
                product.approval_status === "approved" ? "success" : "warning"
              }
            />
          </div>
        </div>

        <div className="space-y-2 rounded-lg bg-slate-50 p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              Rs.{price.toLocaleString()}
            </span>
            {mrp > price && (
              <span className="text-sm text-slate-400 line-through">
                Rs.{mrp.toLocaleString()} MRP
              </span>
            )}
            {discount && (
              <span className="ml-auto rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                {discount}% off
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-md border border-slate-200 bg-white p-2.5 text-center">
              <p className="mb-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                Bulk Price
              </p>
              <p className="text-sm font-bold text-slate-800">
                Rs.{bulkPrice.toLocaleString()}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-2.5 text-center">
              <p className="mb-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                GST Rate
              </p>
              <p className="text-sm font-bold text-slate-800">{gstRate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
            <Boxes className="h-3.5 w-3.5" />
            Minimum Order Quantity:
            <span className="font-semibold text-slate-700">{moq} units</span>
          </div>
        </div>

        <div className="flex gap-3">
          <div
            className={`flex flex-1 items-center gap-2 rounded-lg border p-2.5 text-xs ${
              product.rvp_enabled
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-400"
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            RVP {product.rvp_enabled ? "Enabled" : "Disabled"}
          </div>
          <div
            className={`flex flex-1 items-center gap-2 rounded-lg border p-2.5 text-xs ${
              product.rto_enabled
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-400"
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            RTO {product.rto_enabled ? "Enabled" : "Disabled"}
          </div>
        </div>

        <button
          onClick={onPushToShopify}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-3 text-white transition-colors hover:bg-slate-800"
        >
          <ArrowUpRight className="h-5 w-5" />
          Push To Shopify
        </button>
      </div>

      {variant && (
        <div className="space-y-1 rounded-xl border bg-white p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Layers className="h-4 w-4" />
            Active Variant - {variant.title}
          </h3>
          <InfoRow icon={Tag} label="SKU" value={variant.sku} />
          <InfoRow
            icon={Boxes}
            label="Inventory"
            value={
              <span
                className={
                  variant.inventory_quantity > 0
                    ? "text-emerald-700"
                    : "text-red-600"
                }
              >
                {variant.inventory_quantity} units
              </span>
            }
          />
          <InfoRow
            icon={Weight}
            label="Weight"
            value={`${variant.weight_grams}g`}
          />
          {variant.option1 && (
            <InfoRow icon={Package} label="Color" value={variant.option1} />
          )}
          {variant.option2 && (
            <InfoRow icon={Package} label="Size" value={variant.option2} />
          )}
          {variant.option3 && (
            <InfoRow icon={Package} label="Material" value={variant.option3} />
          )}
          {variant.dimension_cm && (
            <InfoRow
              icon={Ruler}
              label="Dimensions"
              value={`${variant.dimension_cm.length} x ${variant.dimension_cm.width} x ${variant.dimension_cm.height} cm`}
            />
          )}
          <InfoRow
            icon={Info}
            label="Compare Price"
            value={
              variant.compare_at_price ? `Rs.${variant.compare_at_price}` : "-"
            }
          />
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = use(params);
  const { data, isLoading, isError } = useGetProductById(productId);
  const [selectedImage, setSelectedImage] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  if (isLoading) {
    return <UnicsiLoader />;
  }

  if (isError || !data?.data) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">Product not found</h1>
      </div>
    );
  }

  const product = data.data;
  const mediaUrls = product.images?.map((img: any) => img.image_url) || [
    "/placeholder.png",
  ];
  const activeImage = selectedImage || mediaUrls[0];
  const activeVariant =
    product.variants?.find((variant: any) => variant?.is_active) ??
    product.variants?.[0];
  const selectedProduct: DrawerProduct = {
    id: product.product_id,
    name: product.title,
    image: mediaUrls[0] ?? "/placeholder.png",
    price: Number(activeVariant?.price ?? product.mrp ?? 0),
    weightGrams: Number(activeVariant?.weight_grams ?? 0),
  };

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex gap-4">
            <div className="flex flex-col gap-3">
              {mediaUrls.slice(0, 5).map((img: string, i: number) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-20 w-20 cursor-pointer overflow-hidden rounded border transition-all ${
                    activeImage === img
                      ? "border-2 border-black"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="relative h-[420px] flex-1 overflow-hidden rounded bg-slate-100">
              <DownloadMediaDropdown
                currentMediaUrl={activeImage}
                allMediaUrls={mediaUrls}
              />
              <img
                src={activeImage}
                alt="Selected product"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <ProductInfo
            product={product}
            onPushToShopify={() => setIsCartOpen(true)}
          />
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Info className="h-4 w-4 text-slate-400" />
            Product Description
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            {product.description || "No description available."}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            Product Details
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              { label: "Brand", value: product.brand },
              { label: "Category", value: product.category?.name },
              {
                label: "Bulk Price Refresh",
                value: `Every ${product.bulk_price_refresh_days} days`,
              },
            ].map((item, index) => (
              <div key={index} className="rounded-lg bg-slate-50 p-3">
                <p className="mb-1 text-[10px] uppercase tracking-wide text-slate-400">
                  {item.label}
                </p>
                <p className="break-all text-xs font-medium text-slate-800">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isCartOpen && (
        <CartDrawer
          onClose={() => setIsCartOpen(false)}
          selectedProduct={selectedProduct}
          response={null}
          isLoading={false}
          error={null}
          onRetry={() => {}}
        />
      )}
    </>
  );
}
