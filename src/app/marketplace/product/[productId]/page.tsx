"use client";

import { use, useEffect, useState } from "react";
import {
  ArrowUpRight,
  CopyIcon,
  Loader2,
  Tag,
  Package,
  Layers,
  ShieldCheck,
  Truck,
  RotateCcw,
  Info,
  Hash,
  Boxes,
  Ruler,
  Weight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AdditionalInfoDropdown from "@/components/partner/additional-info-dropdown";
import ProductDetailBanner from "@/components/partner/product-detail-banner";
import DownloadMediaDropdown from "@/components/partner/download-media-dropdown";
import { useGetProductById } from "@/hooks/marketplace/useProduct";
import { UnicsiLoader } from "@/components/partner/unicsi-loader";
import { usePushToShopify } from "@/hooks/usePushToShopify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ProductDetailPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

/* ─── helpers ──────────────────────────────────────────────── */
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}
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
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0 border-slate-100">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <span className="text-xs text-slate-500 w-36 shrink-0">{label}</span>
      <span className="text-xs font-medium text-slate-800 break-all">
        {value}
      </span>
    </div>
  );
}

/* ─── ProductInfo card ──────────────────────────────────────── */
export function ProductInfo({ product }: { product: any }) {
  const router = useRouter();
  const { pushProductToShopify } = usePushToShopify();
  const [showSuccess, setShowSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mrpInput, setMrpInput] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);

  const variant = product.variants?.find((v: any) => v.is_active);
  const price = Number(variant?.price ?? product.mrp ?? 0);
  const mrp = Number(product.mrp ?? 0);
  const bulkPrice = Number(product.bulk_price ?? 0);
  const gstRate = product.gst_rate
    ? `${(Number(product.gst_rate) * 100).toFixed(0)}%`
    : "—";
  const moq = product.minimum_order_quantity ?? "—";

  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

  useEffect(() => {
    setMrpInput(String(Math.max(price, 1)));
  }, [price]);

  const confirmPushToShopify = () => {
    const n = Number(mrpInput);
    if (!product.product_id || !Number.isFinite(n) || n <= 0) {
      setDialogError("Enter a valid selling price (MRP).");
      return;
    }
    setDialogError(null);
    pushProductToShopify.mutate(
      { productId: product.product_id, newMRP: n },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setShowSuccess(true);
          setTimeout(() => {
            router.push("/marketplace");
          }, 1200);
        },
        onError: (e: Error) => {
          setDialogError(e?.message || "Request failed");
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Main price card */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        {/* C-Code */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Hash className="w-3.5 h-3.5" />
          C-Code:
          <button
            className="flex items-center gap-1.5 font-semibold text-slate-800 hover:text-black transition-colors group"
            onClick={() => navigator.clipboard.writeText(product.product_id)}
          >
            <span className="font-mono">{product.product_id}</span>
            <CopyIcon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
          </button>
        </div>

        {/* Title + brand + category */}
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

        {/* Pricing */}
        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ₹{price.toLocaleString()}
            </span>
            {mrp > price && (
              <span className="text-sm text-slate-400 line-through">
                ₹{mrp.toLocaleString()} MRP
              </span>
            )}
            {discount && (
              <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {discount}% off
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-white rounded-md p-2.5 border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">
                Bulk Price
              </p>
              <p className="text-sm font-bold text-slate-800">
                ₹{bulkPrice.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-md p-2.5 border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">
                GST Rate
              </p>
              <p className="text-sm font-bold text-slate-800">{gstRate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
            <Boxes className="w-3.5 h-3.5" />
            Minimum Order Quantity:{" "}
            <span className="font-semibold text-slate-700">{moq} units</span>
          </div>
        </div>

        {/* Shipping flags */}
        <div className="flex gap-3">
          <div
            className={`flex-1 flex items-center gap-2 text-xs rounded-lg p-2.5 border ${product.rvp_enabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RVP {product.rvp_enabled ? "Enabled" : "Disabled"}
          </div>
          <div
            className={`flex-1 flex items-center gap-2 text-xs rounded-lg p-2.5 border ${product.rto_enabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
          >
            <Truck className="w-3.5 h-3.5" />
            RTO {product.rto_enabled ? "Enabled" : "Disabled"}
          </div>
        </div>

        {/* Push To Shopify — opens MRP dialog (backend: mrp-update) */}
        <button
          type="button"
          onClick={() => {
            setDialogError(null);
            setDialogOpen(true);
          }}
          disabled={pushProductToShopify.isPending}
          className="w-full bg-black text-white py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pushProductToShopify.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Pushing…
            </>
          ) : (
            <>
              <ArrowUpRight className="w-5 h-5" />
              Push To Shopify
            </>
          )}
        </button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Selling price on Shopify</DialogTitle>
              <DialogDescription>
                Enter the price (MRP) customers will pay on your Shopify store.
                This calls the server to create or update the product and save
                the mapping.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <label className="text-sm font-medium">MRP (₹)</label>
              <input
                type="number"
                min={1}
                step={1}
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={mrpInput}
                onChange={(e) => setMrpInput(e.target.value)}
              />
              {dialogError && (
                <p className="text-sm text-red-600">{dialogError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmPushToShopify}
                disabled={pushProductToShopify.isPending}
              >
                {pushProductToShopify.isPending ? "Saving…" : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Variant details */}
      {variant && (
        <div className="bg-white rounded-xl border p-5 space-y-1">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Active Variant — {variant.title}
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
              value={`${variant.dimension_cm.length} × ${variant.dimension_cm.width} × ${variant.dimension_cm.height} cm`}
            />
          )}
          <InfoRow
            icon={Info}
            label="Compare Price"
            value={
              variant.compare_at_price ? `₹${variant.compare_at_price}` : "—"
            }
          />
        </div>
      )}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-4 animate-fadeIn">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Text */}
            <h2 className="text-lg font-semibold text-slate-900">
              Product Added Successfully 🎉
            </h2>

            <p className="text-sm text-slate-500 text-center">
              Your product has been pushed to Shopify.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = use(params);
  const { data, isLoading, isError } = useGetProductById(productId);
  const [selectedImage, setSelectedImage] = useState<string>("");

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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-10">
        {/* LEFT — images */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {mediaUrls.slice(0, 5).map((img: string, i: number) => (
              <div
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`relative h-20 w-20 border rounded cursor-pointer overflow-hidden transition-all ${activeImage === img
                    ? "border-black border-2"
                    : "border-gray-200 hover:border-gray-400"
                  }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main image */}
          <div className="relative flex-1 h-[420px] bg-slate-100 rounded overflow-hidden">
            <DownloadMediaDropdown
              currentMediaUrl={activeImage}
              allMediaUrls={mediaUrls}
            />
            <img
              src={activeImage}
              alt="Selected product"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* RIGHT — all info */}
        <ProductInfo product={product} />
      </div>

      {/* Description */}
      <div className="border rounded-xl p-6 bg-white">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400" />
          Product Description
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {product.description || "No description available."}
        </p>
      </div>

      {/* Product meta grid */}
      <div className="border rounded-xl p-6 bg-white">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          Product Details
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            // { label: "Product ID", value: product.product_id, mono: true },
            { label: "Brand", value: product.brand },
            { label: "Category", value: product.category?.name },
            // {
            //   label: "Lifecycle Status",
            //   value: (
            //     <Badge
            //       label={product.lifecycle_status}
            //       variant={
            //         product.lifecycle_status === "active"
            //           ? "success"
            //           : "warning"
            //       }
            //     />
            //   ),
            // },
            // {
            //   label: "Approval Status",
            //   value: (
            //     <Badge
            //       label={product.approval_status}
            //       variant={
            //         product.approval_status === "approved"
            //           ? "success"
            //           : "warning"
            //       }
            //     />
            //   ),
            // },
            // {
            //   label: "Approved At",
            //   value: product.approved_at
            //     ? new Date(product.approved_at).toLocaleDateString("en-IN", {
            //         day: "numeric",
            //         month: "short",
            //         year: "numeric",
            //       })
            //     : "—",
            // },
            {
              label: "Bulk Price Refresh",
              value: `Every ${product.bulk_price_refresh_days} days`,
            },
            // {
            //   label: "Created At",
            //   value: new Date(product.createdAt).toLocaleDateString("en-IN", {
            //     day: "numeric",
            //     month: "short",
            //     year: "numeric",
            //   }),
            // },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
                {item.label}
              </p>
              <p
                className={`text-xs font-medium text-slate-800 break-all ${(item as any).mono ? "font-mono" : ""
                  }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* <AdditionalInfoDropdown /> */}
      {/* <ProductDetailBanner /> */}
    </div>
  );
}
