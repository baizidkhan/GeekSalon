"use client"

import { useState } from "react"
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
import { TrendingUp, Calendar, ChevronDown } from "lucide-react"

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
  const [filter, setFilter] = useState<"weekly" | "monthly" | "6months" | "yearly">("weekly")
  const selectedData =
    filter === "weekly"
      ? weeklyData
      : filter === "monthly"
        ? monthlyData
        : filter === "6months"
          ? sixMonthData
          : yearlyData
  const subtitle =
    filter === "weekly"
      ? "Last 7 days"
      : filter === "monthly"
        ? "Last 30 days"
        : filter === "6months"
          ? "Last 6 months"
          : "This year"

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground text-sm">Revenue Trend</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "weekly" | "monthly" | "6months" | "yearly")}
            className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground/70 uppercase bg-muted pl-2 pr-5 py-1 rounded-full border border-border/60 cursor-pointer appearance-none focus:outline-none"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="6months">6 Months</option>
            <option value="yearly">1 Year</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-muted-foreground/70 pointer-events-none" />
        </div>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={selectedData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.48 0.16 8)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="oklch(0.48 0.16 8)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.93 0.01 24)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              interval={0}
              height={filter === "monthly" ? 48 : 30}
              tick={
                filter === "monthly"
                  ? { fontSize: 9, fill: "oklch(0.50 0.022 20)", angle: -45, textAnchor: "end" }
                  : { fontSize: 11, fill: "oklch(0.50 0.022 20)" }
              }
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "oklch(0.50 0.022 20)" }} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`৳${value.toLocaleString()}`, "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="oklch(0.48 0.16 8)" strokeWidth={2.5} fill="url(#revenueGradient)" dot={false} activeDot={{ r: 4, fill: "oklch(0.48 0.16 8)" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function AppointmentChart({ weeklyData, monthlyData }: AppointmentChartProps) {
  const [filter, setFilter] = useState<"weekly" | "monthly">("weekly")
  const data = filter === "weekly" ? weeklyData : monthlyData
  const subtitle = filter === "weekly" ? "Last 7 days" : "Last 30 days"

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground text-sm">Appointment Trends</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "weekly" | "monthly")}
            className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground/70 uppercase bg-muted pl-2 pr-5 py-1 rounded-full border border-border/60 cursor-pointer appearance-none focus:outline-none"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-muted-foreground/70 pointer-events-none" />
        </div>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={filter === "weekly" ? 28 : 8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.93 0.01 24)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              interval={0}
              height={filter === "monthly" ? 48 : 30}
              tick={filter === "monthly"
                ? { fontSize: 9, fill: "oklch(0.50 0.022 20)", angle: -45, textAnchor: "end" }
                : { fontSize: 11, fill: "oklch(0.50 0.022 20)" }
              }
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "oklch(0.50 0.022 20)" }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value, "Appointments"]} />
            <Bar dataKey="appointments" fill="oklch(0.60 0.11 330)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
