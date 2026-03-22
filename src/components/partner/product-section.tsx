"use client";

import { useState, useRef, useEffect } from "react";
import ProductCard from "./product-card";
import CartDrawer from "./cart-drawer";
import { ChevronLeft, ChevronRight, Loader2, Package } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1/";

const PRODUCT_TABS = [
  "Push to Shopify",
  "Inventory Request",
  "Potential Heroes",
  "Hot Selling Products",
  "Popular Demand",
];

const SAMPLE_PRODUCTS = [
  {
    id: "1",
    name: "Nike Shoes - Men",
    price: 3999,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
  },
  {
    id: "2",
    name: "Running Sneakers Pro",
    price: 4499,
    image:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    name: "Casual Canvas Shoes",
    price: 2499,
    image:
      "https://images.unsplash.com/photo-1441239372925-ac0b51c4c250?w=400&h=400&fit=crop",
  },
  {
    id: "4",
    name: "Premium Leather Boots",
    price: 5999,
    image:
      "https://images.unsplash.com/photo-1543163521-9733539c2d7f?w=400&h=400&fit=crop",
  },
];

type ProductsBlockProps = {
  title: string;
  bgColor?: string;
  showTabs?: boolean;
};

function ProductsBlock({
  title,
  bgColor = "bg-white",
  showTabs,
}: ProductsBlockProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
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
      {showTabs && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {PRODUCT_TABS.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap text-sm transition-colors duration-200 ${
                activeTab === index
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Products */}
      <div
        ref={scrollRef}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {SAMPLE_PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onPushToShopify={() => setIsCartOpen(true)}
          />
        ))}
      </div>

      {isCartOpen && <CartDrawer onClose={() => setIsCartOpen(false)} />}
    </div>
  );
}

type MarketplaceProduct = {
  product_id: string;
  title: string;
  images?: { image_url?: string }[];
  variants?: { variant_price?: string | number }[];
};

export default function ProductsSection({ categoryId }: { categoryId?: string }) {
  const [categoryProducts, setCategoryProducts] = useState<MarketplaceProduct[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      setCategoryProducts([]);
      return;
    }
    setCategoryLoading(true);
    fetch(`${API_BASE}marketplace/products?categoryId=${encodeURIComponent(categoryId)}&limit=24`)
      .then((res) => res.json())
      .then((data) => {
        const rows = data?.rows ?? data?.data ?? [];
        setCategoryProducts(Array.isArray(rows) ? rows : []);
      })
      .catch(() => setCategoryProducts([]))
      .finally(() => setCategoryLoading(false));
  }, [categoryId]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {categoryId && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Products in this category</h2>
          {categoryLoading ? (
            <div className="flex items-center gap-2 py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              <span className="text-sm text-slate-500">Loading products…</span>
            </div>
          ) : categoryProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">No products in this category yet.</p>
              <p className="text-sm text-slate-500 mt-1">Products will appear here once they are added and approved.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryProducts.map((p) => {
                const img = p.images?.[0]?.image_url ?? "";
                const price = p.variants?.[0]?.variant_price != null
                  ? Number(p.variants[0].variant_price)
                  : 0;
                return (
                  <ProductCard
                    key={p.product_id}
                    id={p.product_id}
                    name={p.title}
                    price={price}
                    image={img}
                    onPushToShopify={() => {}}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
      <ProductsBlock title="All Products" showTabs />
      <ProductsBlock title="Products for Testing" bgColor="bg-[#f1ebec]/60" />
    </div>
  );
}
