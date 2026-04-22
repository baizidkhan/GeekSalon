"use client"

import { useEffect, useState } from "react"
import { StatCard } from "@/components/stat-card"
import { RevenueChart, AppointmentChart } from "@/components/dashboard-charts"
import {
  TodaysAppointments,
  LowStockAlerts,
  TopServices,
} from "@/components/dashboard-widgets"
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
import { getDashboardStats } from "@/api/dashboard/dashboard"

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

export default function DashboardPage() {
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
    getDashboardStats()
      .then(setStats)
      .catch((err: any) => {
        if (err?.response?.status !== 401) {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="premium-page p-4 sm:p-6 md:p-8">
      {/* Header */}
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

      {/* Stats Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Today's Appointments"
          value={loading ? "—" : (stats?.todaysAppointmentsCount ?? 0)}
          subtitle="TODAY"
          icon={Calendar}
          href="/appointments?timeFilter=Today"
        />
        <StatCard
          title="Total Revenue"
          value={loading ? "—" : `৳${(
            revenueFilter === "weekly" ? stats?.weeklyRevenue :
              revenueFilter === "monthly" ? stats?.monthlyRevenue :
                stats?.sixMonthRevenue ?? 0
          ).toLocaleString()}`}
          subtitle="WEEK"
          icon={TrendingUp}
          filterOptions={revenueFilterOptions}
          filterValue={revenueFilter}
          onFilterChange={setRevenueFilter}
        />
        <StatCard
          title="Total Clients"
          value={loading ? "—" : (
            clientsFilter === "monthly" ? stats?.totalClientsThisMonth :
              clientsFilter === "6months" ? stats?.totalClientsSixMonths :
                stats?.totalClientsThisYear ?? 0
          )}
          subtitle="MONTH"
          icon={Users}
          filterOptions={clientsFilterOptions}
          filterValue={clientsFilter}
          onFilterChange={setClientsFilter}
        />
        <StatCard
          title="Services"
          value={loading ? "—" : (stats?.activeServicesCount ?? 0)}
          subtitle="ACTIVE"
          icon={Layers}
        />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Online Bookings"
          value={loading ? "—" : (
            onlineFilter === "monthly" ? stats?.onlineBookingsThisMonth :
              onlineFilter === "6months" ? stats?.onlineBookingsSixMonths :
                stats?.onlineBookingsThisYear ?? 0
          )}
          subtitle="MONTH"
          icon={Clock}
          filterOptions={clientsFilterOptions}
          filterValue={onlineFilter}
          onFilterChange={setOnlineFilter}
        />
        <StatCard
          title="Walk-ins"
          value={loading ? "—" : (
            walkInFilter === "monthly" ? stats?.walkInsThisMonth :
              walkInFilter === "6months" ? stats?.walkInsSixMonths :
                stats?.walkInsThisYear ?? 0
          )}
          subtitle="MONTH"
          icon={Footprints}
          filterOptions={clientsFilterOptions}
          filterValue={walkInFilter}
          onFilterChange={setWalkInFilter}
        />
        <StatCard
          title="Employees"
          value={loading ? "—" : `${stats?.todaysAttendanceCount ?? 0}/${stats?.activeEmployeesCount ?? 0}`}
          subtitle="ATTENDANCE"
          icon={UserCheck}
        />
        <StatCard
          title="Low Stock Items"
          value={loading ? "—" : (stats?.lowStockItemsCount ?? 0)}
          subtitle="ALERT"
          icon={AlertTriangle}
          iconClassName="text-amber-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <RevenueChart
          weeklyData={stats?.revenueTrendWeekly ?? []}
          monthlyData={stats?.revenueTrendMonthly ?? []}
          sixMonthData={stats?.revenueTrendSixMonths ?? []}
          yearlyData={stats?.revenueTrendYearly ?? []}
        />
        <AppointmentChart weeklyData={stats?.appointmentTrendWeekly ?? []} monthlyData={stats?.appointmentTrendMonthly ?? []} />
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TodaysAppointments appointments={stats?.todaysAppointments ?? []} />
        <LowStockAlerts items={stats?.lowStockItems ?? []} />
        <TopServices services={stats?.topServices ?? []} />
      </div>
    </div>
  )
}
