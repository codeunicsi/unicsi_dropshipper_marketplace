"use client";
import React, { useState } from "react";

const SourceProductPage = () => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!image && !url) {
      alert("Please provide either Product Image or Product URL");
      return;
    }

    if (image && url) {
      alert("Only one is allowed: Image OR URL");
      return;
    }

    console.log({ image, url });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center">
      {/* Left side */}
      <div className="w-1/2 hidden md:block px-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Can’t find what you need?
        </h1>
        <p className="text-gray-600">
          Tell us what you're looking for and we'll try to source it for you.
        </p>
      </div>

      {/* Right side */}
      <div className="w-full md:w-1/2 flex justify-end px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Your Search Ends Here!
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            When you don’t find your desired product, let us know, we will try
            our best to source it.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                placeholder="Enter product name"
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#61ca6b]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Category
              </label>
              <select className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#61ca6b]">
                <option value="">select</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Accessories</option>
              </select>
            </div>

            {/* Image + URL */}
            <div className="grid grid-cols-2 gap-3">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <input
                  type="file"
                  disabled={!!url}
                  onChange={(e) => setImage(e.target.files[0])}
                  className={`w-full text-sm border rounded-md p-1 ${
                    url ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product URL
                </label>
                <input
                  type="url"
                  value={url}
                  disabled={!!image}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    image ? "bg-gray-100 cursor-not-allowed" : ""
                  } focus:outline-none focus:ring-2 focus:ring-[#61ca6b]`}
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Price
              </label>
              <input
                type="number"
                placeholder="Enter price"
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#61ca6b]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#61ca6b] hover:opacity-90 text-white py-2 rounded-md text-sm font-medium transition"
            >
              Submit Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SourceProductPage;
