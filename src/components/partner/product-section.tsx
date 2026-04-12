"use client";

import { useState, useRef, useEffect } from "react";
import ProductCard from "./product-card";
import CartDrawer from "./cart-drawer";
import { ChevronLeft, ChevronRight, Loader2, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product, useGetAllProducts } from "@/hooks/marketplace/useProduct";
import { API_BASE_URL } from "@/lib/api-client";
import { usePushToShopify } from "@/hooks/usePushToShopify";

// const PRODUCT_TABS = [
//   "Push to Shopify",
//   "Inventory Request",
//   "Potential Heroes",
//   "Hot Selling Products",
//   "Popular Demand",
// ];

type UIProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  weightGrams?: number;
  stock?: any;
  color?: string;
  size?: string;
  inStock?: boolean;
};

// ✅ Transform
const transformProducts = (products: Product[]): UIProduct[] => {
  return products.map((product) => {
    const firstVariant = product.variants?.[0]; // ✅ FIRST VARIANT
    const image = product.images?.[0];

    return {
      id: product.product_id,
      name: product.title,
      price: Number(firstVariant?.price ?? 0),
      image: image?.image_url || "/placeholder.png",
      weightGrams: Number(firstVariant?.weight_grams ?? 0),
      stock: firstVariant?.inventory_quantity ?? 0, // ✅ FIXED
      color: firstVariant?.option1 ?? "",
      size: firstVariant?.option2 ?? "",
      inStock: (firstVariant?.inventory_quantity ?? 0) > 0, // ✅ FIXED
    };
  });
};

type ProductsBlockProps = {
  title: string;
  bgColor?: string;
  showTabs?: boolean;
  products: UIProduct[];
};

function ProductsBlock({
  title,
  bgColor = "bg-white",
  showTabs,
  products,
}: ProductsBlockProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<UIProduct | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { pushProductToShopify } = usePushToShopify();

  const handleScroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  const handleBulkOrder = (product: UIProduct) => {
    const params = new URLSearchParams({
      productId: product.id,
      productName: product.name,
      sellingPrice: String(product.price),
    });

    router.push(`/marketplace/bulk-order?${params.toString()}`);
  };

  const handlePushToShopify = (product: UIProduct) => {
    setSelectedProduct(product);
    setIsCartOpen(true);
  };

  return (
    <div className={`${bgColor} rounded-2xl border border-slate-200 p-8 mb-8`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>

        <div className="flex gap-2">
          <button
            onClick={() => handleScroll("left")}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      {/* {showTabs && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {PRODUCT_TABS.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-full text-sm ${
                activeTab === index
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )} */}

      {/* Products */}
      <div
        ref={scrollRef}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {products.map((product) => {
          return (
            <ProductCard
              key={product.id}
              {...product}
              onPushToShopify={() => handlePushToShopify(product)}
              onBulkOrder={() => handleBulkOrder(product)}
            />
          );
        })}
      </div>

      {isCartOpen && (
        <CartDrawer
          onClose={() => setIsCartOpen(false)}
          selectedProduct={selectedProduct}
          response={null}
          isLoading={pushProductToShopify.isPending}
          error={pushProductToShopify.error?.message ?? null}
          onRetry={() => {
            if (!selectedProduct) return;
          }}
        />
      )}
    </div>
  );
}

type MarketplaceProduct = {
  product_id: string;
  title: string;
  images?: { image_url?: string }[];
  variants?: { variant_price?: string | number }[];
};

export default function ProductsSection({
  categoryId,
}: {
  categoryId?: string;
}) {
  const { data, isLoading, isPending } = useGetAllProducts();

  const [categoryProducts, setCategoryProducts] = useState<
    MarketplaceProduct[]
  >([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryCartOpen, setCategoryCartOpen] = useState(false);
  const [categorySelected, setCategorySelected] = useState<UIProduct | null>(
    null,
  );

  // ✅ Extract + transform API data
  const rawProducts: Product[] = Array.isArray((data as any)?.data)
    ? (data as any).data
    : [];
  const products = transformProducts(rawProducts);

  useEffect(() => {
    if (!categoryId) return;

    setCategoryLoading(true);

    fetch(
      `${API_BASE_URL}marketplace/products?categoryId=${encodeURIComponent(categoryId)}&limit=24`,
    )
      .then((res) => res.json())
      .then((data) => {
        const rows = data?.rows ?? data?.data ?? [];
        setCategoryProducts(Array.isArray(rows) ? rows : []);
      })
      .catch(() => setCategoryProducts([]))
      .finally(() => setCategoryLoading(false));
  }, [categoryId]);

  // ✅ Global loading
  if (isLoading || isPending) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Category Section */}
      {categoryId && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-bold mb-6">Products in this category</h2>

          {categoryLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          ) : categoryProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {categoryProducts.map((p) => (
                <ProductCard
                  key={p.product_id}
                  id={p.product_id}
                  name={p.title}
                  price={Number(p.variants?.[0]?.variant_price ?? 0)}
                  image={p.images?.[0]?.image_url ?? ""}
                  onPushToShopify={() => {
                    setCategorySelected({
                      id: p.product_id,
                      name: p.title,
                      price: Number(p.variants?.[0]?.variant_price ?? 0),
                      image: p.images?.[0]?.image_url ?? "/placeholder.png",
                    });
                    setCategoryCartOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {categoryCartOpen && categorySelected && (
        <CartDrawer
          onClose={() => {
            setCategoryCartOpen(false);
            setCategorySelected(null);
          }}
          selectedProduct={categorySelected}
          response={null}
          isLoading={false}
          error={null}
          onRetry={() => {}}
        />
      )}

      {/* Main Sections */}
      <ProductsBlock title="All Products" products={products} showTabs />
      <ProductsBlock
        title="Products for Testing"
        products={products}
        bgColor="bg-[#f1ebec]/60"
      />
    </div>
  );
}
