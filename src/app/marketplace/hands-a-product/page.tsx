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

  // Handle image change
  const handleImageChange = (file: File | null) => {
    if (file) {
      setImage(file);
      setUrl(""); // clear URL if image selected
    } else {
      setImage(null);
    }
  };

  // Handle URL change
  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value) {
      setImage(null); // clear image if URL entered
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

      // ✅ Use FormData instead of JSON
      const formData = new FormData();

      formData.append("productName", productName.trim());
      formData.append("productCategory", category);
      formData.append("expectedPrice", price);

      // ✅ Conditional append
      if (image) {
        formData.append("productImage", image); // file
      } else if (url) {
        formData.append("productImageUrl", url); // string
      }

      const res = await apiClient.postImage(
        "dropshipper/source-requests",
        formData,
      );

      console.log("API RESPONSE:", res.data);

      alert("✅ Request submitted successfully");

      // Reset form
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
    <div className="min-h-screen bg-gray-100 flex items-center">
      {/* Left Section */}
      <div className="w-1/2 hidden md:block px-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Can’t find what you need?
        </h1>
        <p className="text-gray-600">
          Tell us what you're looking for and we'll try to source it.
        </p>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex justify-end px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Search Ends Here!
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Select category</option>
              <option>Electronics</option>
              <option>Clothing</option>
              <option>Accessories</option>
            </select>

            {/* Image + URL */}
            <div className="grid grid-cols-2 gap-3">
              {/* Image Upload */}
              <input
                type="file"
                disabled={!!url}
                onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                className={`text-sm border rounded-md p-1 ${
                  url ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />

              {/* URL Input */}
              <input
                type="url"
                value={url}
                disabled={!!image}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://product-link.com"
                className={`px-3 py-2 border rounded-md text-sm ${
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
              className="w-full px-3 py-2 border rounded-md text-sm"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#61ca6b] text-white py-2 rounded-md hover:opacity-90"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SourceProductPage;
