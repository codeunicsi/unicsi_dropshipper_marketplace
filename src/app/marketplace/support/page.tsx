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
      className="fixed inset-0 z-120 flex items-center justify-center bg-black/40 p-4 sm:p-6"
      onClick={closeDrawer}
    >
      <section
        className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-end border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            aria-label="Close support drawer"
            onClick={closeDrawer}
            className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[88vh] overflow-y-auto px-4 pb-6 sm:px-6 sm:pb-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 sm:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-slate-900">
                  Call Us
                </p>
                <a
                  href="tel:07554304201"
                  className="mt-1 block truncate text-lg font-semibold text-slate-800 no-underline hover:underline"
                >
                  09771622333
                </a>
              </div>
            </div>
            <p className="text-sm text-slate-600">Mon - Sat, 10am - 7pm</p>
          </div>

          <div className="flex flex-col gap-4 border-b border-slate-200 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 sm:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Mail className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-slate-900">Email</p>
                <a
                  href="mailto:support@unicsi.com"
                  className="mt-1 block truncate text-lg font-semibold text-slate-800 no-underline hover:underline"
                >
                  support@unicsi.com
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 sm:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <MessageCircleMore className="w-6 h-6" />
              </div>
              <p className="text-base font-semibold text-slate-900">
                Raise Issue
              </p>
            </div>
            <a
              href="mailto:support@roposoclout.com?subject=Support%20Issue"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Raise support issue"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-slate-700 transition hover:bg-slate-100 sm:w-auto"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
