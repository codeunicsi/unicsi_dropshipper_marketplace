"use client";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronDown,
  Cpu,
  TrendingDown,
  TrendingUp,
  Binoculars,
  ToggleLeft,
  MapPin,
  Truck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// =========== DATA ==========
const steps = [
  {
    icon: Binoculars,
    title: "Preview Potential Suppliers",
    description:
      "Preview the list of re-routed suppliers before pushing the product. (Selection is auto-managed).",
  },
  {
    icon: ToggleLeft,
    title: "Enable Re-Routing",
    description:
      "Turn on Supplier Re-Routing while pushing a product or from the Manage Products page.",
  },
  {
    icon: MapPin,
    title: "We Auto-Assign the Best Supplier",
    description: "Based on customer location, delivery speed, and performance.",
  },
  {
    icon: Truck,
    title: "Faster Deliveries, Happier Customers",
    description: "Quick shipping = fewer RTOs and more success.",
  },
];

const faqs = [
  {
    question: "Can I choose a specific supplier?",
    answer:
      "Yes. You can still manually select preferred suppliers when needed. However, the automatic re-routing program will optimize delivery performance by selecting the best supplier based on location, performance history, and delivery speed.",
  },
  {
    question: "Can I turn this feature off later?",
    answer:
      "Absolutely. You can toggle the Supplier Re-routing feature on or off at any time from the Manage Products page. This gives you complete flexibility to use the feature only when you want to.",
  },
  {
    question: "Will I see any extra charges?",
    answer:
      "No. The Supplier Re-routing feature is completely free to use. There are no additional charges or fees for enabling this optimization feature for your orders.",
  },
  {
    question: "Will this affect my profit margin?",
    answer:
      "No, it should actually improve your profit margin by reducing failed deliveries and returns. Since the feature helps ensure more successful deliveries, you'll experience fewer refunds and returns that impact your bottom line.",
  },
];

const benefits = [
  {
    icon: Truck,
    title: "Faster Delivery",
    description: "Orders reach customers quicker, improving satisfaction.",
  },
  {
    icon: TrendingUp,
    title: "Higher Profits",
    description: "More deliveries mean fewer cancellations & returns.",
  },
  {
    icon: TrendingDown,
    title: "Lower RTO Rate",
    description: "Smart supplier selection reduces failed deliveries.",
  },
  {
    icon: Cpu,
    title: "No Extra Effort",
    description: "Fully automated, no manual supplier selection required.",
  },
];

// ============= COMPONENTS ==============

const SupplierReRoutingHero = () => {
  return (
    <div className="w-full flex bg-[#f2ecfd] gap-8 p-6 items-center">
      {/* Left Content */}
      <div className="flex flex-col gap-8 max-w-xl">
        {/* Intro */}
        <div>
          <h1 className="text-sm">Introducing</h1>
          <h3 className="text-xl font-extrabold text-purple-700">
            Supplier Re-routing Program
          </h3>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-extrabold">
            🚀 Boost Your Delivery Rates
          </h3>
          <p className="text-sm mt-2">
            With Supplier Re-Routing, your orders will be automatically assigned
            to the best supplier based on order's location, delivery speed, and
            performance, so you get more successful deliveries & fewer RTOs!
          </p>
        </div>

        {/* CTA */}
        <Button
          variant="outline"
          className="w-fit border border-black font-bold px-6"
        >
          Manage Products
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex justify-end">
        <img
          src="/svg/supplier-rerouting-illustration.svg"
          alt="Supplier Re-routing"
          className="max-w-md w-full"
        />
      </div>
    </div>
  );
};

export const SupplierReRoutingHowItWorks = () => {
  return (
    <div className="w-full bg-[#fffcf2] px-8 py-14">
      {/* Heading */}
      <h2 className="text-2xl font-bold text-center mb-12">
        How Does Supplier Re-Routing Work?
      </h2>

      {/* Steps */}
      <div className="flex items-start justify-between gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div key={index} className="flex flex-1 items-start gap-6">
              {/* Step Content */}
              <div className="flex flex-col items-center text-center max-w-xs mx-auto">
                {/* Icon Circle */}
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4">
                  <Icon className="w-12 h-12 text-black" strokeWidth={1.5} />
                </div>

                <h3 className="font-semibold text-sm">{step.title}</h3>

                <p className="text-xs text-slate-600 mt-2">
                  {step.description}
                </p>
              </div>

              {/* Arrow Between Steps */}
              {index !== steps.length - 1 && (
                <div className="flex items-center text-center mt-12">
                  <ChevronRight className="w-12 h-12 text-black" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Example Box */}
      <div className="bg-white mt-14 p-6 text-center max-w-4xl mx-auto">
        <h4 className="font-semibold mb-3">Example</h4>
        <p className="text-sm text-slate-700">
          Order from Delhi → Assigned to Supplier A from Delhi → Faster delivery
          → Reduced RTO risk
        </p>
        <p className="text-sm text-slate-700 mt-2">
          Order from Bangalore → Assigned to Supplier B from Bangalore → No
          unnecessary delays → Happy customers!
        </p>
      </div>
    </div>
  );
};

export const SupplierReRoutingBenefits = () => {
  return (
    <div className="w-full bg-[#f5f4f7] px-8 py-16">
      {/* Heading */}
      <h2 className="text-2xl font-bold text-center mb-14">Key Benefits</h2>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
        {benefits.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={index} className="flex flex-col items-center text-center">
              {/* Icon Circle */}
              <div className="w-24 h-24 rounded-full bg-[#e8e3f1] flex items-center justify-center mb-5">
                <Icon className="w-8 h-8 text-black" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold">{item.title}</h3>

              {/* Description */}
              <p className="text-sm text-slate-600 mt-2 max-w-xs">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SupplierReRoutingFaq = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <div className="w-full bg-[#f5f4f7] px-6 py-16">
      {/* Heading */}
      <h2 className="text-2xl font-bold text-center mb-12">FAQs</h2>

      {/* FAQ List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;

          return (
            <div key={index} className="border bg-white overflow-hidden">
              {/* Question */}
              <button
                onClick={() => setActiveIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left text-base font-semibold"
              >
                {faq.question}

                <ChevronDown
                  className={cn(
                    "w-6 h-6 text-gray-500 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {/* Answer */}
              {isOpen && (
                <div className="px-6 pb-6">
                  <div className="border-l-3 border-black pl-4 text-base text-black/90">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SupplierReRoutingPage = () => {
  return (
    <>
      <div>
        <SupplierReRoutingHero />
      </div>
      <div className="mt-8">
        <SupplierReRoutingHowItWorks />
      </div>
      <div>
        <SupplierReRoutingBenefits />
      </div>
      <div>
        <SupplierReRoutingFaq />
      </div>
    </>
  );
};

export default SupplierReRoutingPage;
