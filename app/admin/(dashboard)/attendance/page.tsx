"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  UserPlus,
  Download,
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  AlertCircle,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Fingerprint,
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
} from "recharts"
import {
  getAttendance,
  getTodayAttendance,
  getAttendanceSummary,
  formatTime,
  formatWorkingTime,
  type AttendanceRecord,
  type AttendanceStatus,
  type MonthSummary,
} from "@admin/api/attendance/attendance"
import { getBasicEmployees } from "@admin/api/employees/employees"
import { toast } from "sonner"

// ─── Constants ────────────────────────────────────────────────────────────────

const YEARS       = ["2024", "2025", "2026"]
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const PAGE_SIZE   = 10

type ViewMode = "today" | "calendar"

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<NonNullable<AttendanceStatus>, { label: string; cls: string; icon: React.ReactNode }> = {
  present:  { label: "Present",  cls: "bg-green-100 text-green-700",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  late:     { label: "Late",     cls: "bg-amber-100 text-amber-700",  icon: <Clock        className="w-3.5 h-3.5" /> },
  half_day: { label: "Half Day", cls: "bg-orange-100 text-orange-700",icon: <MinusCircle  className="w-3.5 h-3.5" /> },
  absent:   { label: "Absent",   cls: "bg-red-100 text-red-700",      icon: <XCircle      className="w-3.5 h-3.5" /> },
}

function StatusBadge({ status }: { status: AttendanceStatus | null }) {
  if (!status) return <span className="text-xs text-muted-foreground">No exit</span>
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

// ─── Calendar day icon ────────────────────────────────────────────────────────

function DayCell({ status }: { status: AttendanceStatus | null | "off" | "future" }) {
  if (status === "off" || status === "future") return <span className="w-4 h-4 block" />
  if (status === null) return <AlertCircle className="w-4 h-4 text-muted-foreground/40" />
  if (status === "present")  return <CheckCircle2 className="w-4 h-4 text-green-500" />
  if (status === "late")     return <Clock        className="w-4 h-4 text-amber-500" />
  if (status === "half_day") return <MinusCircle  className="w-4 h-4 text-orange-400" />
  if (status === "absent")   return <XCircle      className="w-4 h-4 text-red-400" />
  return null
}

// ─── Summary bar chart ────────────────────────────────────────────────────────

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const CHART_DATA = MONTHS_SHORT.map((month, mi) => ({
  month,
  Present: Math.floor(seededRandom(mi * 3)     * 30 + 50),
  Late:    Math.floor(seededRandom(mi * 3 + 1) * 15 + 10),
  Absent:  Math.floor(seededRandom(mi * 3 + 2) * 10 + 5),
}))

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportCSV(records: AttendanceRecord[], label: string) {
  const header = ["Employee","Date","Check In","Check Out","Working Hours","Status"]
  const rows = records.map(r => [
    r.employeeName,
    r.attendanceDate,
    formatTime(r.checkInTime),
    formatTime(r.checkOutTime),
    formatWorkingTime(r.workingMinutes),
    r.status ?? "no_exit",
  ])
  const csv  = [header, ...rows].map(r => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href = url; a.download = `attendance-${label}.csv`; a.click()
  URL.revokeObjectURL(url)
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const today     = new Date()
  const [viewMode, setViewMode] = useState<ViewMode>("today")
  const [search,   setSearch]   = useState("")
  const [year,     setYear]     = useState(String(today.getFullYear()))
  const [month,    setMonth]    = useState(String(today.getMonth()))  // 0-indexed for display
  const [empFilter, setEmpFilter] = useState<string>("all")
  const [page,     setPage]     = useState(1)

  const [todayRecords,    setTodayRecords]    = useState<AttendanceRecord[]>([])
  const [monthRecords,    setMonthRecords]    = useState<AttendanceRecord[]>([])
  const [summary,         setSummary]         = useState<MonthSummary | null>(null)
  const [employees,       setEmployees]       = useState<{ id: string; name: string }[]>([])
  const [loading,         setLoading]         = useState(false)

  // ── Fetch today ────────────────────────────────────────────────────────────
  const fetchToday = useCallback(async () => {
    setLoading(true)
    try {
      const [recs, summ] = await Promise.all([
        getTodayAttendance(),
        getAttendanceSummary(today.getFullYear(), today.getMonth() + 1),
      ])
      setTodayRecords(recs)
      setSummary(summ)
    } catch {
      toast.error("Failed to load today's attendance")
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch month ────────────────────────────────────────────────────────────
  const fetchMonth = useCallback(async () => {
    setLoading(true)
    try {
      const m = Number(month) + 1  // convert from 0-indexed
      const [recs, summ] = await Promise.all([
        getAttendance({ month: m, year: Number(year) }),
        getAttendanceSummary(Number(year), m),
      ])
      setMonthRecords(recs)
      setSummary(summ)
    } catch {
      toast.error("Failed to load attendance")
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { fetchToday() }, [fetchToday])
  useEffect(() => { fetchMonth() }, [fetchMonth])
  useEffect(() => {
    getBasicEmployees()
      .then((list: any[]) => setEmployees(Array.isArray(list) ? list : []))
      .catch(() => {})
  }, [])

  // ── Today table filtered ───────────────────────────────────────────────────
  const todayFiltered = useMemo(() => {
    return todayRecords.filter(r =>
      r.employeeName.toLowerCase().includes(search.toLowerCase()) &&
      (empFilter === "all" || r.employeeId === empFilter)
    )
  }, [todayRecords, search, empFilter])

  // ── Calendar data ──────────────────────────────────────────────────────────
  const daysInMonth = useMemo(() => new Date(Number(year), Number(month) + 1, 0).getDate(), [year, month])
  const todayStr    = today.toISOString().split("T")[0]

  // Build per-employee day map from monthRecords
  const calendarRows = useMemo(() => {
    const empMap = new Map<string, { name: string; days: Map<number, AttendanceStatus | null> }>()
    for (const r of monthRecords) {
      if (!empMap.has(r.employeeId)) {
        empMap.set(r.employeeId, { name: r.employeeName, days: new Map() })
      }
      const d = Number(r.attendanceDate.split("-")[2])
      empMap.get(r.employeeId)!.days.set(d, r.status)
    }

    return Array.from(empMap.values())
      .filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
  }, [monthRecords, search])

  const calendarPaged   = calendarRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const calendarTotal   = Math.max(1, Math.ceil(calendarRows.length / PAGE_SIZE))

  const todayTotal      = Math.max(1, Math.ceil(todayFiltered.length / PAGE_SIZE))
  const todayPaged      = todayFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleDownload() {
    if (viewMode === "today") {
      exportCSV(todayFiltered, `today-${todayStr}`)
    } else {
      exportCSV(monthRecords, `${MONTH_NAMES[Number(month)]}-${year}`)
    }
  }

  const totalPages = viewMode === "today" ? todayTotal : calendarTotal

  return (
    <div className="premium-page p-6 space-y-6">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span>Dashboard</span><span className="mx-1">/</span>
            <span className="text-foreground">Attendance</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => viewMode === "today" ? fetchToday() : fetchMonth()} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            variant={viewMode === "today" ? "default" : "outline"}
            onClick={() => { setViewMode("today"); setPage(1) }}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => { setViewMode("calendar"); setPage(1) }}
          >
            Monthly
          </Button>
        </div>
      </div>

      {/* ── Summary cards ────────────────────────────────────────────── */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Present",  value: summary.present,  cls: "text-green-600",  bg: "bg-green-50"  },
            { label: "Late",     value: summary.late,     cls: "text-amber-600",  bg: "bg-amber-50"  },
            { label: "Half Day", value: summary.half_day, cls: "text-orange-600", bg: "bg-orange-50" },
            { label: "Absent",   value: summary.absent,   cls: "text-red-600",    bg: "bg-red-50"    },
          ].map(c => (
            <div key={c.label} className={`${c.bg} rounded-xl p-4 border border-border`}>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className={`text-3xl font-bold mt-1 ${c.cls}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts Row ────────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">Monthly Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={CHART_DATA} barSize={16} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="Present" stackId="a" fill="#22c55e" />
            <Bar dataKey="Late"    stackId="a" fill="#f59e0b" />
            <Bar dataKey="Absent"  stackId="a" fill="#f87171" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Main Table Card ───────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border">

        {/* Table toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border gap-3 flex-wrap">
          <h2 className="font-semibold text-foreground">
            {viewMode === "today"
              ? `Today · ${today.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })}`
              : `${MONTH_NAMES[Number(month)]} ${year}`}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search employee"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="pl-8 h-8 w-44 text-sm"
              />
            </div>

            {viewMode === "today" && (
              <Select value={empFilter} onValueChange={v => { setEmpFilter(v); setPage(1) }}>
                <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All employees</SelectItem>
                  {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            {viewMode === "calendar" && (
              <>
                <Select value={month} onValueChange={v => { setMonth(v); setPage(1) }}>
                  <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTH_NAMES.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={year} onValueChange={v => { setYear(v); setPage(1) }}>
                  <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </>
            )}

            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleDownload}>
              <Download className="w-3.5 h-3.5" />Export CSV
            </Button>
          </div>
        </div>

        {/* ── TODAY view ─────────────────────────────────────────────── */}
        {viewMode === "today" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><span className="flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5 text-primary/60"/>Employee</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5 text-primary/60"/>Device UID</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary/60"/>Check In</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary/60"/>Check Out</span></TableHead>
                <TableHead>Working Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
              ) : todayPaged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Calendar className="w-8 h-8 opacity-30" />
                      <p className="text-sm">No attendance records for today</p>
                      <p className="text-xs">Records appear automatically when employees scan their fingerprint</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                todayPaged.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {r.employeeName.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{r.employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{r.machineId}</TableCell>
                    <TableCell className="text-sm">{formatTime(r.checkInTime)}</TableCell>
                    <TableCell className="text-sm">{formatTime(r.checkOutTime)}</TableCell>
                    <TableCell className="text-sm">{formatWorkingTime(r.workingMinutes)}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {/* ── CALENDAR view ──────────────────────────────────────────── */}
        {viewMode === "calendar" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">
                    <span className="inline-flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-primary/60" />Employee Name
                    </span>
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const dayNum = i + 1
                    const dateStr = `${year}-${String(Number(month)+1).padStart(2,"0")}-${String(dayNum).padStart(2,"0")}`
                    const isToday = dateStr === todayStr
                    return (
                      <th key={dayNum} className={`px-1 py-3 font-medium text-center min-w-[28px] ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                        {dayNum}
                      </th>
                    )
                  })}
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-primary/60" />Absent
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={daysInMonth + 2} className="text-center py-10 text-muted-foreground">Loading…</td></tr>
                ) : calendarPaged.length === 0 ? (
                  <tr>
                    <td colSpan={daysInMonth + 2} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Calendar className="w-8 h-8 opacity-30" />
                        <p className="text-sm">No records for {MONTH_NAMES[Number(month)]} {year}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  calendarPaged.map((emp, idx) => {
                    const absentCount = Array.from({ length: daysInMonth }, (_, i) => i + 1)
                      .filter(d => {
                        const dateStr = `${year}-${String(Number(month)+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
                        if (dateStr > todayStr) return false
                        const s = emp.days.get(d)
                        return !s || s === "absent"
                      }).length

                    return (
                      <tr key={idx} className={`border-b border-border last:border-0 ${idx % 2 === 0 ? "bg-card" : "bg-muted/20"} hover:bg-blue-50/40 transition-colors`}>
                        <td className="px-5 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 shrink-0">
                              {emp.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                            </div>
                            <span className="font-medium text-foreground">{emp.name}</span>
                          </div>
                        </td>
                        {Array.from({ length: daysInMonth }, (_, i) => {
                          const d       = i + 1
                          const dateStr = `${year}-${String(Number(month)+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
                          const isFuture = dateStr > todayStr
                          const status  = isFuture ? "future" : emp.days.get(d) ?? null
                          return (
                            <td key={d} className="px-1 py-2.5 text-center">
                              <div className="flex justify-center">
                                <DayCell status={status as any} />
                              </div>
                            </td>
                          )
                        })}
                        <td className="px-4 py-2.5 text-right">
                          <Badge variant="secondary" className={`text-xs font-semibold ${absentCount >= 10 ? "bg-red-100 text-red-600" : absentCount >= 5 ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>
                            {absentCount}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border text-sm text-muted-foreground">
          <span>
            {viewMode === "today"
              ? `${todayFiltered.length} record(s) today`
              : `${calendarRows.length} employee(s)`}
          </span>
          <div className="flex items-center gap-1">
            {[
              { icon: <ChevronFirst className="w-3.5 h-3.5"/>, action: () => setPage(1),               disabled: page === 1 },
              { icon: <ChevronLeft  className="w-3.5 h-3.5"/>, action: () => setPage(p => p-1),        disabled: page === 1 },
              { icon: <ChevronRight className="w-3.5 h-3.5"/>, action: () => setPage(p => p+1),        disabled: page === totalPages },
              { icon: <ChevronLast  className="w-3.5 h-3.5"/>, action: () => setPage(totalPages),      disabled: page === totalPages },
            ].map((btn, i) => (
              <Button key={i} variant="outline" size="icon" className="h-7 w-7" disabled={btn.disabled} onClick={btn.action}>
                {btn.icon}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Legend ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 text-xs text-muted-foreground pb-2 flex-wrap">
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            {v.icon}{v.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground/40" />No exit recorded
        </div>
      </div>
    </div>
  )
}
