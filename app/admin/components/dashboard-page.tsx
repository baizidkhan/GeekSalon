"use client"

import { useEffect, useState } from "react"
import { StatCard } from "@admin/components/stat-card"
import { RevenueChart, AppointmentChart } from "@admin/components/dashboard-charts"
import {
  TodaysAppointments,
  LowStockAlerts,
  TopServices,
} from "@admin/components/dashboard-widgets"
import {
  Calendar,
  TrendingUp,
  Users,
  Layers,
  Clock,
  Footprints,
  UserCheck,
  AlertTriangle,
} from "lucide-react"
import { getDashboardStats } from "@admin/api/dashboard/dashboard"
import { useAuth } from "@admin/hooks/use-auth"

const revenueFilterOptions = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "6 Months", value: "6months" },
]

const clientsFilterOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "6 Months", value: "6months" },
  { label: "1 Year", value: "yearly" },
]

export function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revenueFilter, setRevenueFilter] = useState("weekly")
  const [clientsFilter, setClientsFilter] = useState("monthly")
  const [onlineFilter, setOnlineFilter] = useState("monthly")
  const [walkInFilter, setWalkInFilter] = useState("monthly")

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  useEffect(() => {
    if (!authLoading && user) {
      getDashboardStats()
        .then((data) => {
          console.log('Dashboard stats loaded:', data)
          setStats(data)
        })
        .catch((err: any) => {
          console.error('Dashboard API error:', err)
          if (err?.response?.status !== 401) {
            setError(err.message || 'Failed to load dashboard data')
          } else {
            setError('Authentication failed')
          }
        })
        .finally(() => setLoading(false))
    }
  }, [authLoading, user])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="premium-page p-4 sm:p-6 md:p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary/70 uppercase mb-1">Overview</p>
          <h1 className="text-3xl font-semibold text-foreground leading-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/8 rounded-full border border-primary/15">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-primary/80">Live</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          Failed to load dashboard data: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Today's Appointments"
          value={loading || !stats ? "—" : (stats.todaysAppointmentsCount ?? 0)}
          subtitle="TODAY"
          icon={Calendar}
          href="/appointments?timeFilter=Today"
        />
        <StatCard
          title="Total Revenue"
          value={loading || !stats ? "—" : `৳${(
            revenueFilter === "weekly" ? (stats.weeklyRevenue ?? 0) :
              revenueFilter === "monthly" ? (stats.monthlyRevenue ?? 0) :
                (stats.sixMonthRevenue ?? 0)
          ).toLocaleString()}`}
          subtitle="WEEK"
          icon={TrendingUp}
          filterOptions={revenueFilterOptions}
          filterValue={revenueFilter}
          onFilterChange={setRevenueFilter}
        />
        <StatCard
          title="Total Clients"
          value={loading || !stats ? "—" : (
            clientsFilter === "monthly" ? (stats.totalClientsThisMonth ?? 0) :
              clientsFilter === "6months" ? (stats.totalClientsSixMonths ?? 0) :
                (stats.totalClientsThisYear ?? 0)
          )}
          subtitle="MONTH"
          icon={Users}
          filterOptions={clientsFilterOptions}
          filterValue={clientsFilter}
          onFilterChange={setClientsFilter}
        />
        <StatCard
          title="Services"
          value={loading || !stats ? "—" : (stats.activeServicesCount ?? 0)}
          subtitle="ACTIVE"
          icon={Layers}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Online Bookings"
          value={loading || !stats ? "—" : (
            onlineFilter === "monthly" ? (stats.onlineBookingsThisMonth ?? 0) :
              onlineFilter === "6months" ? (stats.onlineBookingsSixMonths ?? 0) :
                (stats.onlineBookingsThisYear ?? 0)
          )}
          subtitle="MONTH"
          icon={Clock}
          filterOptions={clientsFilterOptions}
          filterValue={onlineFilter}
          onFilterChange={setOnlineFilter}
        />
        <StatCard
          title="Walk-ins"
          value={loading || !stats ? "—" : (
            walkInFilter === "monthly" ? (stats.walkInsThisMonth ?? 0) :
              walkInFilter === "6months" ? (stats.walkInsSixMonths ?? 0) :
                (stats.walkInsThisYear ?? 0)
          )}
          subtitle="MONTH"
          icon={Footprints}
          filterOptions={clientsFilterOptions}
          filterValue={walkInFilter}
          onFilterChange={setWalkInFilter}
        />
        <StatCard
          title="Employees"
          value={loading || !stats ? "—" : `${stats.todaysAttendanceCount ?? 0}/${stats.activeEmployeesCount ?? 0}`}
          subtitle="ATTENDANCE"
          icon={UserCheck}
        />
        <StatCard
          title="Low Stock Items"
          value={loading || !stats ? "—" : (stats.lowStockItemsCount ?? 0)}
          subtitle="ALERT"
          icon={AlertTriangle}
          iconClassName="text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <RevenueChart
          weeklyData={stats?.revenueTrendWeekly ?? []}
          monthlyData={stats?.revenueTrendMonthly ?? []}
          sixMonthData={stats?.revenueTrendSixMonths ?? []}
          yearlyData={stats?.revenueTrendYearly ?? []}
        />
        <AppointmentChart weeklyData={stats?.appointmentTrendWeekly ?? []} monthlyData={stats?.appointmentTrendMonthly ?? []} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TodaysAppointments appointments={stats?.todaysAppointments ?? []} />
        <LowStockAlerts items={stats?.lowStockItems ?? []} />
        <TopServices services={stats?.topServices ?? []} />
      </div>
    </div>
  )
}
