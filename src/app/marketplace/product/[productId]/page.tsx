import {
  ArrowUpRight,
  Box,
  Calculator,
  Copy,
  CopyIcon,
  File,
  Info,
  Package,
  PackageCheck,
  ShieldCheck,
  Truck,
  Weight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AdditionalInfoDropdown from "@/components/partner/additional-info-dropdown";
import ProductDetailBanner from "@/components/partner/product-detail-banner";
import DownloadMediaDropdown from "@/components/partner/download-media-dropdown";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
};

type ProductInfoProps = {
  id: string;
  name: string;
  price: number;
};

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Nike Shoes - Men",
    price: 3999,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
    description:
      "Product Name: Nike Shoes - Men. Package Contains: 1 pair. Material: Breathable mesh and synthetic upper. Product Dimension: Standard men sizing. Additional Information: Lightweight comfort for all-day wear, cushioned sole for impact support, and durable grip suitable for casual and active use.",
  },
  {
    id: "2",
    name: "Running Sneakers Pro",
    price: 4499,
    image:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop",
    description:
      "Product Name: Pocket Perfume Multiple Fragrances 6 ml (Pack of 5 ) Package Contains: It has 5 Pack of Pocket Perfume Multiple Fragrances 6 mlMaterial: LotionProduct Dimension: 5 x 3 x 8 cm ‎‎‎Combo Pack: Pack of 1Weight: 175 gmsAdditional Information:Gentle and skin-friendly alcohol-free composition makes it suitable for all skin types and perfect for daily wear. Compact 6ml hexagonal packaging designed for easy carrying and precise application on the go. Carefully crafted fragrance composition ensures the scent remains noticeable throughout the day. Best applied to pulse points including wrist, neck, and collarbone areas for optimal fragrance diffusion.",
  },
  {
    id: "3",
    name: "Casual Canvas Shoes",
    price: 2499,
    image:
      "https://images.unsplash.com/photo-1441239372925-ac0b51c4c250?w=800&h=800&fit=crop",
    description:
      "Product Name: Casual Canvas Shoes. Package Contains: 1 pair. Material: Canvas upper with rubber outsole. Product Dimension: Low-top profile. Additional Information: Breathable and easy to pair with daily outfits, with a flexible sole for comfortable city and travel wear.",
  },
  {
    id: "4",
    name: "Premium Leather Boots",
    price: 5999,
    image:
      "https://images.unsplash.com/photo-1543163521-9733539c2d7f?w=800&h=800&fit=crop",
    description:
      "Product Name: Premium Leather Boots. Package Contains: 1 pair. Material: Genuine leather upper with sturdy outsole. Product Dimension: Mid-ankle support. Additional Information: Premium finish with strong durability, suitable for rugged use and formal-casual styling in all seasons.",
  },
];

type ProductDetailPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export function ProductInfo({ id, name, price }: ProductInfoProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-1">
      {/* C Code */}
      <div className="flex gap-2 text-xs text-slate-500">
        C-Code:{" "}
        <span className="flex gap-2 font-semibold text-slate-800">
          {id}
          <CopyIcon className="w-4 h-4" strokeWidth={2.5} />
        </span>
      </div>

      {/* Title */}
      <h1 className="text-base font-medium text-slate-900 leading-snug">
        {name}
      </h1>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-slate-900">₹{price}</span>
        <span className="text-sm font-semibold text-slate-400 line-through">
          ₹4497
        </span>
      </div>

      <div className="flex flex-row">
        <div className="w-full flex items-center gap-1">
          <p className="text-xs text-slate-500 border-b underline">
            Including GST, Shipping Charges & Discount
          </p>
          <Info className="w-3 h-3 items-center" />
          {/* Profit Button */}
          <button className="w-1/4 flex flex-row gap-1 items-center bg-purple-100 text-purple-700 p-2 rounded-sm text-[10px] ml-6 font-medium underline">
            <Calculator className="w-6 h-6 shrink-0" />
            <span className="font-semibold">Calculate Expected Profit</span>
          </button>
        </div>
      </div>

      {/* Discount Banner */}
      <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-lg text-xs font-semibold flex justify-between items-center">
        Increase Shipping discount upto ₹78 per order
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 text-sm py-2 mb-4 border-b">
        <div className="flex items-center gap-2 text-slate-600">
          <PackageCheck className="w-4 h-4" />
          <span className="text-xs">Units Sold --</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Truck className="w-4 h-4" />
          <span className="text-xs">Delivery Rate --</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Box className="w-4 h-4" />
          <span className="text-xs">Inventory 100</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs">Supplier Score 4/5</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Weight className="w-4 h-4" />
          <span className="text-xs">Weight 360 g</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <File className="w-4 h-4" />
          <span className="text-xs">Product GST 18%</span>
        </div>
      </div>

      {/* Push Button */}
      <button className="flex gap-2 items-center justify-center w-full bg-black text-white py-3 rounded-lg font-semibold text-lg hover:bg-black/90 transition">
        <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
        Push To Shopify
      </button>
    </div>
  );
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { productId } = await params;

  const product = SAMPLE_PRODUCTS.find((item) => item.id === productId);
  const mediaUrls = Array.from({ length: 6 }, () => product?.image ?? "");

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
        <p className="text-slate-600 mt-2">Product ID: {productId}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT SIDE - IMAGE GALLERY */}
        <div className="flex gap-4">
          {/* Thumbnails LEFT */}
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="relative h-20 w-20 rounded-md overflow-hidden border cursor-pointer hover:border-black transition"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main Image RIGHT */}
          <div className="relative flex-1 h-105 bg-slate-100 rounded-lg overflow-hidden">
            <div className="absolute right-4 top-4 z-10">
              <DownloadMediaDropdown
                currentMediaUrl={product.image}
                allMediaUrls={mediaUrls}
              />
            </div>
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* RIGHT SIDE - PRODUCT INFO */}
        <div className="space-y-4">
          <ProductInfo
            id={product.id}
            name={product.name}
            price={product.price}
          />
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-7">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-900">
            Product Description
          </h2>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm text-slate-900 underline underline-offset-2 font-bold"
          >
            <Copy className="h-4 w-4" strokeWidth={2.5} />
            Copy
          </button>
        </div>

        <p className="text-base leading-relaxed text-slate-700">
          {product.description}
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-7">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 rounded bg-black" />
            <h3 className="text-base font-bold text-slate-900">
              RTO & Return Charges
            </h3>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Weight className="h-5 w-5" />
            <span className="text-sm">
              Weight:{" "}
              <span className="font-semibold text-slate-900">360 g</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-slate-900">
          <div>
            <p className="text-sm font-semibold">Charges</p>
            <p className="mt-1 text-sm text-slate-700">
              For this product • All Inclusive
            </p>
          </div>
          <div className="text-right text-base font-semibold">RTO</div>
          <div className="text-right text-base font-semibold">RVP</div>
        </div>

        <div className="my-6 h-px w-full bg-slate-200" />

        <div className="grid grid-cols-3 gap-4 items-center text-slate-900">
          <div className="text-lg font-semibold tracking-wide">--</div>
          <div className="text-right text-sm">Rs 74</div>
          <div className="text-right text-sm">Rs 143</div>
        </div>

        <p className="mt-5 text-sm text-slate-700">
          *RVP will be charged on orders where supplier is not found to be at
          fault.
        </p>
      </div>

      <AdditionalInfoDropdown />
      <ProductDetailBanner />
    </div>
  );
}
