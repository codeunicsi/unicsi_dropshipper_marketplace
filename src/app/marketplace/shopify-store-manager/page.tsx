"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Info,
  Link2,
  Pencil,
  ShoppingBag,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type StoreRow = {
  id: number;
  linkedOn: string;
  storeName: string;
  domain: string;
  isDefault?: boolean;
};

const stores: StoreRow[] = [
  {
    id: 1,
    linkedOn: "23 Feb 2026, 04:10 PM",
    storeName: "Store-1",
    domain: "store-1.myshopify.com",
  },
  {
    id: 2,
    linkedOn: "02 Apr 2025, 02:33 PM",
    storeName: "Store-2",
    domain: "store-2.myshopify.com",
    isDefault: true,
  },
];

const linkSteps = [
  'Click on "Link Shopify Store" and you will be redirected to Shopify App Store page',
  'Add Unicsi Dropshipping App by clicking "Add App"',
  "Login with your Shopify account and install app",
  "After installing Unicsi Dropshipping app on Shopify, you will be able to push products on Shopify from Unicsi",
];

export default function ShopifyStoreManagerPage() {
  const [autoConfirmOrders, setAutoConfirmOrders] = useState(true);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const [isLinkStoreDrawerOpen, setIsLinkStoreDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isLinkStoreDrawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLinkStoreDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [isLinkStoreDrawerOpen]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[#111827]">
          Shopify Store Manager
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoConfirmOrders((prev) => !prev)}
            className="flex items-center gap-4 rounded-sm border border-[#d5d5d5] bg-[#f7f7f7] px-6 py-1"
          >
            <span className="py-1 text-sm font-semibold text-[#2f3640]">
              Auto Confirm Orders
            </span>
            <span
              className={`relative h-6 w-12 rounded-full transition-colors ${
                autoConfirmOrders
                  ? "bg-linear-to-b from-[#0097b2] to-[#7ed957]"
                  : "bg-[#9ca3af]"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  autoConfirmOrders ? "translate-x-1" : "-translate-x-5"
                }`}
              />
            </span>
          </button>

          <Popover open={isInfoTooltipOpen} onOpenChange={setIsInfoTooltipOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Auto confirm orders info"
                className="rounded-full p-1 text-[#777] hover:bg-gray-100"
                onMouseEnter={() => setIsInfoTooltipOpen(true)}
                onMouseLeave={() => setIsInfoTooltipOpen(false)}
                onFocus={() => setIsInfoTooltipOpen(true)}
                onBlur={() => setIsInfoTooltipOpen(false)}
              >
                <Info className="size-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="center"
              side="bottom"
              sideOffset={8}
              className="w-[320px] border-[#3f3f46] bg-[#3f3f46] px-4 py-3 text-center text-sm font-medium leading-6 text-white"
              onMouseEnter={() => setIsInfoTooltipOpen(true)}
              onMouseLeave={() => setIsInfoTooltipOpen(false)}
            >
              If this is ON, all COD orders received on Unicsi will
              automatically get confirmed and processed further.
            </PopoverContent>
          </Popover>

          <Button
            className="ml-2 rounded-xs bg-black px-8 text-sm text-white hover:bg-black/90"
            onClick={() => setIsLinkStoreDrawerOpen(true)}
          >
            <Link2 className="size-6" />
            Link New Shopify Store
          </Button>
        </div>
      </div>

      <div className="overflow-hidden border border-[#e3e3e3]">
        <table className="w-full border-collapse">
          <thead className="bg-[#f2f2f2] text-left">
            <tr className="text-sm font-semibold text-[#2f3640]">
              <th className="w-16 px-6 py-4">#</th>
              <th className="w-80 px-6 py-4">Linked On</th>
              <th className="w-80 px-6 py-4">Store Platform</th>
              <th className="px-6 py-4">Store Details</th>
              <th className="w-96 px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr
                key={store.id}
                className="border-t border-[#e6e6e6] align-top"
              >
                <td className="px-6 py-6 text-xs text-[#1f2937]">
                  {store.id}.
                </td>
                <td className="px-6 py-6 text-xs text-[#334155]">
                  {store.linkedOn}
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2 text-[42px] font-semibold italic text-[#111827]">
                    <ShoppingBag className="size-4 text-[#67a844]" />
                    <span className="text-sm font-bold">shopify</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center border border-[#cfcfcf] text-[#7b7b7b]">
                      <Store className="size-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1f2937]">
                        {store.storeName}
                      </p>
                      <p className="w-60 text-xs text-[#334155]">
                        {store.domain}
                      </p>
                      {store.isDefault && (
                        <span className="mt-2 inline-flex w-26 items-center gap-1 rounded-full bg-[#efefef] px-2 py-1 text-[10px] text-[#464d57]">
                          <Check className="size-3" />
                          Default Store
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="flex items-center justify-center px-6 py-6">
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      className="h-10 rounded-sm px-7 text-xs font-semibold text-[#1f2937] hover:bg-linear-to-r from-[#0097b2] to-[#7ed957]"
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 rounded-sm px-7 text-xs font-semibold text-[#1f2937] hover:bg-linear-to-r from-[#0097b2] to-[#7ed957]"
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isLinkStoreDrawerOpen && (
        <div
          className="fixed inset-0 z-120 flex justify-end bg-black/40"
          onClick={() => setIsLinkStoreDrawerOpen(false)}
        >
          <aside
            className="h-full w-full max-w-140 overflow-y-auto bg-white py-12 shadow-2xl animate-slideIn"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-8 py-6">
              <div className="mb-8 flex items-center justify-center gap-4">
                <div className="rounded-md border border-[#e5e7eb] p-4 text-center">
                  <p className="text-sm font-bold leading-none text-[#232323]">
                    UNICSI
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#7b7b7b]">
                  <span className="h-px w-14 bg-[#d1d5db]" />
                  <Link2 className="size-5" />
                  <span className="h-px w-14 bg-[#d1d5db]" />
                </div>
                <div className="rounded-md border border-[#e5e7eb] p-3">
                  <div className="flex items-center gap-1 text-sm font-bold italic text-[#111827]">
                    <ShoppingBag className="size-4 text-[#67a844]" />
                    shopify
                  </div>
                </div>
              </div>

              <h2 className="mb-6 text-sm font-semibold text-[#3d3d3d]">
                Link your Shopify store in just 4 simple steps:
              </h2>

              <ul className="list-disc space-y-5 pl-6 marker:text-[#606060]">
                {linkSteps.map((step) => (
                  <li key={step} className="pl-1 text-sm leading-8 text-[#444]">
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="sticky bottom-0 border-t border-[#ececec] bg-white px-12 py-18">
              <Button className="h-12 w-full justify-center rounded-xs bg-black text-sm font-semibold text-white hover:cursor-pointer">
                <Link2 className="size-5" />
                Link New Shopify Store
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
