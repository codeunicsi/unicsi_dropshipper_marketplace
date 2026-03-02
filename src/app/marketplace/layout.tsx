import React from "react"
import type { Metadata } from 'next'
import { PartnerLayout } from '@/components/layout/PartnerLayout'
export const metadata: Metadata = {
  title: 'Partner Dashboard - UNICSI',
  description: 'Partner Panel for UNICSI Marketplace',
}

export default function PartnerRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PartnerLayout>{children}</PartnerLayout>
}
