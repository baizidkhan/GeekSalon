"use client"

import { useAuth } from "@admin/hooks/use-auth"
import { hasPermission, User } from "@admin/lib/auth-utils"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

const pathPermissionMap: Record<string, string> = {
  "/admin/dashboard": "dashboard",
  "/admin/appointments": "appointments",
  "/admin/clients": "clients",
  "/admin/billing": "invoice",
  "/admin/services": "service",
  "/admin/employee-account": "user-management",
  "/admin/employees": "employee",
  "/admin/inventory": "inventory",
  "/admin/reports": "reports",
  "/admin/staff-reports": "reports",
  "/admin/attendance": "attendance",
  "/admin/leave-request": "leave-request",
  "/admin/manage-payrolls": "hr-payroll",
  "/admin/settings": "settings",
}

export function AuthGuard({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode, 
  initialUser?: User | null 
}) {
  const { user: clientUser, loading } = useAuth()
  // Use server user initially, then sync with client user
  const [user, setUser] = useState<User | null>(initialUser || null)
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (clientUser) {
      setUser(clientUser)
    }
  }, [clientUser])

  useEffect(() => {
    if (mounted && !loading) {
      console.log(`AuthGuard [${pathname}]: User:`, user ? user.useremail : 'None')
      if (!user && pathname !== "/admin/login") {
        console.log('No user found, redirecting to login...')
        router.replace("/admin/login")
      }
    }
  }, [user, loading, pathname, router, mounted])

  // Fix hydration mismatch by only rendering after mount
  if (!mounted) return null

  if (loading && !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-1 text-center">
            <h3 className="text-lg font-medium text-foreground tracking-tight">GeekSalon</h3>
            <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase">Authenticating...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user && pathname !== "/admin/login") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Secure Session Required</p>
          <button 
            onClick={() => router.push('/admin/login')}
            className="text-xs py-2 px-4 bg-primary text-primary-foreground rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // If on login page, just show children
  if (pathname === "/admin/login") return children

  const permission = pathPermissionMap[pathname]
  if (permission && pathname !== "/admin/dashboard" && !hasPermission(user, permission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-background text-foreground">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
          <div className="w-8 h-8 rounded-full border-2 border-destructive flex items-center justify-center font-bold text-destructive">!</div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Restricted Access</h2>
        <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
          Your current account doesn't have the necessary permissions to view the <strong>{pathname.substring(1)}</strong> module.
          Please contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  return <>{children}</>
}
