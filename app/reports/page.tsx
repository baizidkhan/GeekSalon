"use client"

import { useState, useCallback, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
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
import { getReports } from "@/api/reports/reports"

interface ReportData {
  totalRevenue: number
  paidRevenue: number
  unpaidRevenue: number
  revenueByPaymentMethod: { Cash: number; bKash: number; Card: number }
  totalInvoices: number
  totalAppointments: number
  appointmentsByStatus: Record<string, number>
  appointmentsBySource: Record<string, number>
  newClients: number
  topServices: { name: string; count: number }[]
  topStaff: { name: string; revenue: number }[]
}

const COLORS = ["oklch(0.6 0.2 250)", "oklch(0.7 0.15 200)", "oklch(0.65 0.2 30)", "oklch(0.5 0.15 280)", "oklch(0.55 0.18 150)", "oklch(0.6 0.18 320)"]

const TIME_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "6months", label: "Last 6 Months" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Date" },
]

function getDateRange(filter: string): { from: string; to: string } {
  const now = new Date()
  const today = now.toISOString().split("T")[0]

  if (filter === "today") return { from: today, to: today }

  if (filter === "week") {
    const d = new Date(now)
    d.setDate(d.getDate() - 6)
    return { from: d.toISOString().split("T")[0], to: today }
  }

  if (filter === "month") {
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
    return { from, to: today }
  }

  if (filter === "6months") {
    const d = new Date(now)
    d.setMonth(d.getMonth() - 6)
    return { from: d.toISOString().split("T")[0], to: today }
  }

  if (filter === "year") {
    return { from: `${now.getFullYear()}-01-01`, to: today }
  }

  return { from: today, to: today }
}

export default function ReportsPage() {
  const [timeFilter, setTimeFilter] = useState("month")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchReports = useCallback(async (filter: string, from?: string, to?: string) => {
    const range = filter === "custom" && from && to
      ? { from, to }
      : getDateRange(filter)
    try {
      setLoading(true)
      const res = await getReports(range.from, range.to)
      setData(res)
    } catch (err) {
      console.error("Failed to fetch reports", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports("month")
  }, [fetchReports])

  const handleTimeFilterChange = (v: string) => {
    setTimeFilter(v)
    if (v === "custom") {
      setShowCustomDate(true)
    } else {
      fetchReports(v)
    }
  }

  const handleCustomApply = () => {
    setShowCustomDate(false)
    if (customFrom && customTo) fetchReports("custom", customFrom, customTo)
  }

  const handleExport = () => {
    if (!data) return
    const rows = [
      ["Total Revenue", data.totalRevenue],
      ["Paid Revenue", data.paidRevenue],
      ["Unpaid Revenue", data.unpaidRevenue],
      ["Total Appointments", data.totalAppointments],
      ["New Clients", data.newClients],
      ["Total Invoices", data.totalInvoices],
      [""],
      ["Payment Method", "Revenue"],
      ["Cash", data.revenueByPaymentMethod.Cash],
      ["bKash", data.revenueByPaymentMethod.bKash],
      ["Card", data.revenueByPaymentMethod.Card],
      [""],
      ["Service", "Bookings"],
      ...data.topServices.map(s => [s.name, s.count]),
      [""],
      ["Staff", "Revenue"],
      ...data.topStaff.map(s => [s.name, s.revenue]),
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report-${timeFilter}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const paymentChartData = data ? [
    { name: "Cash", revenue: Number(data.revenueByPaymentMethod.Cash) },
    { name: "bKash", revenue: Number(data.revenueByPaymentMethod.bKash) },
    { name: "Card", revenue: Number(data.revenueByPaymentMethod.Card) },
  ] : []

  const sourceChartData = data
    ? Object.entries(data.appointmentsBySource).map(([name, count]) => ({ name, count }))
    : []

  const avgTicket = data && data.totalInvoices > 0
    ? Math.round(data.totalRevenue / data.totalInvoices)
    : 0

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Report and Analysis</h1>
            <p className="text-muted-foreground">Business insights and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Popover open={showCustomDate} onOpenChange={setShowCustomDate}>
              <PopoverTrigger asChild>
                <div>
                  <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
                    <SelectTrigger className="w-40 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(opt => (
                        <SelectItem className="cursor-pointer" key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">From</Label>
                    <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">To</Label>
                    <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                  </div>
                  <Button size="sm" className="w-full cursor-pointer" onClick={handleCustomApply}>Apply</Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={handleExport} disabled={!data} className="cursor-pointer">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {loading && (
          <div className="text-center text-muted-foreground py-20">Loading...</div>
        )}

        {!loading && data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="w-5 h-5 text-primary font-bold text-base flex items-center justify-center">৳</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-semibold text-foreground">৳{data.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600">৳{data.paidRevenue.toLocaleString()} paid</p>
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
                    <p className="text-2xl font-semibold text-foreground">{data.totalAppointments}</p>
                    <p className="text-xs text-muted-foreground">{data.totalInvoices} invoices</p>
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
                    <p className="text-2xl font-semibold text-foreground">{data.newClients}</p>
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
                    <p className="text-2xl font-semibold text-foreground">৳{avgTicket.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-medium text-foreground mb-4">Revenue by Payment Method</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, "Revenue"]} />
                      <Bar dataKey="revenue" fill="oklch(0.6 0.2 250)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-medium text-foreground mb-4">Top Services</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.topServices.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="name"
                      >
                        {data.topServices.slice(0, 6).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, "Bookings"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-medium text-foreground mb-4">Appointments by Source</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Appointments" fill="oklch(0.7 0.15 200)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-medium text-foreground mb-4">Appointments by Status</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(data.appointmentsByStatus).map(([name, count]) => ({ name, count }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Appointments" fill="oklch(0.65 0.2 30)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Staff Revenue */}
            {data.topStaff.length > 0 && (
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-medium text-foreground mb-4">Staff Revenue</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topStaff} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} width={80} />
                      <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, "Revenue"]} />
                      <Bar dataKey="revenue" fill="oklch(0.5 0.15 280)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
