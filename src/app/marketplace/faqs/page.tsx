import Link from "next/link";
import { faqTopics } from "@/data/faqs";

export default function FaqTopicsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <h1 className="mb-8 text-2xl font-bold text-black">FAQ Topics</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {faqTopics.map((topic) => (
          <article
            key={topic.slug}
            className="overflow-hidden rounded-md border border-[#dddddd] bg-[#f8f8f8]"
          >
            <header className="flex items-center justify-center gap-4 bg-linear-to-r from-[#0097b2] to-[#7ed957] px-5 py-4">
              {/* <Megaphone className="size-7 text-white" /> */}
              <h2 className="text-base font-semibold leading-tight text-white ">
                {topic.title}
              </h2>
            </header>

            <ul className="space-y-3 px-7 py-5 text-lg text-[#2f3f4f]">
              {topic.subTopics.map((subTopic) => (
                <li key={subTopic.slug} className="list-disc">
                  <Link
                    href={`/marketplace/faqs/${topic.slug}?faq=${subTopic.slug}`}
                    className="no-underline transition-colors hover:underline text-sm"
                  >
                    {subTopic.title}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
