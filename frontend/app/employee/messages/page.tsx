'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { NavigationDrawer } from '@/components/layout/NavigationDrawer'
import { TopAppBar } from '@/components/layout/TopAppBar'
import { MessagesContent } from './MessagesContent'

export default function EmployeeMessagesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <ProtectedRoute requiredRole="employee" redirectTo="/customer/dashboard">
      <div className="flex h-dvh overflow-hidden bg-slate-50">
        <NavigationDrawer isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopAppBar
            onMenuClick={() => setIsMobileMenuOpen(true)}
            title="Messages"
          />

          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-slate-500">
                Loading messages...
              </div>
            }
          >
            <MessagesContent />
          </Suspense>
        </div>
      </div>
    </ProtectedRoute>
  )
}
