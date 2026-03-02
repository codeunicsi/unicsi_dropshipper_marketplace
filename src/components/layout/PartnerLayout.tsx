'use client'

import React from "react"
import { PartnerSidebar } from './PartnerSidebar'
import { PartnerHeader } from './PartnerHeader'
import { useUser } from '@/hooks/useAuth'
import { UnicsiLoader } from '../partner/unicsi-loader'

export function PartnerLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser();

  console.log("user-data==>123", user);

  if(isLoading) return (
     <UnicsiLoader />
  )

  //shopify_access_token
  if(!user?.data?.shopify_access_token && !user?.data?.shopify_store_url){
    return (
      <div className="flex h-screen bg-background">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <PartnerHeader />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    )
  }


  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
       <PartnerSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <PartnerHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
