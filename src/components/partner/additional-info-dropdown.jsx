"use client";

import { ChevronDown, ChevronUp, PhoneCall, Store } from "lucide-react";
import { useState } from "react";

export default function AdditionalInfoDropdown() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded bg-black" />
          <h3 className="text-base font-bold text-slate-900">
            Additional Information
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
          aria-expanded={isOpen}
          aria-label={
            isOpen
              ? "Collapse additional information"
              : "Expand additional information"
          }
        >
          {isOpen ? (
            <ChevronUp className="h-6 w-6" />
          ) : (
            <ChevronDown className="h-6 w-6" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-7 flex flex-col gap-6 md:flex-row md:items-center md:gap-0">
          <div className="flex items-center gap-4 md:flex-1">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100">
              <Store className="h-6 w-6 text-slate-800" />
            </div>

            <div>
              <p className="text-sm text-slate-700">Sold by</p>
              <p className="text-sm font-semibold text-slate-900">
                Smile Traders
              </p>
              <p className="text-sm text-slate-700">Ludhiana, PUNJAB</p>
            </div>
          </div>

          <div className="hidden md:mx-7 md:block md:h-16 md:w-px md:bg-slate-200" />

          <div className="flex items-center gap-4 md:flex-1">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100">
              <PhoneCall className="h-6 w-6 text-slate-800" />
            </div>

            <div>
              <p className="text-sm text-slate-700">Need Assistance</p>
              <p className="text-sm font-semibold text-slate-900">
                0755-4304201
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
