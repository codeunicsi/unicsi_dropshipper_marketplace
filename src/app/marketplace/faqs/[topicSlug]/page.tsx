import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { FaqSection } from "@/components/ui/faqs-accordion";
import { FaqTopicsSidebar } from "@/components/layout/FaqTopicsSidebar";
import {
  faqTopics,
  getFaqSubTopicBySlug,
  getFaqTopicBySlug,
} from "@/data/faqs";

interface FaqTopicDetailPageProps {
  params: Promise<{ topicSlug: string }>;
  searchParams: Promise<{ faq?: string }>;
}

export default async function FaqTopicDetailPage({
  params,
  searchParams,
}: FaqTopicDetailPageProps) {
  const { topicSlug } = await params;
  const { faq } = await searchParams;
  const activeTopic = getFaqTopicBySlug(topicSlug);

  if (!activeTopic) {
    notFound();
  }

  const activeSubTopic =
    getFaqSubTopicBySlug(activeTopic, faq) ?? activeTopic.subTopics[0];

  return (
    <div className="mx-auto max-w-425 px-4 py-8 md:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
        <FaqTopicsSidebar topics={faqTopics} activeFaqSlug={faq} />

        <section className=" p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[#4b5563]">
            <Link
              href="/marketplace/faqs"
              className="no-underline hover:text-black"
            >
              FAQs
            </Link>
            <ChevronRight className="size-3" />
            <span>{activeTopic.title}</span>
            {activeSubTopic?.title && (
              <>
                <ChevronRight className="size-3" />
                <span>{activeSubTopic.title}</span>
              </>
            )}
          </div>

          <div className="mb-8 border-t border-[#e6e6e6] pt-6">
            <h1 className="text-lg font-extrabold text-black">
              {activeSubTopic?.title || activeTopic.title}
            </h1>
            <p className="mt-2 text-xs font-semibold text-[#6b7280]">
              {activeSubTopic?.faqs.length ?? 0} FAQs
            </p>
          </div>

          <FaqSection
            items={activeSubTopic?.faqs ?? []}
            variant="card"
            showHelpfulActions
            triggerClassName="text-base leading-tight"
            contentClassName="text-sm leading-[1.45]"
          />
        </section>
      </div>
    </div>
  );
}
