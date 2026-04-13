"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Download, TrendingUp, Users, Calendar } from "lucide-react"
import { useState } from "react"

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
]

const serviceData = [
  { name: "Hair Services", value: 45 },
  { name: "Skin Care", value: 25 },
  { name: "Nail Services", value: 20 },
  { name: "Grooming", value: 10 },
]

const appointmentData = [
  { day: "Mon", online: 8, walkin: 5 },
  { day: "Tue", online: 6, walkin: 7 },
  { day: "Wed", online: 10, walkin: 4 },
  { day: "Thu", online: 7, walkin: 6 },
  { day: "Fri", online: 12, walkin: 8 },
  { day: "Sat", online: 15, walkin: 12 },
  { day: "Sun", online: 5, walkin: 3 },
]

const COLORS = ["oklch(0.6 0.2 250)", "oklch(0.7 0.15 200)", "oklch(0.65 0.2 30)", "oklch(0.5 0.15 280)"]

export default function ReportsPage() {
  const [period, setPeriod] = useState("monthly")

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Report and Analysis</h1>
            <p className="text-muted-foreground">Business insights and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="w-5 h-5 text-primary font-bold text-base flex items-center justify-center">৳</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-semibold text-foreground">৳3,28,000</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Appointments</p>
                <p className="text-2xl font-semibold text-foreground">156</p>
                <p className="text-xs text-green-600">+8% from last month</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Clients</p>
                <p className="text-2xl font-semibold text-foreground">24</p>
                <p className="text-xs text-green-600">+15% from last month</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Ticket Size</p>
                <p className="text-2xl font-semibold text-foreground">৳2,103</p>
                <p className="text-xs text-green-600">+5% from last month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-medium text-foreground mb-4">Revenue Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.6 0.2 250)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.6 0.2 250)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(v) => `৳${v/1000}k`} />
                  <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="oklch(0.6 0.2 250)" strokeWidth={2} fill="url(#revenueGradient2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-medium text-foreground mb-4">Service Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {serviceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, "Share"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="font-medium text-foreground mb-4">Appointments by Type</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="online" name="Online" fill="oklch(0.6 0.2 250)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="walkin" name="Walk-in" fill="oklch(0.7 0.15 200)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
