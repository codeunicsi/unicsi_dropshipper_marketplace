"use client";
import React, { useState } from "react";
import { apiClient } from "@/lib/api-client";

const SourceProductPage = () => {
  const [image, setImage] = useState<File | null>(null);
  const [url, setUrl] = useState("");

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImage(file);
      setUrl("");
    } else {
      setImage(null);
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value) {
      setImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim() || !category || !price) {
      alert("All fields are required");
      return;
    }

    if (!image && !url) {
      alert("Provide either Image or URL");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("productName", productName.trim());
      formData.append("productCategory", category);
      formData.append("expectedPrice", price);

      if (image) {
        formData.append("productImage", image);
      } else if (url) {
        formData.append("productImageUrl", url);
      }

      const res = await apiClient.postForm(
        "dropshipper/source-requests",
        formData,
      );

      console.log("API RESPONSE:", res.data);

      alert("✅ Request submitted successfully");

      setProductName("");
      setCategory("");
      setPrice("");
      setUrl("");
      setImage(null);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl grid gap-10 items-center md:grid-cols-5 md:px-4">
        {/* LEFT SECTION - 40% */}
        <div className="md:col-span-2 space-y-4 order-2 md:order-1">
          <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
            Can’t find what you need?
          </h1>
          <p className="text-base text-gray-600 sm:text-lg">
            Tell us what you're looking for and we'll try to source it for you.
          </p>
        </div>

        {/* RIGHT SECTION - 60% */}
        <div className="md:col-span-3 flex justify-center order-1 md:order-2">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-6 sm:p-8 md:p-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 sm:text-3xl">
              Your Search Ends Here!
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                className="w-full px-4 py-3 border rounded-xl text-sm sm:text-base focus:border-green-400 focus:outline-none"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl text-sm sm:text-base focus:border-green-400 focus:outline-none"
              >
                <option value="">Select category</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Accessories</option>
              </select>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-gray-700 mb-2 block">
                    Upload image
                  </span>
                  <input
                    type="file"
                    disabled={!!url}
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] || null)
                    }
                    className={`w-full text-sm border rounded-xl p-3 ${
                      url ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-gray-700 mb-2 block">
                    Or product URL
                  </span>
                  <input
                    type="url"
                    value={url}
                    disabled={!!image}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://product-link.com"
                    className={`w-full px-4 py-3 border rounded-xl text-sm sm:text-base ${
                      image ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                </label>
              </div>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter expected price"
                className="w-full px-4 py-3 border rounded-xl text-sm sm:text-base focus:border-green-400 focus:outline-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#61ca6b] text-white py-3.5 rounded-xl text-base font-medium hover:opacity-90 transition duration-150"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceProductPage;
