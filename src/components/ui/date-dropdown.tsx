"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DateDropdownProps = {
  label?: string; // 👈 custom label
  className?: string;
  buttonClassName?: string;
  labelClassName?: string;
};

export function DateDropdown({
  label = "Date",
  className,
  buttonClassName,
  labelClassName,
}: DateDropdownProps) {
  const [date, setDate] = React.useState<Date | undefined>();

  const displayText = date ? format(date, "PPP") : label;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 flex items-center gap-3 bg-[#f8f8f8] hover:bg-gray-100 border-gray-300 rounded-sm text-black/80",
            buttonClassName,
          )}
        >
          <CalendarIcon className="w-4 h-4" />

          <span className={cn("text-xs font-semibold", labelClassName)}>
            {displayText}
          </span>

          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn("w-auto p-0", className)} align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
