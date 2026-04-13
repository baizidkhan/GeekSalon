"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"
import { useState } from "react"

const navigation = [
  {
    title: "CORE OPERATIONS",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Appointments", href: "/appointments", icon: Calendar },
      { name: "Clients", href: "/clients", icon: Users },
      { name: "Billing / POS", href: "/billing", icon: CreditCard },
    ],
  },
  {
    title: "SERVICE & STAFF",
    items: [
      { name: "Services", href: "/services", icon: Scissors },
      { name: "Employees", href: "/employees", icon: UserCheck },
    ],
  },
  {
    title: "BUSINESS OPERATIONS",
    items: [
      { name: "Inventory", href: "/inventory", icon: Package },
      { name: "Report and Analysis", href: "/reports", icon: BarChart3 },
      { name: "Staff Reports", href: "/staff-reports", icon: UserCog },
    ],
  },
  {
    title: "HR & INTERNAL",
    items: [{ name: "HR & Payroll", href: "/hr-payroll", icon: Building2 }],
  },
  {
    title: "SYSTEM",
    items: [{ name: "Settings", href: "/settings", icon: Settings }],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
          <Scissors className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-semibold text-foreground">SalonBOS</h1>
            <p className="text-xs text-muted-foreground">BUSINESS OS</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {navigation.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-xs font-medium text-muted-foreground mb-2 px-3">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-3 p-4 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <>
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Collapse</span>
          </>
        )}
      </button>
    </aside>
  )
}
