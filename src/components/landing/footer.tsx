"use client";
import { useRef, useState, useEffect } from "react";
import { motion, easeOut } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            setIsInView(true);
          } else if (!entry.isIntersecting && entry.intersectionRatio < 0.2) {
            setIsInView(false);
          }
        });
      },
      {
        threshold: [0.2, 0.4, 0.6],
        rootMargin: "-50px",
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const columnVariants = {
    hidden: { x: -80, opacity: 0 },
    visible: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.35,
        duration: 0.9,
        ease: easeOut,
      },
    }),
  };

  const linkVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.12,
        duration: 0.6,
        ease: easeOut,
      },
    }),
  };

  const bottomVariants = {
    hidden: { x: -60, opacity: 0 },
    visible: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: 1.6 + i * 0.3,
        duration: 0.8,
        ease: easeOut,
      },
    }),
  };

  const iconVariants = {
    hidden: { y: -50, opacity: 0, scale: 0.5 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: 2.5 + i * 0.2,
        duration: 0.8,
        ease: easeOut,
      },
    }),
  };

  const unicsiLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ];

  const supplierLinks = [
    { label: "Become a Supplier", href: "https://supplier.unicsi.com/login" },
    { label: "Bulk Order", href: "/marketplace/bulk-order" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ];

  const socialIcons = [
    {
      label: "Facebook",
      href: "https://www.facebook.com/share/1CRrgeKj2z/?mibextid=wwXIfr",
      color: "#1877F2",
      path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/shopunicsi?igsh=MWc3aXFzcmxjc3ZlZg%3D%3D&utm_source=qr",
      color: "url(#igGrad)",
      path: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/unicsiindia/",
      color: "#0A66C2",
      path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@shopunicsi",
      color: "#FF0000",
      path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    },
  ];

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className="relative inline-block text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base group"
    >
      {children}
      <span className="absolute left-0 -bottom-0.5 h-[1.5px] w-0 bg-white transition-all duration-500 ease-out group-hover:w-full" />
    </Link>
  );

  return (
    <footer className="bg-[#000000] text-white">
      {/* Main footer content */}
      <div
        ref={sectionRef}
        className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 lg:py-16"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-16">
          {/* Column 1 — Company Info */}
          <motion.div
            custom={0}
            variants={columnVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <Link href="/">
              <div className="mb-4 md:mb-6">
                <Image
                  src="/images/footerLogo.png"
                  alt="UNICSI Logo"
                  width={160}
                  height={80}
                  className="object-contain w-auto h-12 md:h-20"
                />
              </div>
            </Link>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
              Powering Modern Dropshipping with unique, high-potential Products
              and Scalable Fulfillment Infrastructure.
            </p>
          </motion.div>

          {/* Column 2 — UNICSI Links */}
          <motion.div
            custom={1}
            variants={columnVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mt-0 lg:mt-5"
          >
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-[#ffffff]">
              UNICSI
            </h3>
            <ul className="space-y-3 md:space-y-4">
              {unicsiLinks.map((link, i) => (
                <motion.li
                  key={link.label}
                  custom={i}
                  variants={linkVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                >
                  <NavLink href={link.href}>{link.label}</NavLink>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3 — SUPPORT */}
          <motion.div
            custom={2}
            variants={columnVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mt-0 lg:mt-5"
          >
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-[#ffffff]">
              SUPPORT
            </h3>
            <ul className="space-y-3 md:space-y-4">
              {supplierLinks.map((link, i) => (
                <motion.li
                  key={link.label}
                  custom={i}
                  variants={linkVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                >
                  <NavLink href={link.href}>{link.label}</NavLink>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4 — Subscribe */}
          <motion.div
            className="flex flex-col items-start mt-0 lg:mt-5"
            custom={3}
            variants={columnVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-[#ffffff]">
              <span>Subscribe</span>
            </h3>
            <div
              className="flex items-center w-full max-w-sm rounded-full bg-white"
              style={{ padding: "5px 5px 5px 16px" }}
            >
              <input
                type="email"
                placeholder="Enter your email here"
                className="flex-1 min-w-0 border-none outline-none bg-transparent text-gray-700 placeholder-gray-400 text-sm"
              />
              <button className="my-button flex-shrink-0 text-white rounded-full px-2 py-2 text-[10px] font-semibold whitespace-nowrap transition-all duration-200">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <motion.div
              className="text-center lg:text-left"
              custom={0}
              variants={bottomVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <h4 className="font-semibold mb-1 md:mb-2 text-[#F4F4F4] text-sm md:text-base">
                Copyright by
              </h4>
              <p className="text-[#FBFBFB] text-sm md:text-base">
                © 2025 UNICSI. All Rights Reserved
              </p>
            </motion.div>

            {/* Contact */}
            <motion.div
              className="text-center lg:text-left"
              custom={1}
              variants={bottomVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <h4 className="font-semibold mb-1 md:mb-2 text-[#FBFBFB] text-sm md:text-base">
                Contact Us
              </h4>
              <p className="text-[#FBFBFB] text-sm md:text-base">
                +919771622333
              </p>
            </motion.div>

            {/* Address */}
            <motion.div
              className="text-center lg:text-left"
              custom={2}
              variants={bottomVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <h4 className="font-semibold mb-1 md:mb-2 text-[#FBFBFB] text-sm md:text-base">
                Address
              </h4>
              <p className="text-[#FBFBFB] text-sm md:text-base">
                R5/130, WING B, NAWADA HOUSING COMPLEX, <br /> UTTAM NAGAR, WEST
                DELHI, DELHI, 110059
              </p>
            </motion.div>

            {/* Social Icons */}
            <div className="flex gap-3 md:gap-4">
              <svg width="0" height="0" className="absolute">
                <defs>
                  <linearGradient
                    id="igGrad"
                    x1="0%"
                    y1="100%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="25%" stopColor="#e6683c" />
                    <stop offset="50%" stopColor="#dc2743" />
                    <stop offset="75%" stopColor="#cc2366" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
              </svg>

              {socialIcons.map((icon, i) => (
                <motion.a
                  key={icon.label}
                  href={icon.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  custom={i}
                  variants={iconVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  className="group w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center relative overflow-hidden bg-[#1a1a1a] border border-gray-700 transition-all duration-500 hover:scale-110 hover:border-transparent shadow-lg"
                  aria-label={icon.label}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"
                    style={{
                      background: "linear-gradient(45deg, #0097b2, #7ed957)",
                    }}
                  />
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 relative z-10 transition-all duration-500 ease-out group-hover:rotate-[360deg]"
                    viewBox="0 0 24 24"
                    style={{
                      fill:
                        icon.label === "Instagram"
                          ? "url(#igGrad)"
                          : icon.color,
                    }}
                  >
                    <path d={icon.path} />
                  </svg>
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 absolute z-10 fill-white opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out group-hover:rotate-[360deg]"
                    viewBox="0 0 24 24"
                  >
                    <path d={icon.path} />
                  </svg>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
