import { useEffect, useRef, useState } from "react";

const images = ["/images/Banner-1.png", "/images/Banner-2.png"];

export default function HomeBanner() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 8000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="px-12">
      <div className="relative max-w-6xl h-32 overflow-hidden rounded-md mx-auto mb-12">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="banner"
            className={`absolute w-full h-full object-cover transition-opacity duration-700 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="absolute bottom-4 w-full flex justify-center gap-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === current ? "bg-white" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
