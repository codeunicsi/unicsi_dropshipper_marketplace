"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/hooks/marketplace/useShopifySecret";
import { Pencil, Trash2 } from "lucide-react";

export default function PushToShopifyPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🔥 Fetch API
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get("dropshipper/shopify/pushed-products");

      // adjust based on your API response structure
      const data = res?.data || res || [];

      const formatted = data.map((item: any) => {
        const product = item.shopifyProduct;
        const variant = product?.variants?.[0] || {};

        return {
          id: item.id,
          name: product?.title || "No Name",
          date: new Date(item.createdAt).toLocaleString(),
          sku: variant?.sku || "-",
          price: Number(item.shopify_product_mrp || 0),
          sellingPrice: Number(variant?.price || 0),
          margin:
            Number(variant?.price || 0) - Number(item.shopify_product_mrp || 0),
          inventory: variant?.inventory_quantity || 0,
          image: product?.image?.src || "https://via.placeholder.com/40",
        };
      });

      setProducts(formatted);
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔍 Filter
  const filteredProducts = products.filter(
    (p: any) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Pushed to Shopify{" "}
          <span className="text-gray-400">({filteredProducts.length})</span>
        </h2>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by SKU ID or Product Name"
        className="w-full mb-4 px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-purple-100 text-gray-700">
              <th className="p-3">Product Details</th>
              <th className="p-3">Pushed Timestamp</th>
              <th className="p-3">SKU ID</th>
              <th className="p-3">Our Price</th>
              <th className="p-3">Selling Price</th>
              <th className="p-3">Inventory</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-6 text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((item: any) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  {/* Product */}
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt="product"
                      className="w-10 h-10 rounded"
                    />
                    <span className="text-blue-600 hover:underline cursor-pointer">
                      {item.name}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="p-3 text-gray-600">{item.date}</td>

                  {/* SKU */}
                  <td className="p-3">{item.sku}</td>

                  {/* Price */}
                  <td className="p-3">₹{item.price}</td>

                  {/* Selling */}
                  <td className="p-3">
                    <div>SP: ₹{item.sellingPrice}</div>
                    <div className="text-green-600 text-xs">
                      Margin: ₹{item.margin}
                    </div>
                  </td>

                  {/* Inventory */}
                  <td className="p-3">{item.inventory}</td>

                  {/* Actions */}
                  <td className="p-3 flex gap-3">
                    <Pencil className="w-4 h-4 cursor-pointer text-gray-600" />
                    <Trash2 className="w-4 h-4 cursor-pointer text-gray-600" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (UI only) */}
      <div className="flex justify-end items-center gap-3 mt-4 text-sm">
        <button className="px-2 py-1 border rounded">&lt;</button>
        <button className="px-3 py-1 border rounded bg-purple-100">1</button>
        <button className="px-2 py-1 border rounded">&gt;</button>
        <span className="text-gray-500">10 / page</span>
      </div>
    </div>
  );
}
