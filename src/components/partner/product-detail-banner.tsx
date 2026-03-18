import Image from "next/image";

type ProductDetailBannerProps = {
  imageSrc?: string;
  alt?: string;
};

export default function ProductDetailBanner({
  imageSrc = "/Clout-Assurance.svg",
  alt = "Marketplace banner",
}: ProductDetailBannerProps) {
  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <Image
        src={imageSrc}
        alt={alt}
        width={1600}
        height={300}
        className="h-auto w-full object-cover"
        priority
      />
    </div>
  );
}
