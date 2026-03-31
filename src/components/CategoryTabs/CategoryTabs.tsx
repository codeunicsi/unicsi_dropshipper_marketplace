// components/CategoryTabs.tsx
"use client";

import Link from "next/link";
import { useGetCategories } from "@/hooks/marketplace/useGetCategoryById";
import { useParams } from "next/navigation";

export default function CategoryTabs() {
  const { data: categories = [], isLoading } = useGetCategories();
  const params = useParams();
  const activeId = params?.categoryId;

  if (isLoading) return null;

  return (
    <div className="border-b bg-white sticky top-0 z-10">
      <div className="flex gap-6 overflow-x-auto px-6 py-3 scrollbar-hide">
        {categories.map((cat) => {
          const isActive = cat.id === activeId;

          return (
            <Link
              key={cat.id}
              href={`/marketplace/category/${cat.id}?name=${cat.name}`}
              className={`whitespace-nowrap text-sm font-medium transition ${
                isActive
                  ? "text-black border-b-2 border-black pb-1"
                  : "text-slate-500 hover:text-black"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
