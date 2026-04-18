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
  LogOut,
  X,
  Sparkles,
} from "lucide-react"
import { useState } from "react"
import { logout } from "@/api/auth/auth"

const navigation = [
  {
    title: "Core Operations",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Appointments", href: "/appointments", icon: Calendar },
      { name: "Clients", href: "/clients", icon: Users },
      { name: "Billing / POS", href: "/billing", icon: CreditCard },
    ],
  },
  {
    title: "Service & Staff",
    items: [
      { name: "Services", href: "/services", icon: Scissors },
      { name: "Employees", href: "/employees", icon: UserCheck },
    ],
  },
  {
    title: "Business",
    items: [
      { name: "Inventory", href: "/inventory", icon: Package },
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Staff Reports", href: "/staff-reports", icon: UserCog },
    ],
  },
  {
    title: "HR & Internal",
    items: [
      { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
      { name: "HR & Payroll", href: "/hr-payroll", icon: Building2 },
    ],
  },
  {
    title: "System",
    items: [{ name: "Settings", href: "/settings", icon: Settings }],
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

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore errors — redirect regardless
    }
    router.push("/login")
  }

  const handleNavClick = () => {
    onClose()
  }

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50",
        "fixed top-0 left-0 h-full md:sticky md:top-0 md:min-h-screen md:max-h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        collapsed ? "md:w-16 w-64" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 border-b border-sidebar-border shrink-0",
        collapsed ? "p-4 justify-center" : "p-5"
      )}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sidebar-primary shrink-0 shadow-lg shadow-black/20">
          <Sparkles className="w-4 h-4 text-sidebar-primary-foreground fill-sidebar-primary-foreground/30" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sidebar-foreground tracking-wide leading-tight" style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '1rem' }}>
              GeekSalon
            </h1>
            <p className="text-[9px] text-sidebar-foreground/40 tracking-[0.2em] uppercase mt-0.5">
              Salon Management
            </p>
          </div>
        )}
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-5">
        {navigation.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-[9px] font-semibold tracking-[0.22em] text-sidebar-foreground/35 mb-1.5 px-3 uppercase">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                        collapsed && "justify-center",
                        isActive
                          ? "bg-sidebar-primary/14 text-sidebar-primary font-medium"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 shrink-0",
                        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                      )} />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className={cn(
          "flex items-center gap-3 px-5 py-3.5 border-t border-sidebar-border",
          "text-sidebar-foreground/45 hover:text-rose-400 transition-colors shrink-0 cursor-pointer text-sm",
          collapsed && "justify-center px-4"
        )}
        title={collapsed ? "Sign Out" : undefined}
      >
        <LogOut className="w-4 h-4 shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>

      {/* Collapse Button — desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "hidden md:flex items-center gap-3 px-5 py-3.5 border-t border-sidebar-border",
          "text-sidebar-foreground/35 hover:text-sidebar-foreground/65 transition-colors shrink-0 cursor-pointer text-sm",
          collapsed && "justify-center px-4"
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <>
            <ChevronLeft className="w-4 h-4" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </aside>
  )
}
