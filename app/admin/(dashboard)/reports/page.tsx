"use client"

import { useState, useCallback, useEffect } from "react"
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
import { Download, TrendingUp, Users, Calendar, Wallet, Wallet2Icon, Banknote } from "lucide-react"
import { getReports } from "@admin/api/reports/reports"
import { StatCard } from "@admin/components/stat-card"
import { formatCurrency, formatMoney } from "@/lib/utils"

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
  onlineGrowth: number
  revenueTrend: { value: string; up: boolean; label: string }
  appointmentsTrend: { value: string; up: boolean; label: string }
  clientsTrend: { value: string; up: boolean; label: string }
  previousRevenue: number
  previousAppointments: number
  previousClients: number
}

const COLORS = ["oklch(0.48 0.16 8)", "oklch(0.60 0.11 330)", "oklch(0.73 0.10 68)", "oklch(0.62 0.09 158)", "oklch(0.58 0.10 224)", "oklch(0.70 0.08 40)"]

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
  const pad = (n: number) => String(n).padStart(2, "0")
  const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const today = toStr(now)

  if (filter === "today") return { from: today, to: today }

  if (filter === "week") {
    const d = new Date(now)
    d.setDate(d.getDate() - 6)
    return { from: toStr(d), to: today }
  }

  if (filter === "month") {
    const from = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { from, to: toStr(lastDay) }
  }

  if (filter === "6months") {
    const d = new Date(now)
    d.setMonth(d.getMonth() - 6)
    return { from: toStr(d), to: today }
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

  const paymentChartData = data
    ? Object.entries(data.revenueByPaymentMethod).map(([name, revenue]) => ({ name, revenue: Number(revenue) }))
    : []

  const sourceChartData = data
    ? Object.entries(data.appointmentsBySource).map(([name, count]) => ({ name, count }))
    : []

  const statusOrder = ['Pending', 'Confirmed', 'Completed', 'Checked In', 'In Service']
  const statusChartData = data
    ? statusOrder.map(name => ({ name, count: data.appointmentsByStatus[name] || 0 }))
    : []

  const avgTicket = data && data.totalInvoices > 0
    ? Math.round(data.totalRevenue / data.totalInvoices)
    : 0

  return (
    <div className="premium-page p-4 sm:p-6 md:p-8 bg-[#fdfdfd]">
      <div className="flex flex-wrap gap-3 items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1e88e5] mb-1">Report and Analysis</h1>
          <p className="text-slate-500 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} Here's your salon today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Popover open={showCustomDate} onOpenChange={setShowCustomDate}>
            <PopoverTrigger asChild>
              <div className="bg-slate-100/50 rounded-lg">
                <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
                  <SelectTrigger className="w-40 border-none shadow-none bg-transparent cursor-pointer font-medium text-slate-600">
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
          <Button variant="outline" onClick={handleExport} disabled={!data} className="cursor-pointer border-slate-200 bg-slate-100/50 text-slate-600 font-medium">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(data.totalRevenue)}
              subtitle={<span className="text-blue-500 font-medium">{formatCurrency(data.paidRevenue)} paid</span>}
              icon={Wallet}
              iconWrapperClassName="bg-blue-50 text-blue-400"
              className="border-blue-200 ring-2 ring-blue-50"
              trend={data.revenueTrend.value}
              trendUp={data.revenueTrend.up}
              trendLabel={data.revenueTrend.label}
            />
            <StatCard
              title="Appointments"
              value={data.totalAppointments}
              subtitle={<span className="text-slate-400">{data.totalInvoices} invoices (Prev: {data.previousAppointments})</span>}
              icon={Calendar}
              iconWrapperClassName="bg-emerald-50 text-emerald-400"
              trend={data.appointmentsTrend.value}
              trendUp={data.appointmentsTrend.up}
              trendLabel={data.appointmentsTrend.label}
            />
            <StatCard
              title="New Clients"
              value={data.newClients}
              subtitle={<span className="text-slate-400">Prev Period: {data.previousClients}</span>}
              icon={Users}
              iconWrapperClassName="bg-amber-50 text-amber-400"
              trend={data.clientsTrend.value}
              trendUp={data.clientsTrend.up}
              trendLabel={data.clientsTrend.label}
            />
            <StatCard
              title="Avg. Revenue"
              value={formatCurrency(avgTicket)}
              subtitle={<span className="text-slate-400">Per completed service</span>}
              icon={TrendingUp}
              iconWrapperClassName="bg-purple-50 text-purple-400"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 text-lg">Payment Method</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentChartData} barGap={0}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#64748b", fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1).replace(/\.0$/, "")}k` : v} />
                    <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-slate-100 shadow-xl rounded-lg p-2 text-xs font-bold text-slate-600">
                            BDT {formatMoney(Number(payload[0].value ?? 0))}
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Bar dataKey="revenue" radius={[10, 10, 10, 10]} barSize={60}>
                      {paymentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.name === 'Cash' ? '#ffb74d' :
                            entry.name === 'bKash' ? '#d81b60' :
                              '#2196f3'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg">Top Services <span className="text-slate-400 font-normal text-sm">(by bookings)</span></h3>
              </div>
              <div className="flex flex-col h-[340px]">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.topServices.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="count"
                        stroke="none"
                      >
                        {data.topServices.slice(0, 6).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={
                            ['#1e88e5', '#29b6f6', '#7e57c2', '#26a69a', '#ffa000', '#ec407a'][index % 6]
                          } />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 px-4 mt-6">
                  {data.topServices.slice(0, 6).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                      <div className="w-3.5 h-3.5 rounded-[4px]" style={{ backgroundColor: ['#1e88e5', '#29b6f6', '#7e57c2', '#26a69a', '#ffa000', '#ec407a'][i % 6] }} />
                      {s.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h3 className="font-bold text-slate-800 text-lg">Appointments by Source</h3>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Online booking {data.onlineGrowth >= 0 ? '+' : ''}{data.onlineGrowth}% growth
                </span>
              </div>
              <div className="h-64 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(() => {
                    const order = ['Walk-In', 'Online', 'Call'];
                    return order.map(name => ({ name, count: data.appointmentsBySource[name] || 0 }));
                  })()} barGap={20}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 16, fill: "#64748b", fontWeight: 500 }} dy={15} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" radius={[15, 15, 15, 15]} barSize={140}>
                      {['Walk-In', 'Online', 'Call'].map((name, index) => (
                        <Cell key={`cell-${index}`} fill={
                          name === 'Walk-In' ? '#6366f1' :
                            name === 'Online' ? '#818cf8' :
                              '#0ea5e9'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-6">
                {['Walk-In', 'Online', 'Call'].map((name, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400 font-bold">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: name === 'Walk-In' ? '#6366f1' : name === 'Online' ? '#818cf8' : '#0ea5e9' }} />
                    {name === 'Walk-In' ? 'Walk IN' : name} ({data.appointmentsBySource[name] || 0})
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 text-lg">Appointments by Status</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#cbd5e1" }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={45}>
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.name === 'Pending' ? '#ffc107' :
                            entry.name === 'Confirmed' ? '#00c2ab' :
                              entry.name === 'Completed' ? '#00a676' :
                                entry.name === 'Checked In' ? '#66bb6a' :
                                  '#9575cd'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Staff Revenue */}
          {data.topStaff.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 text-lg">Staff Revenue</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topStaff} layout="vertical" margin={{ left: 40, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#475569", fontWeight: 600 }} width={100} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
                    <Bar dataKey="revenue" fill="#29b6f6" radius={[0, 6, 6, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
