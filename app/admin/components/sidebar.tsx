"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Users,
  CreditCard,
  Scissors,
  UserCheck,
  Package,
  BarChart3,
  UserCog,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Fingerprint,
  LogOut,
  MessageSquare,
  Sparkles,
  UserLock,
  Quote,
  X,
  BrainCircuit,
} from "lucide-react"
import { useState } from "react"
import { logout } from "@admin/api/auth/auth"
import { useAuth } from "@admin/hooks/use-auth"
import { hasPermission } from "@admin/lib/auth-utils"
import { useBusiness } from "@/context/BusinessContext"

const navigation = [
  {
    title: "CORE OPERATIONS",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "dashboard" },
      { name: "Appointments", href: "/admin/appointments", icon: Calendar, permission: "appointments" },
      { name: "Clients", href: "/admin/clients", icon: Users, permission: "clients" },
      { name: "Billing / POS", href: "/admin/billing", icon: CreditCard, permission: "invoice" },
      { name: "Report and Analysis", href: "/admin/reports", icon: BarChart3, permission: "reports" },
    ],
  },
  {
    title: "SERVICE & STAFF",
    items: [
      { name: "Services", href: "/admin/services", icon: Scissors, permission: "service" },
      { name: "Employees", href: "/admin/employees", icon: UserCheck, permission: "employee" },
    ],
  },
  {
    title: "BUSINESS OPERATIONS",
    items: [
      { name: "Inventory", href: "/admin/inventory", icon: Package, permission: "inventory" },
      { name: "Staff Reports", href: "/admin/staff-reports", icon: UserCog, permission: "reports" },
      { name: "Manage Packages", href: "/admin/manage-packages", icon: Sparkles, permission: "makeover-packages" },
      { name: "Testimonials", href: "/admin/testimonials", icon: Quote, permission: "testimonial" },
    ],
  },
  {
    title: "HR & INTERNAL",
    items: [
      { name: "Attendance", href: "/admin/attendance", icon: ClipboardCheck, permission: "attendance" },
      { name: "Unlinked Users", href: "/admin/unlinked-users", icon: Fingerprint, permission: "employee" },
      { name: "Leave Requests", href: "/admin/leave-request", icon: Calendar, permission: "leave-request" },
      { name: "Manage Payrolls", href: "/admin/manage-payrolls", icon: Building2, permission: "hr-payroll" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      // { name: "AI Knowledge Base", href: "/admin/ai-knowledge", icon: BrainCircuit, permission: "settings" },
      { name: "Roles & Permissions", href: "/admin/roles-permissions", icon: UserLock, permission: "user-management" },
      { name: "Settings", href: "/admin/settings", icon: Settings, permission: "settings" },
      { name: "Update Password", href: "/admin/update-password", icon: UserLock, permission: "update-password" },
    ],
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const { user, loading } = useAuth()
  const { businessName } = useBusiness()

  const clearAccessTokenCookie = () => {
    document.cookie = "accessToken=; path=/; max-age=0; samesite=strict"
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout API call failed:', err)
      // ignore errors — redirect regardless
    }
    localStorage.removeItem('accessToken')
    clearAccessTokenCookie()
    // Use full page navigation to ensure auth state resets
    window.location.href = "/admin/login"
  }

  const handleNavClick = () => {
    onClose()
  }

  // Wait for user to load before attempting logout
  const handleLogoutClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await handleLogout()
    } catch (err) {
      console.error('Logout failed:', err)
      window.location.href = "/admin/login"
    }
  }

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-slate-200 z-50",
        "transition-[width] duration-300 ease-in-out",
        "fixed top-0 left-0 h-full md:sticky md:top-0 md:min-h-screen md:max-h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        collapsed ? "md:w-16 w-64" : "w-[260px]"
      )}
    >
      {/* Logo — expanded */}
      {!collapsed && (
        <div className="flex items-center shrink-0 h-16 border-b border-slate-100 px-3 gap-3">
          <div className="flex items-center justify-center shrink-0">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V7M4 7L12 3L20 7M4 7H20" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 21V12H15V21" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-blue-500 text-[15px] leading-tight tracking-wide whitespace-nowrap">
              {businessName || "Salonbos"}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Business os</p>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-500 text-slate-400 transition-all duration-200 hover:scale-110 shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="md:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Logo — collapsed */}
      {collapsed && (
        <div className="flex items-center justify-center shrink-0 h-16 border-b border-slate-100 w-full">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-500 text-slate-400 transition-all duration-200 hover:scale-110"
            title="Expand sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="md:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-3 space-y-5 transition-all duration-300 ease-in-out",
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        collapsed ? "px-2" : "px-3"
      )}>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                <div className="space-y-1">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-8 bg-slate-50 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          navigation.map((section) => {
            const visibleItems = section.items.filter(item =>
              hasPermission(user, item.permission)
            )

            if (visibleItems.length === 0) return null

            return (
              <div key={section.title}>
                {/* Section label */}
                <div className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  collapsed ? "h-0 opacity-0" : "h-5 opacity-100 mb-1"
                )}>
                  <p className="text-[10px] font-bold text-slate-400 px-2 tracking-widest uppercase whitespace-nowrap">
                    {section.title}
                  </p>
                </div>

                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = item.href === "/admin"
                      ? pathname === "/admin" || pathname === "/admin/dashboard"
                      : pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={handleNavClick}
                          title={collapsed ? item.name : undefined}
                          className={cn(
                            "flex items-center rounded-lg text-[13px] font-medium transition-all duration-150 relative group",
                            collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2",
                            isActive
                              ? "bg-blue-50 text-blue-500"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          )}
                        >
                          {/* Active bar — only when expanded */}
                          {isActive && !collapsed && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-blue-500 rounded-r-full" />
                          )}

                          {/* Icon — slightly larger + blue dot indicator when collapsed+active */}
                          <div className="relative shrink-0">
                            <item.icon className={cn(
                              "transition-all duration-150",
                              collapsed ? "w-5 h-5" : "w-4 h-4",
                              isActive ? "text-blue-500" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            {isActive && collapsed && (
                              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                            )}
                          </div>

                          {/* Label */}
                          <span className={cn(
                            "truncate transition-all duration-300 ease-in-out whitespace-nowrap",
                            collapsed ? "w-0 opacity-0 overflow-hidden" : "opacity-100"
                          )}>
                            {item.name}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })
        )}
      </nav>

      {/* Footer User Info & Logout */}
      {user && (
        <div className="border-t border-slate-100 transition-all duration-300 ease-in-out">
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300 ease-in-out",
            collapsed ? "justify-center p-3" : "p-4"
          )}>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <span className="text-slate-400 text-sm font-medium uppercase">
                {user.useremail.charAt(0)}
              </span>
            </div>
            <div className={cn(
              "flex-1 min-w-0 transition-all duration-300 ease-in-out",
              collapsed ? "w-0 opacity-0 overflow-hidden" : "opacity-100"
            )}>
              <p className="text-[13px] font-bold text-slate-800 truncate leading-none mb-1 capitalize whitespace-nowrap">
                {(user as any).name || (user as any).username || user.useremail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ')}
              </p>
              <p className="text-[11px] text-slate-400 truncate leading-none whitespace-nowrap">{user.useremail}</p>
            </div>
            <button
              onClick={handleLogoutClick}
              className="p-2 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
