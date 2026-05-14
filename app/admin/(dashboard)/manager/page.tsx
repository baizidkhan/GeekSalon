"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, CalendarDays, DollarSign, Package, Users } from "lucide-react"
import { useAuth } from "@admin/hooks/use-auth"
import { hasPermission } from "@admin/lib/auth-utils"
import { getDashboardStats } from "@admin/api/dashboard/dashboard"

export default function ManagerDashboardPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState<Record<string, any> | null>(null)
    const [statsLoading, setStatsLoading] = useState(true)

    useEffect(() => {
        if (!loading && !hasPermission(user, "manager-dashboard")) {
            router.replace("/admin")
        }
    }, [loading, user, router])

    useEffect(() => {
        const load = async () => {
            try {
                setStatsLoading(true)
                const data = await getDashboardStats()
                setStats(data)
            } catch {
                setStats(null)
            } finally {
                setStatsLoading(false)
            }
        }

        if (!loading && user?.role === "storeManager") {
            void load()
        }
    }, [loading, user?.role])

    const todayLabel = useMemo(
        () =>
            new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            }).format(new Date()),
        [],
    )

    if (loading || !hasPermission(user, "manager-dashboard")) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f7f9fc] p-5 lg:p-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-5">
                <p className="text-xs tracking-[0.18em] uppercase text-slate-500">Manager Panel</p>
                <h1 className="text-[30px] font-bold text-slate-900 mt-1">Manager Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">{todayLabel}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                <Card title="Revenue (Week)" value={statsLoading ? "—" : String(stats?.weeklyRevenue ?? 0)} icon={<DollarSign className="w-4 h-4" />} />
                <Card title="Today Appointments" value={statsLoading ? "—" : String(stats?.todaysAppointmentsCount ?? 0)} icon={<CalendarDays className="w-4 h-4" />} />
                <Card title="Active Clients" value={statsLoading ? "—" : String(stats?.totalClientsThisWeek ?? 0)} icon={<Users className="w-4 h-4" />} />
                <Card title="Low Stock" value={statsLoading ? "—" : String(stats?.lowStockItemsCount ?? 0)} icon={<Package className="w-4 h-4" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <QuickLink href="/admin/appointments" label="Appointments" icon={<CalendarDays className="w-4 h-4" />} />
                <QuickLink href="/admin/reports" label="Reports & Analysis" icon={<BarChart3 className="w-4 h-4" />} />
                <QuickLink href="/admin/manage-payrolls" label="Manage Payrolls" icon={<Users className="w-4 h-4" />} />
            </div>
        </div>
    )
}

function Card({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{title}</p>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0076E9]">{icon}</span>
            </div>
            <p className="text-4xl font-bold text-slate-900 mt-3">{value}</p>
        </div>
    )
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
    return (
        <Link href={href} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <span className="text-slate-500">{icon}</span>
            {label}
        </Link>
    )
}
