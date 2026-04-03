"use client";

import { useState } from "react";
import {
  Check,
  Info,
  Link2,
  Pencil,
  ShoppingBag,
  Store,
  Trash2,
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

export default function ShopifyStoreManagerPage() {
  const [autoConfirmOrders, setAutoConfirmOrders] = useState(true);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);

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
            <span className="text-sm font-semibold text-[#2f3640] py-1">
              Auto Confirm Orders
            </span>
            <span
              className={`relative h-6 w-12 rounded-full transition-colors ${
                autoConfirmOrders
                  ? " bg-linear-to-b from-[#0097b2] to-[#7ed957]"
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

          <Button className="rounded-xs bg-black px-8 ml-2 text-sm text-white hover:bg-black/90">
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
                        <span className="w-26 mt-2 inline-flex items-center gap-1 rounded-full bg-[#efefef] px-2 py-1 text-[10px] text-[#464d57]">
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
                      className="h-10 rounded-sm hover:bg-linear-to-r from-[#0097b2] to-[#7ed957]  px-7 text-xs font-semibold text-[#1f2937]"
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
    </div>
  );
}
