"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

type DropdownItem = {
  label: string;
  onClick?: () => void;
};

type IconDropdownProps = {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  items: DropdownItem[];
  className?: string;
  labelClassName?: string;
};

export function IconDropdown({
  icon: Icon,
  label,
  items,
  className,
  labelClassName,
}: IconDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={`h-8 flex items-center gap-3 bg-[#f8f8f8] hover:bg-gray-100 border-gray-300 rounded-sm text-black/80 border px-3 transition ${className}`}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {label}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 text-xs">
        {items.map((item, index) => (
          <DropdownMenuItem key={index} onClick={item.onClick}>
            <span className={cn(labelClassName)}>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
