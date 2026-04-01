import type { Metadata } from 'next'
import { DashboardNav } from '@/components/DashboardNav'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <DashboardNav />
      <div className="dashboard-layout__content">
        {children}
      </div>
    </div>
  )
}
