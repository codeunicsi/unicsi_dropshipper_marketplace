"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: FaqItem[];
  className?: string;
  itemClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  showHelpfulActions?: boolean;
  defaultOpenItem?: string;
  variant?: "default" | "card";
}

export function FaqSection({
  items,
  className,
  itemClassName,
  triggerClassName,
  contentClassName,
  showHelpfulActions = false,
  defaultOpenItem,
  variant = "default",
}: FaqSectionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpenItem}
      className={cn("w-full", className)}
    >
      {items.map((item, index) => {
        const itemValue = `item-${index}`;

        return (
          <AccordionItem
            key={`${item.question}-${index}`}
            value={itemValue}
            className={cn(
              variant === "card"
                ? "mb-4 rounded-md border border-[#e6e6e6] px-5 last:mb-0"
                : "",
              itemClassName,
            )}
          >
            <AccordionTrigger
              className={cn(
                variant === "card"
                  ? "py-5 text-[19px] font-medium text-[#243b53] no-underline hover:no-underline"
                  : "",
                triggerClassName,
              )}
            >
              {item.question}
            </AccordionTrigger>
            <AccordionContent
              className={cn(
                variant === "card" ? "pb-6 text-[#334e68]" : "",
                contentClassName,
              )}
            >
              <div
                className={cn(
                  variant === "card"
                    ? "space-y-6 border-t border-[#ebebeb] pt-5 text-sm leading-8"
                    : "",
                )}
              >
                <p>{item.answer}</p>

                {showHelpfulActions && variant === "card" && (
                  <div className="border-t border-[#ebebeb] pt-6">
                    <p className="mb-3 text-sm font-semibold leading-[1.1] text-black">
                      Is this helpful?
                    </p>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 border-[#bed6bf] bg-[#e7f4e8] px-6 text-sm text-[#213547] hover:bg-[#d8ecda]"
                      >
                        <ThumbsUp className="size-4" />
                        Yes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 border-[#e0c2c2] bg-[#f4e4e4] px-6 text-sm text-[#213547] hover:bg-[#ecd4d4]"
                      >
                        <ThumbsDown className="size-4" />
                        No
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
