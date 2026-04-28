"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Menu, Sparkles } from "lucide-react"
import { useBusiness } from "@/context/BusinessContext"

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { businessName } = useBusiness()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-sidebar border-b border-sidebar-border md:hidden sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-sidebar-primary">
              <Sparkles className="w-3.5 h-3.5 text-sidebar-primary-foreground fill-sidebar-primary-foreground/30" />
            </div>
            <span className="font-semibold text-sidebar-foreground text-sm tracking-wide" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>
              {businessName}
            </span>
          </div>
        </div>

        <main className="flex-1 overflow-auto premium-main">{children}</main>
      </div>
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutInner>{children}</DashboardLayoutInner>
}
