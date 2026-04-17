"use client";

import { useSearchParams } from "next/navigation";
import Banner from "@/components/partner/banner";
import TopCategories from "@/components/partner/top-categories";
import ProductsSection from "@/components/partner/product-section";

export default function MarketplaceHome() {
  const searchParams = useSearchParams();
  const categoryId = searchParams?.get("categoryId") ?? undefined;

  return (
    <>
      <div className="hidden md:block">
        <Banner />
      </div>
      <TopCategories />
      <ProductsSection categoryId={categoryId} />
    </>
  );
}
