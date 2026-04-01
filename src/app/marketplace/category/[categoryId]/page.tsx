"use client";

import { use } from "react";
import { CopyIcon, Loader2, Package, LayoutGrid, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CategoryTabs from "@/components/CategoryTabs/CategoryTabs";

// import { useGetCategoryById } from "@/hooks/marketplace/useGetCategoryById";
import {
  useGetProductsByCategory,
  type Product,
} from "@/hooks/marketplace/useGetCategoryById";
import { UnicsiLoader } from "@/components/partner/unicsi-loader";

type CategoryDetailPageProps = {
  params: Promise<{ categoryId: string }>;
};

// ─── Category Header ───────────────────────────────────────────────────────────

function CategoryHeader({
  name,
  id,
  slug,
  isActive,
  isFeatured,
  imageUrl,
  productCount,
}: {
  name: string;
  id: string;
  slug: string;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string | null;
  productCount: number;
}) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="grid md:grid-cols-[280px_1fr]">
        {/* Category image */}
        <div className="relative h-48 md:h-full bg-slate-100 min-h-[180px]">
          {imageUrl ? (
            <Image src={imageUrl} alt={name} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <LayoutGrid className="w-12 h-12 text-slate-300" />
            </div>
          )}
        </div>

        {/* Category info */}
        <div className="p-6 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                isActive
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
            {isFeatured && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-50 text-amber-700">
                Featured
              </span>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold text-slate-900">{name}</h1>

          {/* ID row */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {/* <span>ID:</span>
            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {id}
            </span> */}
            <button
              onClick={() => navigator.clipboard.writeText(id)}
              className="hover:text-slate-700 transition-colors"
              aria-label="Copy ID"
            >
              <CopyIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Slug */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Tag className="w-3.5 h-3.5" />
            <code className="text-slate-700">{slug}</code>
          </div>

          {/* Product count */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                {productCount}
              </span>{" "}
              {productCount === 1 ? "product" : "products"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const activeVariant = product.variants.find((v) => v.is_active);
  const image =
    product.images[0]?.image_url?.replace("https://", "https://") ??
    "/placeholder.png";
  const price = activeVariant ? Number(activeVariant.price) : null;
  const compareAt = activeVariant?.compare_at_price
    ? Number(activeVariant.compare_at_price)
    : null;
  const hasDiscount = compareAt !== null && price !== null && compareAt > price;

  return (
    <Link
      href={`/marketplace/product/${product.product_id}`}
      className="group bg-white border rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-44 bg-slate-100">
        <Image
          src={image}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <span
          className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
            product.approval_status === "approved"
              ? "bg-green-500 text-white"
              : product.approval_status === "pending"
                ? "bg-yellow-400 text-yellow-900"
                : "bg-red-500 text-white"
          }`}
        >
          {product.approval_status}
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-1.5">
        {product.brand && (
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            {product.brand}
          </p>
        )}

        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
          {product.title}
        </h3>

        {/* Variant options */}
        {activeVariant && (
          <p className="text-xs text-slate-400 line-clamp-1">
            {[
              activeVariant.option1,
              activeVariant.option2,
              activeVariant.option3,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-base font-bold text-slate-900">
            {price !== null ? `₹${price}` : "—"}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through">
              ₹{compareAt}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t mt-1">
          <span className="text-[10px] text-slate-400">
            MOQ: {product.minimum_order_quantity}
          </span>
          {activeVariant && (
            <span className="text-[10px] text-slate-400">
              SKU: {activeVariant.sku}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Products Section ──────────────────────────────────────────────────────────

function ProductsSection({ categoryId }: { categoryId: string }) {
  const { data, isLoading, isError } = useGetProductsByCategory(categoryId);

  if (isLoading) {
    return <UnicsiLoader />;
  }

  if (isError) {
    return (
      <div className="border rounded-xl p-10 text-center text-slate-400 bg-white">
        <p className="text-sm">Failed to load products.</p>
      </div>
    );
  }

  const products = data?.data ?? [];

  if (products.length === 0) {
    return (
      <div className="border rounded-xl p-14 text-center text-slate-400 bg-white">
        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No products in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { categoryId } = use(params);
  const searchParams = useSearchParams();
  const nameFromURL = searchParams.get("name");

  const { data, isLoading, isError } = useGetProductsByCategory(categoryId);

  if (isLoading) {
    return <UnicsiLoader />;
  }

  if (isError) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">Failed to load category</h1>
      </div>
    );
  }

  const products = data?.data ?? [];
  const category = products[0]?.category;
  const productCount = data?.count ?? 0;

  return (
    <>
      <CategoryTabs />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* ✅ Simple Category Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {category?.name || nameFromURL || "Category"}
          </h1>

          {productCount > 0 && (
            <p className="text-sm text-slate-400 mt-1">
              {productCount} {productCount === 1 ? "product" : "products"}
            </p>
          )}
        </div>

        {/* ✅ Products Grid */}
        <ProductsSection categoryId={categoryId} />
      </div>
    </>
  );
}
