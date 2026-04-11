"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Mail,
  MessageCircleMore,
  PhoneCall,
  X,
} from "lucide-react";

export default function SupportPage() {
  const router = useRouter();

  const closeDrawer = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/marketplace");
  }, [router]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [closeDrawer]);

  return (
    <div
      className="fixed inset-0 z-120 flex items-center justify-center bg-black/40 p-4"
      onClick={closeDrawer}
    >
      <section
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-end border-b border-[#e5e7eb] px-4 py-3">
          <button
            type="button"
            aria-label="Close support drawer"
            onClick={closeDrawer}
            className="rounded-md p-2 text-[#4f5b66] hover:bg-gray-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-7 pb-8">
          <div className="flex items-start justify-between border-b border-[#e5e7eb] py-5">
            <div className="flex items-start gap-4">
              <PhoneCall className="mt-1 size-10 text-[#3f3f46]" />
              <div>
                <p className="text-base font-medium leading-tight text-[#222]">
                  Call Us
                </p>
                <a
                  href="tel:07554304201"
                  className="text-lg font-medium no-underline hover:underline"
                >
                  09771622333
                </a>
              </div>
            </div>
            <p className="pt-2 text-sm text-[#777]">Mon - Sat, 10am - 7pm</p>
          </div>

          <div className="flex items-start gap-4 border-b border-[#e5e7eb] py-5">
            <Mail className="mt-1 size-10 text-[#3f3f46]" />
            <div>
              <p className="text-base font-medium leading-tight text-[#222]">
                Email
              </p>
              <a
                href="mailto:support@roposoclout.com"
                className="text-lg font-medium no-underline hover:underline"
              >
                support@unicsi.com
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <MessageCircleMore className="size-10 text-[#3f3f46]" />
              <p className="text-lg font-medium">Raise Issue</p>
            </div>
            <a
              href="mailto:support@roposoclout.com?subject=Support%20Issue"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Raise support issue"
              className="rounded-md p-2 text-[#4f5b66] hover:bg-gray-100"
            >
              <ExternalLink className="size-7" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
