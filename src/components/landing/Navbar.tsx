"use client";

import { Menu as MenuIcon, X as XIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isMobileSolutionsOpen, setIsMobileSolutionsOpen] = useState(false);
  const router = useRouter();

  const navLinks = [
    { label: "All Categories", href: "/auth/login" },
    { label: "Solutions", href: "/solutions" },
    { label: "Why UNICSI", href: "/why-unicsi" },
    { label: "Resources", href: "/blog" },
  ];

  const solutionItems = [
    { label: "Bulk Order", href: "/bulk-order" },
    { label: "Profit Calculator", href: "/profit-calculator" },
    { label: "Print on Demand", href: "/print-on-demand" },
  ];

  return (
    <>
      <nav className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-24 relative">
            {/* Left — Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={160}
                height={80}
                className="object-contain h-14 md:h-16 w-auto"
              />
            </Link>

            {/* Center — Nav Links */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((item) =>
                item.label === "Solutions" ? (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setIsSolutionsOpen(true)}
                    onMouseLeave={() => setIsSolutionsOpen(false)}
                  >
                    <button className="hero-nav-link !text-black hover:!text-white !flex !flex-row !items-center gap-1">
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={`flex-shrink-0 transition-transform duration-200 ${isSolutionsOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Dropdown */}
                    {isSolutionsOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
                        {solutionItems.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className="block px-5 py-3 text-sm text-black transition-all duration-200 border-b border-gray-100 last:border-0 hover:text-white hover:[background:linear-gradient(to_right,#0097b2,#7ed957)]"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="hero-nav-link !text-black hover:!text-white"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>

            {/* Right — Auth Buttons */}
            <div className="hidden lg:flex items-center gap-2 sm:gap-4">
              <button
                className="hero-login-link !text-black hover:!text-white text-xs sm:text-sm md:text-base"
                onClick={() => router.push("/auth/login")}
              >
                Login
              </button>
              <button
                className="my-button text-white px-4 sm:px-6 py-2 rounded-full font-medium text-xs sm:text-sm md:text-base whitespace-nowrap cursor-pointer"
                onClick={() => router.push("/auth/register")}
              >
                <span>Sign up</span>
              </button>
            </div>

            {/* Mobile — Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-800 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-8">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={100}
              height={40}
              className="object-contain"
            />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-600 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
            >
              <XIcon size={22} />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {navLinks.map((item) =>
              item.label === "Solutions" ? (
                <div key={item.label}>
                  <button
                    className="hero-nav-link !text-black font-medium text-base py-3 px-3 border-b border-gray-50 w-full !flex !flex-row !items-center justify-between"
                    onClick={() =>
                      setIsMobileSolutionsOpen(!isMobileSolutionsOpen)
                    }
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={14}
                      className={`flex-shrink-0 transition-transform duration-200 ${isMobileSolutionsOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Mobile Sub-items */}
                  {isMobileSolutionsOpen && (
                    <div className="flex flex-col bg-gray-50 rounded-lg mx-1 my-1 overflow-hidden">
                      {solutionItems.map((subItem) => (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className="hero-nav-link !text-black hover:!text-white text-sm py-2.5 px-5 border-b border-gray-100 last:border-0 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="hero-nav-link !text-black font-medium text-base py-3 px-3 border-b border-gray-50 block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={() => {
                router.push("/auth/login");
                setIsMobileMenuOpen(false);
              }}
              className="hero-login-link !text-black w-full text-sm font-medium py-3"
            >
              Login
            </button>
            <button
              onClick={() => {
                router.push("/auth/register");
                setIsMobileMenuOpen(false);
              }}
              className="my-button text-white w-full px-6 py-2 rounded-full font-medium text-sm whitespace-nowrap cursor-pointer"
            >
              <span>Sign up</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[90] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};


export default Navbar;
