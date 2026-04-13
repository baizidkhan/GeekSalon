"use client"

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
import { Download, Star } from "lucide-react"
import { useState } from "react"

interface StaffPerformance {
  id: string
  name: string
  role: string
  appointments: number
  revenue: number
  rating: number
  efficiency: number
}

const staffPerformance: StaffPerformance[] = [
  { id: "1", name: "Rumana Akter", role: "Senior Stylist", appointments: 45, revenue: 67500, rating: 4.8, efficiency: 92 },
  { id: "2", name: "Md. Sohel Rana", role: "Barber", appointments: 62, revenue: 18600, rating: 4.6, efficiency: 88 },
  { id: "3", name: "Shahnaz Parvin", role: "Beautician", appointments: 38, revenue: 45600, rating: 4.9, efficiency: 95 },
  { id: "4", name: "Taslima Khanam", role: "Nail Technician", appointments: 28, revenue: 14000, rating: 4.5, efficiency: 85 },
]

const TIME_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "6months", label: "Last 6 Months" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Date" },
]

export default function StaffReportsPage() {
  const [timeFilter, setTimeFilter] = useState("month")
  const [customDateFrom, setCustomDateFrom] = useState("")
  const [customDateTo, setCustomDateTo] = useState("")
  const [showCustomDate, setShowCustomDate] = useState(false)

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase()
  }

  const totalAppointments = staffPerformance.reduce((sum, s) => sum + s.appointments, 0)
  const totalRevenue = staffPerformance.reduce((sum, s) => sum + s.revenue, 0)
  const avgRating = (staffPerformance.reduce((sum, s) => sum + s.rating, 0) / staffPerformance.length).toFixed(1)

  const handleExport = () => {
    const headers = ["Name", "Role", "Appointments", "Revenue", "Rating", "Efficiency"]
    const rows = staffPerformance.map(s => [s.name, s.role, s.appointments, s.revenue, s.rating, s.efficiency + "%"])
    const csv = [
      ["Staff Performance Report"],
      ["Period", timeFilter],
      [""],
      headers,
      ...rows,
      [""],
      ["Summary"],
      ["Total Appointments", totalAppointments],
      ["Total Revenue", totalRevenue],
      ["Average Rating", avgRating],
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `staff-report-${timeFilter}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Staff Reports</h1>
            <p className="text-muted-foreground">Employee performance analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Popover open={showCustomDate && timeFilter === "custom"} onOpenChange={setShowCustomDate}>
              <PopoverTrigger asChild>
                <div>
                  <Select value={timeFilter} onValueChange={(v) => { setTimeFilter(v); if (v === "custom") setShowCustomDate(true) }}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">From</Label>
                    <Input type="date" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">To</Label>
                    <Input type="date" value={customDateTo} onChange={(e) => setCustomDateTo(e.target.value)} />
                  </div>
                  <Button size="sm" className="w-full" onClick={() => setShowCustomDate(false)}>Apply</Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Total Staff</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{staffPerformance.length}</p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Total Appointments</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{totalAppointments}</p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-semibold text-foreground mt-1">৳{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Avg. Rating</p>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-2xl font-semibold text-foreground">{avgRating}</p>
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
          </div>
        </div>

        {/* Performance Table */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-foreground">Staff Performance</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Appointments</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Efficiency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffPerformance.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">{getInitials(staff.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{staff.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>{staff.appointments}</TableCell>
                  <TableCell className="font-medium">৳{staff.revenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{staff.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${staff.efficiency}%` }} />
                      </div>
                      <span className="text-sm">{staff.efficiency}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h4 className="text-sm text-muted-foreground mb-3">Most Appointments</h4>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">SR</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Md. Sohel Rana</p>
                <p className="text-sm text-muted-foreground">62 appointments</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <h4 className="text-sm text-muted-foreground mb-3">Highest Revenue</h4>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">RA</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Rumana Akter</p>
                <p className="text-sm text-muted-foreground">৳67,500 revenue</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <h4 className="text-sm text-muted-foreground mb-3">Top Rated</h4>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">SP</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Shahnaz Parvin</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm text-muted-foreground">4.9 rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
