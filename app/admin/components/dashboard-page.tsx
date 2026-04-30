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
  Wallet,
  Users,
  AlertTriangle,
  Bell,
  Plus
} from "lucide-react"
import { getDashboardStats } from "@admin/api/dashboard/dashboard"
import { useAuth } from "@admin/hooks/use-auth"
import Link from "next/link"

export function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          setStats(data)
        })
        .catch((err: any) => {
          if (err?.response?.status !== 401) {
            setError(err.message || 'Failed to load dashboard data')
          } else {
            setError('Authentication failed')
          }
        })
        .finally(() => setLoading(false))
    }
  }, [authLoading, user])

  const getTrend = (current: any, previous: any) => {
    const cur = parseFloat(String(current || 0))
    const prev = parseFloat(String(previous || 0))
    
    if (!prev || prev === 0) {
      return cur > 0 ? { trend: "100%", trendUp: true } : { trend: "0%", trendUp: true }
    }
    
    const diff = cur - prev
    const percent = Math.abs((diff / prev) * 100).toFixed(0)
    return {
      trend: `${percent}%`,
      trendUp: diff >= 0
    }
  }

  const revenueTrend = getTrend(stats?.weeklyRevenue, stats?.lastWeekRevenue)
  const appointmentTrend = getTrend(stats?.todaysAppointmentsCount, stats?.yesterdaysAppointmentsCount)
  const clientValue = stats?.totalClientsThisWeek ?? 0
  const clientTrend = getTrend(clientValue, stats?.totalClientsLastWeek)

  const onlineCount = stats?.onlineBookingsToday ?? 0
  const walkinCount = stats?.walkInsToday ?? 0
  const callCount = stats?.callBookingsToday ?? 0

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fc]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-blue-500 mb-1">Dashboard</h1>
          <p className="text-[13px] text-slate-500">{today} - Here's your salon today</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/appointments?new=true"
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Appointment
          </Link>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center relative border border-slate-200">
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm">
          Failed to load dashboard data: {error}
        </div>
      )}

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard
          title="Revenue This week"
          value={loading || !stats ? "—" : `TK. ${(stats.weeklyRevenue ?? 0)}`}
          icon={Wallet}
          iconWrapperClassName="bg-blue-50 text-blue-500"
          className="border-t-4 border-t-transparent hover:border-t-blue-500 transition-all"
          subtitle={
            <div className="text-slate-400">
              Last Week Tk. {stats?.lastWeekRevenue ?? '0'}
            </div>
          }
          trend={revenueTrend.trend}
          trendLabel="from last week"
          trendUp={revenueTrend.trendUp}
        />
        
        <StatCard
          title="Today's Appointments"
          value={loading || !stats ? "—" : (stats.todaysAppointmentsCount ?? 0)}
          icon={Calendar}
          iconWrapperClassName="bg-emerald-50 text-emerald-500"
          className="border-t-4 border-t-transparent hover:border-t-emerald-500 transition-all"
          subtitle={
            <div className="text-slate-400 flex flex-wrap gap-x-2.5 gap-y-1">
              <span>Online: {onlineCount}</span>
              <span>Walk-in: {walkinCount}</span>
              <span>Call: {callCount}</span>
            </div>
          }
          trend={appointmentTrend.trend}
          trendLabel="than yesterday"
          trendUp={appointmentTrend.trendUp}
        />

        <StatCard
          title="Total Clients"
          value={loading || !stats ? "—" : clientValue}
          icon={Users}
          iconWrapperClassName="bg-amber-50 text-amber-500"
          className="border-t-4 border-t-transparent hover:border-t-amber-500 transition-all"
          subtitle={
            <div className="text-slate-400">
              Last Week {stats?.totalClientsLastWeek ?? '0'}
            </div>
          }
          trend={clientTrend.trend}
          trendLabel="from last week"
          trendUp={clientTrend.trendUp}
        />

        <StatCard
          title="Stock Alerts"
          value={loading || !stats ? "—" : (stats.lowStockItemsCount ?? 0)}
          icon={AlertTriangle}
          iconWrapperClassName="bg-purple-50 text-purple-500"
          className="border-t-4 border-t-transparent hover:border-t-purple-500 transition-all"
          subtitle="Items Need"
          bottomContent={
            <div className="flex flex-wrap gap-2 mt-2">
              {(stats?.lowStockItems || []).slice(0, 2).map((item: any, i: number) => (
                <div key={item.id || i} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className={`w-2 h-2 rounded-sm ${i === 0 ? 'bg-amber-400' : 'bg-rose-500'}`}></span>
                  {item.name} ({item.stockQty} left)
                </div>
              ))}
              {(!stats?.lowStockItems || stats.lowStockItems.length === 0) && (
                <div className="text-[11px] text-slate-400">No low stock items</div>
              )}
            </div>
          }
        />
      </div>

      {/* Middle Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5 mb-6">
        <RevenueChart
          weeklyData={stats?.revenueTrendWeekly ?? []}
          monthlyData={stats?.revenueTrendMonthly ?? []}
          sixMonthData={stats?.revenueTrendSixMonths ?? []}
          yearlyData={stats?.revenueTrendYearly ?? []}
        />
        
        <AppointmentChart 
          weeklyData={stats?.appointmentTrendWeekly ?? []} 
          monthlyData={stats?.appointmentTrendMonthly ?? []} 
        />
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr] gap-5">
        <TodaysAppointments appointments={stats?.todaysAppointments ?? []} />
        <TopServices services={stats?.topServices ?? []} />
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500 shrink-0" />
                Employee On Duty ({stats?.todaysAttendanceCount ?? 0})
              </h3>
            <Link href="/admin/attendance" className="text-[12px] text-blue-500 hover:underline">View all</Link>
          </div>
          <div className="flex items-center gap-4 mb-4 text-[12px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-sm"></span> {stats?.todaysAttendanceCount ?? 0} Attend</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-rose-500 rounded-sm"></span> {(stats?.activeEmployeesCount ?? 0) - (stats?.todaysAttendanceCount ?? 0)} Absent</span>
          </div>
          
          <div className="mt-4 border-t border-slate-100 pt-2">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="text-slate-800 border-b border-slate-100">
                  <th className="py-2 font-semibold">Name</th>
                  <th className="py-2 font-semibold">Check In</th>
                  <th className="py-2 font-semibold">Check Out</th>
                </tr>
              </thead>
              <tbody>
                {loading || !stats ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">Loading…</td>
                  </tr>
                ) : (stats.todaysAttendance ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">No attendance recorded today</td>
                  </tr>
                ) : (
                  (stats.todaysAttendance as any[]).map((rec, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-2.5 text-slate-700 font-medium">{rec.employeeName}</td>
                      <td className="py-2.5 text-slate-500">
                        {rec.checkInTime
                          ? new Date(rec.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Dhaka" })
                          : "—"}
                      </td>
                      <td className="py-2.5 text-slate-500">
                        {rec.checkOutTime
                          ? new Date(rec.checkOutTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Dhaka" })
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
