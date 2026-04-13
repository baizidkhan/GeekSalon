"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  UserPlus,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// ---------- Types ----------
type DayStatus = "present" | "absent" | "leave" | "off"

interface Employee {
  id: number
  name: string
  avatar: string
  initials: string
  days: DayStatus[]
  leaveCount: number
}

// ---------- Mock Data ----------
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const attendanceRateData = MONTHS.map((month) => ({
  month,
  onTime: Math.floor(Math.random() * 30 + 50),
  late:   Math.floor(Math.random() * 15 + 10),
  absent: Math.floor(Math.random() * 10 + 5),
}))

const employeeTypeData = [
  { name: "Onsite",  value: 800, color: "#2563eb" },
  { name: "Remote",  value: 105, color: "#f97316" },
  { name: "Hybrid",  value: 301, color: "#38bdf8" },
]

function generateDays(): DayStatus[] {
  return Array.from({ length: 31 }, (_, i) => {
    if (i >= 28) return "off"
    const r = Math.random()
    if (r < 0.75) return "present"
    if (r < 0.88) return "absent"
    return "leave"
  })
}

const AVATARS = [
  { name: "Anthony Thomas",     initials: "AT", bg: "#dbeafe" },
  { name: "Benjamin Martinez",  initials: "BM", bg: "#fef3c7" },
  { name: "Christopher Moore",  initials: "CM", bg: "#d1fae5" },
  { name: "Diana Kim",          initials: "DK", bg: "#fce7f3" },
  { name: "Edward Wilson",      initials: "EW", bg: "#ede9fe" },
  { name: "Fiona Brown",        initials: "FB", bg: "#ffedd5" },
  { name: "George Davis",       initials: "GD", bg: "#e0f2fe" },
  { name: "Hannah Clark",       initials: "HC", bg: "#fdf2f8" },
  { name: "Ivan Rodriguez",     initials: "IR", bg: "#ecfdf5" },
]

const ALL_EMPLOYEES: Employee[] = AVATARS.map((a, i) => {
  const days = generateDays()
  const leaveCount = days.filter((d) => d === "absent" || d === "leave").length
  return { id: i + 1, name: a.name, avatar: a.initials, initials: a.initials, days, leaveCount }
})

const YEARS = ["2022", "2023", "2024", "2025", "2026"]
const PAGE_SIZE = 9

// ---------- Day Status Icon ----------
function DayIcon({ status }: { status: DayStatus }) {
  if (status === "present")
    return <CheckCircle2 className="w-4 h-4 text-blue-500" />
  if (status === "absent")
    return <XCircle className="w-4 h-4 text-red-400" />
  if (status === "leave")
    return <MinusCircle className="w-4 h-4 text-orange-400" />
  return <span className="w-4 h-4 block" />
}

// ---------- Custom Donut Label ----------
function DonutCenterLabel() {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-8" fontSize="26" fontWeight="700" fill="#1e293b">1000</tspan>
      <tspan x="50%" dy="22" fontSize="12" fill="#94a3b8">Employee</tspan>
    </text>
  )
}

// ---------- Main Page ----------
export default function AttendancePage() {
  const today = new Date()
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: undefined,
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const [search, setSearch]   = useState("")
  const [year, setYear]       = useState("2024")
  const [page, setPage]       = useState(1)

  const filtered = useMemo(() => {
    return ALL_EMPLOYEES.filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleDownload() {
    const header = ["Employee Name", ...Array.from({ length: 31 }, (_, i) => String(i + 1)), "Leave"]
    const rows = filtered.map((e) => [
      e.name,
      ...e.days.map((d) => d === "present" ? "P" : d === "absent" ? "A" : d === "leave" ? "L" : "-"),
      e.leaveCount,
    ])
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url; a.download = `attendance-${year}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Today, {new Date().toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="hover:underline cursor-pointer">Dashboard</span>
              <span className="mx-1">/</span>
              <span className="text-foreground">Attendance</span>
            </p>
          </div>
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add Employee
          </Button>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Attendance Rate Chart */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Attendance Rate</h2>
              <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
                <Download className="w-3.5 h-3.5" />
                Download Report
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={attendanceRateData} barSize={18} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  formatter={(value) =>
                    value === "onTime" ? "One Time" : value === "late" ? "Late" : "Absent"
                  }
                />
                <Bar dataKey="onTime" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} />
                <Bar dataKey="late"   stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                <Bar dataKey="absent" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Employee Type Donut */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Employee Type</h2>
            </div>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={employeeTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {employeeTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <DonutCenterLabel />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-1">
                {employeeTypeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{item.value}</span>{" "}
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-card rounded-xl border border-border">

          {/* Table Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border gap-3 flex-wrap">
            <h2 className="font-semibold text-foreground">Employee Attendance</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="pl-8 h-8 w-44 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-xs h-8" onClick={handleDownload}>
                <Download className="w-3.5 h-3.5" />
                Download Report
              </Button>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scrollable Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">
                    Employee Name
                    <span className="ml-1 text-xs">↑</span>
                  </th>
                  {Array.from({ length: 31 }, (_, i) => (
                    <th
                      key={i + 1}
                      className="px-1 py-3 font-medium text-muted-foreground text-center min-w-[28px]"
                    >
                      {i + 1}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right whitespace-nowrap">
                    Leave
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    className={`border-b border-border last:border-0 ${
                      idx % 2 === 0 ? "bg-card" : "bg-muted/20"
                    } hover:bg-blue-50/40 transition-colors`}
                  >
                    {/* Name */}
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 text-blue-700"
                          style={{ backgroundColor: "#dbeafe" }}
                        >
                          {emp.initials}
                        </div>
                        <span className="font-medium text-foreground">{emp.name}</span>
                      </div>
                    </td>
                    {/* Days */}
                    {emp.days.map((status, di) => (
                      <td key={di} className="px-1 py-2.5 text-center">
                        <div className="flex justify-center">
                          <DayIcon status={status} />
                        </div>
                      </td>
                    ))}
                    {/* Leave count */}
                    <td className="px-4 py-2.5 text-right">
                      <Badge
                        variant="secondary"
                        className={`text-xs font-semibold ${
                          emp.leaveCount >= 10
                            ? "bg-red-100 text-red-600"
                            : emp.leaveCount >= 5
                            ? "bg-orange-100 text-orange-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {emp.leaveCount} Day
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border text-sm text-muted-foreground">
            <span>
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === 1}
                onClick={() => setPage(1)}
              >
                <ChevronFirst className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1
                return (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="icon"
                    className="h-7 w-7 text-xs"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
              >
                <ChevronLast className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-xs text-muted-foreground pb-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            Present
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-red-400" />
            Absent
          </div>
          <div className="flex items-center gap-1.5">
            <MinusCircle className="w-4 h-4 text-orange-400" />
            Leave
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
