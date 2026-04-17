"use client";

import { cn } from "@/lib/utils";

export type TabItem = {
  label: string;
  value: string;
  count?: number;
};

type ActiveTabsProps = {
  tabs: TabItem[];
  active: string;
  onChange: (value: string) => void;
};

export function ActiveTabs({ tabs, active, onChange }: ActiveTabsProps) {
  return (
    <div className="border-b">
      <div className="flex  gap-8">
        {tabs.map((tab) => {
          const isActive = active === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={cn(
                "relative pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "text-black font-semibold"
                  : "text-black/90 hover:text-black",
              )}
            >
              <div className="flex items-center gap-2">
                {tab.label}

                {typeof tab.count !== "undefined" && (
                  <span className="px-2 py-0.5 text-xs border rounded-md bg-white">
                    {tab.count}
                  </span>
                )}
              </div>

              {isActive && (
                <span className="absolute left-0 bottom-0 h-0.5 w-full bg-black" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
