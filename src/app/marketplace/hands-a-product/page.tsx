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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="w-full max-w-7xl grid md:grid-cols-5 gap-10 items-center">
        {/* LEFT SECTION - 40% */}
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Can’t find what you need?
          </h1>
          <p className="text-lg text-gray-600">
            Tell us what you're looking for and we'll try to source it for you.
          </p>
        </div>

        {/* RIGHT SECTION - 60% */}
        <div className="md:col-span-3 flex justify-center">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-10 md:p-12">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              Your Search Ends Here!
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                className="w-full px-4 py-3.5 border rounded-lg text-[15px]"
              />

              {/* Category */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3.5 border rounded-lg text-[15px]"
              >
                <option value="">Select category</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Accessories</option>
              </select>

              {/* Image + URL */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="file"
                  disabled={!!url}
                  onChange={(e) =>
                    handleImageChange(e.target.files?.[0] || null)
                  }
                  className={`text-sm border rounded-lg p-2 ${
                    url ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />

                <input
                  type="url"
                  value={url}
                  disabled={!!image}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://product-link.com"
                  className={`px-4 py-3.5 border rounded-lg text-[15px] ${
                    image ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              {/* Price */}
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter expected price"
                className="w-full px-4 py-3.5 border rounded-lg text-[15px]"
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#61ca6b] text-white py-3.5 rounded-lg text-lg font-medium hover:opacity-90 transition"
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
