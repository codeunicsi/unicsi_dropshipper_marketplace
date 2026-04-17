"use client";

import React from "react";
import { PartnerSidebar } from "./PartnerSidebar";
import { PartnerHeader } from "./PartnerHeader";
import { BottomNav } from "./BottomNav"; // 👈 import BottomNav
import { useUser } from "@/hooks/useAuth";
import { UnicsiLoader } from "../partner/unicsi-loader";

export function PartnerLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  if (isLoading) return <UnicsiLoader />;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <PartnerSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      {/* Overlay (mobile only) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <PartnerHeader onMenuClick={() => setIsMobileOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-6">
          <div className="p-2 sm:p-6">{children}</div>
        </main>
      </div>
      {/* Bottom Nav (mobile only) */}
      <BottomNav onMenuClick={() => setIsMobileOpen(true)} />{" "}
      {/* 👈 add this */}
    </div>
  );
}

//shopify_access_token
// if (!user?.data?.shopify_access_token && !user?.data?.shopify_store_url) {
//   return (
//     <div className="flex h-screen bg-background">
//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
//         <PartnerHeader />

//         {/* Page Content */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-6">{children}</div>
//         </main>
//       </div>
//     </div>
//   );
// }
