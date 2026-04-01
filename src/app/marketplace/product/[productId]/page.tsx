"use client";

import { use, useState } from "react";
import { ArrowUpRight, CopyIcon, Loader2 } from "lucide-react";
import AdditionalInfoDropdown from "@/components/partner/additional-info-dropdown";
import ProductDetailBanner from "@/components/partner/product-detail-banner";
import DownloadMediaDropdown from "@/components/partner/download-media-dropdown";
import { useGetProductById } from "@/hooks/marketplace/useProduct";

type ProductDetailPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export function ProductInfo({ id, name, price }: any) {
  return (
    <div className="bg-white rounded-xl border p-6 space-y-2">
      <div className="flex gap-2 text-xs text-slate-500">
        C-Code:
        <span className="flex gap-2 font-semibold text-slate-800">
          {id}
          <CopyIcon className="w-4 h-4" />
        </span>
      </div>

      <h1 className="text-base font-medium">{name}</h1>

      <div className="flex gap-3">
        <span className="text-xl font-bold">₹{price}</span>
      </div>

      <button className="w-full bg-black text-white py-3 rounded-lg flex justify-center gap-2">
        <ArrowUpRight className="w-5 h-5" />
        Push To Shopify
      </button>
    </div>
  );
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = use(params);
  const { data, isLoading, isError } = useGetProductById(productId);
  const [selectedImage, setSelectedImage] = useState<string>("");

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">Product not found</h1>
      </div>
    );
  }

  const product = data.data;

  const variant = product.variants?.find((v: any) => v.is_active);
  const image = product.images?.[0]?.image_url || "/placeholder.png";

  const uiProduct = {
    id: product.product_id,
    name: product.title,
    price: Number(variant?.price ?? 0),
    description: product.description || "No description available",
    images: product.images?.map((img: any) => img.image_url) || [image],
  };

  const mediaUrls = uiProduct.images;

  // Default to first image if selectedImage not yet set
  const activeImage = selectedImage || mediaUrls[0];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-10">
        {/* LEFT */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {mediaUrls.slice(0, 5).map((img: string, i: number) => (
              <div
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`relative h-20 w-20 border rounded cursor-pointer overflow-hidden transition-all ${
                  activeImage === img
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

          {/* Main Image */}
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

        {/* RIGHT */}
        <ProductInfo
          id={uiProduct.id}
          name={uiProduct.name}
          price={uiProduct.price}
        />
      </div>

      {/* DESCRIPTION */}
      <div className="mt-8 border rounded p-6">
        <h2 className="text-xl font-bold mb-4">Product Description</h2>
        <p>{uiProduct.description}</p>
      </div>

      <AdditionalInfoDropdown />
      <ProductDetailBanner />
    </div>
  );
}
