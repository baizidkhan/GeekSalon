"use client"

import { useState, useEffect } from "react"
import { TrendingUp, CalendarDays } from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface RevenueTrendPoint {
  label: string
  revenue: number
}

interface AppointmentTrendPoint {
  label: string
  appointments: number
}

interface RevenueChartProps {
  weeklyData: RevenueTrendPoint[]
  monthlyData: RevenueTrendPoint[]
  sixMonthData: RevenueTrendPoint[]
  yearlyData: RevenueTrendPoint[]
}

interface AppointmentChartProps {
  weeklyData: AppointmentTrendPoint[]
  monthlyData: AppointmentTrendPoint[]
}

const tooltipStyle = {
  backgroundColor: "white",
  border: "1px solid oklch(0.908 0.013 24)",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "0 4px 16px oklch(0.18 0.022 18 / 0.08)",
}

export function RevenueChart({ weeklyData, monthlyData, sixMonthData, yearlyData }: RevenueChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const [filter, setFilter] = useState<"weekly" | "monthly" | "6months" | "yearly">("weekly")
  
  if (!mounted) return <div className="h-60" />

  const selectedData =
    filter === "weekly"
      ? weeklyData
      : filter === "monthly"
        ? monthlyData
        : filter === "6months"
          ? sixMonthData
          : yearlyData

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
          Revenue Trend
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="text-[12px] text-slate-500 border border-slate-200 rounded-md px-2 py-1 bg-transparent focus:outline-none"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="6months">6 Months</option>
          <option value="yearly">1 Year</option>
        </select>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={selectedData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              interval={0}
              height={filter === "monthly" ? 48 : 30}
              tick={
                (filter === "monthly"
                  ? { fontSize: 9, fill: "#94a3b8", angle: -45, textAnchor: "end" }
                  : { fontSize: 11, fill: "#94a3b8" }) as any
              }
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`৳${(value || 0).toLocaleString()}`, "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revenueGradient)" dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "white" }} activeDot={{ r: 6, fill: "#3b82f6" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function AppointmentChart({ weeklyData, monthlyData }: AppointmentChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const [filter, setFilter] = useState<"weekly" | "monthly">("weekly")

  if (!mounted) return <div className="h-60" />

  const data = filter === "weekly" ? weeklyData : monthlyData

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-blue-500 shrink-0" />
          Appointment Trends
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="text-[12px] text-slate-500 border border-slate-200 rounded-md px-2 py-1 bg-transparent focus:outline-none"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={filter === "weekly" ? 28 : 8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              interval={0}
              height={filter === "monthly" ? 48 : 30}
              tick={
                (filter === "monthly"
                  ? { fontSize: 9, fill: "#94a3b8", angle: -45, textAnchor: "end" }
                  : { fontSize: 11, fill: "#94a3b8" }) as any
              }
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value, "Appointments"]} />
            <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
