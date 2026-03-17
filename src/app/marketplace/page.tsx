"use client";
import Banner from "@/components/partner/banner";
import TopCategories from "@/components/partner/top-categories";
import ProductsSection from "@/components/partner/product-section";
import { Product, useProducts } from "@/hooks/marketplace/useProduct";

export default function Marketplace() {
  const { data: products, isLoading, error } = useProducts();
  console.log("products ==>", products?.data);
  return (
    <>
      <Banner />
      <TopCategories />
      <ProductsSection products={products?.data || []} />
    </>
  );
}
