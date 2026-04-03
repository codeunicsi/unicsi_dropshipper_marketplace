"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqTopic } from "@/data/faqs";

interface FaqTopicsSidebarProps {
  topics: FaqTopic[];
  activeFaqSlug?: string;
}

const OPEN_FAQ_TOPIC_STORAGE_KEY = "marketplace_open_faq_topic";

export function FaqTopicsSidebar({
  topics,
  activeFaqSlug,
}: FaqTopicsSidebarProps) {
  const [openTopicSlug, setOpenTopicSlug] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;

    const savedTopicSlug = window.sessionStorage.getItem(
      OPEN_FAQ_TOPIC_STORAGE_KEY,
    );
    if (!savedTopicSlug) return null;

    const topicExists = topics.some((topic) => topic.slug === savedTopicSlug);
    return topicExists ? savedTopicSlug : null;
  });

  const toggleTopic = (topicSlug: string) => {
    setOpenTopicSlug((prev) => {
      const nextValue = prev === topicSlug ? null : topicSlug;

      if (typeof window !== "undefined") {
        if (nextValue) {
          window.sessionStorage.setItem(OPEN_FAQ_TOPIC_STORAGE_KEY, nextValue);
        } else {
          window.sessionStorage.removeItem(OPEN_FAQ_TOPIC_STORAGE_KEY);
        }
      }

      return nextValue;
    });
  };

  return (
    <aside className="border-r p-4">
      <h2 className="pb-4 text-xl font-semibold text-[#1f2937]">
        All FAQ Topics
      </h2>
      <div className="space-y-3 border-t border-[#e5e7eb] pt-4">
        {topics.map((topic) => {
          const isOpen = openTopicSlug === topic.slug;

          return (
            <div key={topic.slug} className="border-b border-[#e5e7eb] pb-3">
              <button
                type="button"
                onClick={() => toggleTopic(topic.slug)}
                className="flex w-full items-center justify-between py-2 text-left text-base text-[#243b53]"
              >
                <span className={cn(isOpen && "font-semibold")}>
                  {topic.title}
                </span>
                <ChevronRight
                  className={cn(
                    "size-5 shrink-0 text-[#5f6c7b] transition-transform duration-200",
                    isOpen && "rotate-90",
                  )}
                />
              </button>

              {isOpen && (
                <ul className="space-y-1 pb-2 pl-4">
                  {topic.subTopics.map((subTopic) => (
                    <li key={subTopic.slug}>
                      <Link
                        href={`/marketplace/faqs/${topic.slug}?faq=${subTopic.slug}`}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm no-underline",
                          subTopic.slug === activeFaqSlug
                            ? "bg-linear-to-r from-[#0097b2] to-[#7ed957] font-semibold text-white"
                            : "text-[#243b53] hover:bg-[#f3f4f6]",
                        )}
                      >
                        {subTopic.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
