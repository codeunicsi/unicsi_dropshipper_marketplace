'use client'

import React, { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
        />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="min-w-0 max-w-full p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
