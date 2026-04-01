"use client";

import {
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  SearchIcon,
} from "lucide-react";
import { motion, useInView, easeOut } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import sample1 from "../../../public/images/sample1.jpeg";
import sample2 from "../../../public/images/sample2.jpeg";
import sample3 from "../../../public/images/sample3.jpeg";
import sample4 from "../../../public/images/sample4.jpeg";
import sample5 from "../../../public/images/sample5.jpeg";
import sample6 from "../../../public/images/sample6.jpeg";
import sample7 from "../../../public/images/sample7.jpeg";
import sample8 from "../../../public/images/sample8.jpeg";
import sample9 from "../../../public/images/sample9.jpeg";
import bg from "../../../public/images/bgNew1.png";
import Image from "next/image";

type ShowcaseProduct = {
  id: number;
  name: string;
  discountedPrice: string;
  originalPrice: string;
  rating: number;
  reviews: number;
  image: { src?: string } | StaticImageData;
};

const products: ShowcaseProduct[] = [];

const CARD_WIDTH = 320; // w-80
const GAP = 24; // gap-6
const STEP = CARD_WIDTH + GAP;
const TOTAL = products.length;

// Triple the list: [clone-left] [original] [clone-right]
const INFINITE_ITEMS = [...products, ...products, ...products];

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.05,
      delay: (i % TOTAL) * 1,
      ease: easeOut,
    },
  }),
};

interface PopularProductsProps {
  isInView: boolean;
}

const Products = ({ isInView }: PopularProductsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [offsetIndex, setOffsetIndex] = useState(TOTAL);
  const [animate, setAnimate] = useState(true);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Translate value
  const translateX = -offsetIndex * STEP;

  const handleTransitionEnd = useCallback(() => {
    if (offsetIndex >= TOTAL * 2) {
      setAnimate(false);
      setOffsetIndex(offsetIndex - TOTAL);
    } else if (offsetIndex < TOTAL) {
      setAnimate(false);
      setOffsetIndex(offsetIndex + TOTAL);
    }
  }, [offsetIndex]);

  // Re-enable animation after silent jump
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animate]);

  const goNext = useCallback(() => {
    setAnimate(true);
    setOffsetIndex((prev) => prev + 1);
  }, []);

  const goPrev = useCallback(() => {
    setAnimate(true);
    setOffsetIndex((prev) => prev - 1);
  }, []);

  // Autoplay
  useEffect(() => {
    if (isHovered) {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      return;
    }
    autoplayRef.current = setInterval(goNext, 2800);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isHovered, goNext]);

  return (
    <div
      className="relative w-full max-w-7xl mx-auto mt-[-300px] sm:mt-12 md:mt-[-300px] lg:mt-[-300px] 
  px-4 sm:px-6 md:px-10 py-12 overflow-hidden bg-black/40 lg:bg-transparent"
    >
      {/* Background Image using Next.js Image */}
      <Image
        src={bg}
        alt="Popular Products Background"
        fill
        priority
        className="opacity-80 hidden lg:block"
      />

      {/* Content Wrapper */}
      <div className="relative z-10 pointer-events-auto">
        {/* Header Search */}
        <div className="relative z-40 pb-6 sm:pb-8 md:pb-8 flex">
          <div className="w-full max-w-2xl md:max-w-[60%] bg-white backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 flex flex-row items-center gap-3 sm:gap-4 shadow-2xl border border-white/30">
            <SearchIcon
              className="ml-2 sm:ml-3 mr-2 sm:mr-4 flex-shrink-0 text-black"
              size={18}
            />

            <input
              type="text"
              placeholder="Find the product you're looking for"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-black text-sm sm:text-base md:text-lg w-full"
            />

            <button className="my-button cursor-pointer text-white px-4 sm:px-6 md:px-10 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base md:text-lg whitespace-nowrap cursor-pointer">
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-xl sm:text-3xl md:text-4xl font-normal text-white mb-8"
        >
          Popular Products
        </motion.h2>

        {/* Infinite Slider */}
        <div
          className="w-full overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="flex gap-6 py-4"
            style={{
              width: "max-content",
              transform: `translateX(${translateX}px)`,
              transition: animate
                ? "transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                : "none",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {INFINITE_ITEMS.map((product, i) => (
              <motion.div
                key={`${product.id}-${i}`}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                // ✅ KEY CHANGE: Added hover:scale-[1.04] and will-change-transform
                // Also bumped shadow on hover to shadow-2xl for extra depth
                className="bg-white rounded-xl p-3 sm:p-4 flex-shrink-0 w-72 sm:w-76 md:w-80 group cursor-pointer
                  transition-all duration-300 ease-out
                  hover:scale-[1.04] hover:shadow-2xl hover:rounded-xl
                  will-change-transform"
              >
                <div className="relative mb-3 sm:mb-4 overflow-hidden rounded-lg">
                  <img
                    src={product.image?.src || "/placeholder.svg"}
                    alt={`Product ${product.id}`}
                    className="w-full h-40 sm:h-48 md:h-52 object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                  />

                  <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform duration-200">
                    <Heart size={18} className="text-red-500" />
                  </button>

                  <div className="absolute top-2 left-2 bg-gradient-to-r from-[#0097b2] to-[#7ed957] text-white text-xs font-bold px-2 py-1 rounded-full">
                    SALE
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2">
                    {product.name}
                  </p>

                  <div className="flex items-center gap-1.5">
                    <Star
                      size={16}
                      className="text-yellow-400 fill-yellow-400"
                    />
                    <span className="text-sm text-gray-600 font-medium">
                      {product.rating}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <span className="line-through text-sm text-gray-400">
                      {product.originalPrice}
                    </span>
                    <span className="font-bold text-lg sm:text-xl text-gray-900">
                      {product.discountedPrice}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Controls Section */}
        <div className="flex justify-between items-center mt-10">
          {/* Left Side Arrows */}
          <div className="flex gap-3">
            <button
              onClick={goPrev}
              className="group flex items-center justify-center w-10 h-10 rounded-full border border-gray-400 bg-white/10 cursor-pointer backdrop-blur-sm transition-all duration-300 hover:bg-black hover:scale-110"
            >
              <ChevronLeft
                size={18}
                className="text-white group-hover:text-white"
              />
            </button>

            <button
              onClick={goNext}
              className="group flex items-center justify-center w-10 h-10 rounded-full border border-gray-400 bg-white/10 cursor-pointer backdrop-blur-sm transition-all duration-300 hover:bg-black hover:text-white hover:scale-110"
            >
              <ChevronRight
                size={18}
                className="text-white group-hover:text-white"
              />
            </button>
          </div>

          {/* Right Side View More */}
          <a
            href="#"
            className="group flex items-center gap-2 text-white text-sm sm:text-base font-medium px-5 py-2 rounded-full border border-gray-400 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-black hover:text-white hover:scale-105"
          >
            View more
            <ChevronRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
    </div>
  );
};


export default Products;
