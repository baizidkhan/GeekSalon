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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Download } from "lucide-react"
import { getStaffReports } from "@/api/staff-reports/staff-reports"

interface StaffPerformance {
  id: string
  name: string
  role: string
  status: string
  appointments: number
  revenue: number
  efficiency: number
}

interface StaffReportData {
  staff: StaffPerformance[]
  totalStaff: number
  totalAppointments: number
  totalRevenue: number
}

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
    const d = new Date(now); d.setDate(d.getDate() - 6)
    return { from: d.toISOString().split("T")[0], to: today }
  }
  if (filter === "month") {
    return { from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`, to: today }
  }
  if (filter === "6months") {
    const d = new Date(now); d.setMonth(d.getMonth() - 6)
    return { from: d.toISOString().split("T")[0], to: today }
  }
  if (filter === "year") return { from: `${now.getFullYear()}-01-01`, to: today }
  return { from: today, to: today }
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase()
}

export default function StaffReportsPage() {
  const [timeFilter, setTimeFilter] = useState("month")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [data, setData] = useState<StaffReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchReports = useCallback(async (filter: string, from?: string, to?: string) => {
    const range = filter === "custom" && from && to ? { from, to } : getDateRange(filter)
    try {
      setLoading(true)
      const res = await getStaffReports(range.from, range.to)
      setData(res)
    } catch (err) {
      console.error("Failed to fetch staff reports", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports("month")
  }, [fetchReports])

  const handleTimeFilterChange = (v: string) => {
    setTimeFilter(v)
    if (v === "custom") { setShowCustomDate(true) } else { fetchReports(v) }
  }

  const handleCustomApply = () => {
    setShowCustomDate(false)
    if (customFrom && customTo) fetchReports("custom", customFrom, customTo)
  }

  const handleExport = () => {
    if (!data) return
    const rows = data.staff.map(s => [s.name, s.role, s.status, s.appointments, s.revenue, s.efficiency + "%"])
    const csv = [
      ["Staff Performance Report"],
      [""],
      ["Name", "Role", "Status", "Appointments", "Revenue", "Efficiency"],
      ...rows,
      [""],
      ["Total Staff", data.totalStaff],
      ["Total Appointments", data.totalAppointments],
      ["Total Revenue", data.totalRevenue],
    ].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `staff-report-${timeFilter}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const topByAppointments = data?.staff.reduce((top, s) => s.appointments > (top?.appointments ?? -1) ? s : top, null as StaffPerformance | null)
  const topByRevenue = data?.staff.reduce((top, s) => s.revenue > (top?.revenue ?? -1) ? s : top, null as StaffPerformance | null)

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Staff Reports</h1>
            <p className="text-muted-foreground">Employee performance analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Popover open={showCustomDate} onOpenChange={setShowCustomDate}>
              <PopoverTrigger asChild>
                <div>
                  <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
                    <SelectTrigger className="w-40 cursor-pointer"><SelectValue /></SelectTrigger>
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
                  <div><Label className="text-xs">From</Label><Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} /></div>
                  <div><Label className="text-xs">To</Label><Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} /></div>
                  <Button size="sm" className="w-full cursor-pointer" onClick={handleCustomApply}>Apply</Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={handleExport} disabled={!data} className="cursor-pointer">
              <Download className="w-4 h-4 mr-2" />Export
            </Button>
          </div>
        </div>

        {loading && <div className="text-center text-muted-foreground py-20">Loading...</div>}

        {!loading && data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-card rounded-xl p-5 border border-border">
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{data.totalStaff}</p>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border">
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{data.totalAppointments}</p>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-semibold text-foreground mt-1">৳{data.totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            {/* Performance Table */}
            <div className="bg-card rounded-xl border border-border mb-6">
              <div className="p-4 border-b border-border">
                <h3 className="font-medium text-foreground">Staff Performance</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Appointments</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Efficiency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.staff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No staff data found</TableCell>
                    </TableRow>
                  ) : data.staff.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">{getInitials(s.name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{s.role}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${s.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                          {s.status}
                        </span>
                      </TableCell>
                      <TableCell>{s.appointments}</TableCell>
                      <TableCell className="font-medium">৳{s.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${s.efficiency}%` }} />
                          </div>
                          <span className="text-sm">{s.efficiency}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Top Performers */}
            {(topByAppointments || topByRevenue) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topByAppointments && (
                  <div className="bg-card rounded-xl p-5 border border-border">
                    <h4 className="text-sm text-muted-foreground mb-3">Most Appointments</h4>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">{getInitials(topByAppointments.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{topByAppointments.name}</p>
                        <p className="text-sm text-muted-foreground">{topByAppointments.appointments} appointments</p>
                      </div>
                    </div>
                  </div>
                )}
                {topByRevenue && (
                  <div className="bg-card rounded-xl p-5 border border-border">
                    <h4 className="text-sm text-muted-foreground mb-3">Highest Revenue</h4>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">{getInitials(topByRevenue.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{topByRevenue.name}</p>
                        <p className="text-sm text-muted-foreground">৳{topByRevenue.revenue.toLocaleString()} revenue</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
