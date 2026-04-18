"use client"

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
import { TrendingUp, Calendar } from "lucide-react"
interface RevenueTrendPoint {
  day: string
  revenue: number
}

interface AppointmentTrendPoint {
  week: string
  appointments: number
}

interface RevenueChartProps {
  data: RevenueTrendPoint[]
}

interface AppointmentChartProps {
  data: AppointmentTrendPoint[]
}

const tooltipStyle = {
  backgroundColor: "white",
  border: "1px solid oklch(0.908 0.013 24)",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "0 4px 16px oklch(0.18 0.022 18 / 0.08)",
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-primary/10 rounded-xl">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-foreground text-sm">Revenue Trend</h3>
          <p className="text-xs text-muted-foreground">Last 7 days</p>
        </div>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.48 0.16 8)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="oklch(0.48 0.16 8)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.93 0.01 24)" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "oklch(0.50 0.022 20)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "oklch(0.50 0.022 20)" }} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`৳${value.toLocaleString()}`, "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="oklch(0.48 0.16 8)" strokeWidth={2.5} fill="url(#revenueGradient)" dot={false} activeDot={{ r: 4, fill: "oklch(0.48 0.16 8)" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function AppointmentChart({ data }: AppointmentChartProps) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-foreground text-sm">Appointment Trends</h3>
          <p className="text-xs text-muted-foreground">Weekly overview</p>
        </div>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.93 0.01 24)" />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "oklch(0.50 0.022 20)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "oklch(0.50 0.022 20)" }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value, "Appointments"]} />
            <Bar dataKey="appointments" fill="oklch(0.60 0.11 330)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
