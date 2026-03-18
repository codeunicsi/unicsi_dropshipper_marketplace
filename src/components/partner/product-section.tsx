"use client";

import { useState, useRef } from "react";
import ProductCard from "./product-card";
import CartDrawer from "./cart-drawer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/hooks/marketplace/useProduct";

const PRODUCT_TABS = [
  "Push to Shopify",
  "Inventory Request",
  "Potential Heroes",
  "Hot Selling Products",
  "Popular Demand",
];

// ✅ Dummy product (matches backend structure)
const dummyProducts: Product[] = [
  {
    product_id: "dummy-product-1",
    supplier_id: "dummy-supplier",
    title: "Premium Cotton T-Shirt",
    description: "High quality cotton t-shirt for everyday wear",
    category_id: null,
    brand: "Unicsi",
    approval_status: "approved",
    lifecycle_status: "active",
    approved_by: "dummy-admin",
    approved_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    variants: [
      {
        variant_id: "dummy-variant-1",
        product_id: "dummy-product-1",
        sku: "TS-WHT-S",
        title: null,
        price: "19.99",
        compare_at_price: "25",
        cost_price: null,
        inventory_quantity: 80,
        inventory_management: "shopify",
        weight_grams: 250,
        option1: "White",
        option2: "S",
        option3: null,
        shopify_variant_id: null,
        attributes: {},
        is_active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],

    images: [
      {
        id: "dummy-image-1",
        product_id: "dummy-product-1",
        variant_id: null,
        image_url: "/placeholder.png",
        shopify_image_id: null,
        alt_text: "Premium Cotton T-Shirt",
        sort_order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
];

// ✅ Transform function (unchanged)
const transformProducts = (products: Product[]) => {
  return products.map((product) => {
    const firstVariant = product.variants?.find((v) => v.is_active);
    const firstImage = product.images?.[0];

    return {
      id: product.product_id,
      name: product.title,
      price: Number(firstVariant?.price ?? 0),
      image: firstImage?.image_url || "/placeholder.png",
      stock: firstVariant?.inventory_quantity ?? 0,
      color: firstVariant?.option1 ?? "",
      size: firstVariant?.option2 ?? "",
    };
  });
};

type ProductsBlockProps = {
  title: string;
  bgColor?: string;
  showTabs?: boolean;
  products: Product[];
};

function ProductsBlock({
  title,
  bgColor = "bg-white",
  showTabs,
  products,
}: ProductsBlockProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const formattedProducts = transformProducts(products);

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
        {formattedProducts.map((product) => (
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

type ProductsSectionProps = {
  products: Product[];
};

export default function ProductsSection({ products }: ProductsSectionProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* ✅ Real Products */}
      <ProductsBlock
        title="All Products"
        showTabs
        products={[...dummyProducts, ...products]}
      />

      {/* ✅ Dummy + Real Products */}
      <ProductsBlock
        title="Products for Testing"
        bgColor="bg-[#f1ebec]/60"
        products={[...dummyProducts, ...products]}
      />
    </div>
  );
}
