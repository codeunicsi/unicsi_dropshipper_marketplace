"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { listCategories, type Category } from "@/lib/api/categories";

export default function TopCategories() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCategories()
      .then((list) => {
        const featured = list
          .filter((c) => c.is_active && c.is_featured && c.parent_id == null)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        setCategories(featured);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("category-scroll");
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  const handleCategoryClick = (category: Category) => {
    router.push(
      `/marketplace/category/${category.id}?name=${encodeURIComponent(category.name)}`,
    );
  };

  if (!loading && categories.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Top Categories</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          id="category-scroll"
          className="flex gap-8 overflow-x-auto pb-4 hide-scrollbar"
        >
          {loading ? (
            <div className="flex items-center gap-4 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <span className="text-sm text-slate-500">
                Loading categories…
              </span>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                role="button"
                tabIndex={0}
                onClick={() => handleCategoryClick(category)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleCategoryClick(category)
                }
                className="shrink-0 w-36 text-center cursor-pointer group"
              >
                <div className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-55 flex flex-col">
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={
                        category.image_url || "/images/placeholder-category.jpg"
                      }
                      alt={category.name}
                      className="w-full h-28 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=280&fit=crop";
                      }}
                    />
                  </div>
                  <p className="mt-4 h-12 flex items-center justify-center text-sm font-semibold text-gray-800 group-hover:text-teal-600 transition-colors leading-5 line-clamp-2">
                    {category.name}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
