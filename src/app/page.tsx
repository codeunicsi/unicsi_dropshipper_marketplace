import Image from "next/image";
import Hero from "@/components/landing/hero";
import CTASection from "@/components/landing/cta-section";
import InventorySection from "@/components/landing/inventory-section";
import PopularProducts from "@/components/landing/popular-products";
import FeaturesSection from "@/components/landing/features-section";
import Integrations from "@/components/landing/integrations";
import Services from "@/components/landing/services";
import Partners from "@/components/landing/partners";
import Logistics from "@/components/landing/logistics";
import Testimonials from "@/components/landing/testimonials";
import Footer from "@/components/landing/footer";
import LetsTalk from "@/components/landing/lets-talk";
import Navbar from "@/components/landing/Navbar";

export default function Home() {
  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
  return (
    <main className="min-h-screen min-w-0 bg-white overflow-x-clip">
      <Navbar />
      <Hero />
      <CTASection />
      <InventorySection />
      <PopularProducts />
      <FeaturesSection />
      <Integrations />
      <Services />
      <Partners />
      {/* <Logistics /> */}
      <Testimonials />
      <LetsTalk />
      <Footer />
    </main>
  );
}
