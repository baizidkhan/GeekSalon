"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { UnlinkedFingerprintModal } from "./unlinked-fingerprint-modal"
import { Menu, Sparkles } from "lucide-react"
import { useBusiness } from "@/context/BusinessContext"

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { businessName } = useBusiness()

  return (
    <>
      <style>{`
        /* 1. Global Admin Theme Colors */
        body:has(.admin-root) {
          --primary: oklch(0.6 0.155 258.8); /* #3b82f6 */
          --primary-foreground: oklch(1 0 0);
          --card: oklch(1 0 0);
          --border: oklch(0.92 0.01 260);
          --background: oklch(0.975 0.005 258);
          --ring: oklch(0.6 0.155 258.8);
        }

        /* 2. Fix Input Focus Rings in Admin */
        body:has(.admin-root) input:focus-visible,
        body:has(.admin-root) select:focus-visible,
        body:has(.admin-root) textarea:focus-visible {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 1px #3b82f6 !important;
        }

        /* 3. Safe Scoped Modal Styling for Admin Modals ONLY */
        body:has(.admin-root) [data-slot="dialog-content"]:not([data-public-modal="true"]) {
          border: 1px solid var(--border) !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
          max-height: 85vh;
          overflow-y: auto;
          padding-bottom: 0 !important;
          display: flex;
          flex-direction: column;
        }

        /* Scrollbar */
        body:has(.admin-root) [data-slot="dialog-content"]:not([data-public-modal="true"])::-webkit-scrollbar {
          width: 6px;
        }
        body:has(.admin-root) [data-slot="dialog-content"]:not([data-public-modal="true"])::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 9999px;
        }

        /* Modal Typography */
        body:has(.admin-root) [data-slot="dialog-content"]:not([data-public-modal="true"]) [data-slot="dialog-title"] {
          font-size: 18px !important;
          font-weight: 700 !important;
          color: oklch(0.2 0.02 260) !important; /* slate-800 */
        }

        body:has(.admin-root) [data-slot="dialog-content"]:not([data-public-modal="true"]) [data-slot="label"] {
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          color: oklch(0.2 0.02 260) !important;
          margin-bottom: 0.35rem !important;
        }

        /* Custom Close Button */
        body:has(.admin-root) [data-slot="dialog-content"]:not([data-public-modal="true"]) > [data-slot="dialog-close"] {
          top: 1.25rem !important;
          right: 1.25rem !important;
          background-color: #f1f5f9 !important;
          color: #64748b !important;
          border: none !important;
          opacity: 1 !important;
          border-radius: 0.375rem !important;
        }
        body:has(.admin-root) [data-slot="dialog-content"]:not([data-public-modal="true"]) > [data-slot="dialog-close"]:hover {
          background-color: #e2e8f0 !important;
          color: #334155 !important;
        }

        /* Sticky Footer */
        body:has(.admin-root) [data-slot="dialog-content"]:not([data-public-modal="true"]) [data-slot="dialog-footer"] {
          position: sticky;
          bottom: -1.5rem; /* Counteract default p-6 */
          margin-bottom: -1.5rem;
          margin-left: -1.5rem;
          margin-right: -1.5rem;
          padding: 1rem 1.5rem 1.5rem 1.5rem;
          background-color: var(--card);
          border-top: 1px solid var(--border);
          z-index: 20;
          margin-top: auto;
        }

        @media (min-width: 640px) {
          body:has(.admin-root) [data-slot="dialog-content"]:not([data-public-modal="true"]) [data-slot="dialog-footer"] {
            bottom: -1.75rem; /* sm:p-7 */
            margin-bottom: -1.75rem;
            margin-left: -1.75rem;
            margin-right: -1.75rem;
            padding: 1rem 1.75rem 1.75rem 1.75rem;
          }
        }

        body:has(.admin-root) [data-slot="dialog-content"]:not([data-public-modal="true"]) [data-slot="dialog-footer"] button {
          width: 100%;
          padding-top: 0.875rem !important;
          padding-bottom: 0.875rem !important;
          height: auto !important;
          font-weight: 600 !important;
          margin-bottom: 0.5rem; /* Additional bottom margin */
        }
      `}</style>
      <UnlinkedFingerprintModal />
      <div className="admin-root flex min-h-screen bg-[var(--background)]">
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
              <span className="font-semibold text-sidebar-foreground text-sm tracking-wide">
                {businessName}
              </span>
            </div>
          </div>

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutInner>{children}</DashboardLayoutInner>
}
