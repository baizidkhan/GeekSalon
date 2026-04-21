"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Calendar, Clock, MoreHorizontal, Upload, Download, ChevronDown, Eye, Pencil, Trash2, User, Phone, Scissors, UserCheck, Globe, Zap } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from "@/api/appointments/appointments"
import { getClients } from "@/api/clients/clients"
import { getActiveServices } from "@/api/services/services"
import { getBasicEmployees } from "@/api/employees/employees"

interface AppointmentRecord {
  id: string
  clientName: string
  phoneNumber: string
  date: string
  time: string
  staff: string | null
  services: string[] | null
  source: string
  status: string
}

interface ClientOption {
  id: string
  name: string
  phone: string
}

type AppointmentStatus = "Pending" | "Confirmed" | "Checked In" | "In Service" | "Completed" | "Cancelled"
type AppointmentSource = "Online" | "Walk In" | "Call"

interface Appointment {
  id: string
  client: string
  phone: string
  service: string
  employee: string
  date: string
  /** Always stored as 24-hour "HH:MM" for form inputs */
  time: string
  status: AppointmentStatus
  source: AppointmentSource
}

const statusOptions: AppointmentStatus[] = ["Pending", "Confirmed", "Checked In", "In Service", "Completed", "Cancelled"]
const sourceOptions: AppointmentSource[] = ["Online", "Walk In", "Call"]
const timeFilterOptions = ["All Time", "Today", "This Week", "This Month", "Last 6 Months", "This Year", "Custom Date"]
const PAGE_SIZE = 10

/** Convert any server time value to 24h "HH:MM" for <input type="time"> */
function toInputTime(t: string): string {
  if (!t) return ""
  // "HH:MM AM/PM" format
  const ampmMatch = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1])
    const m = ampmMatch[2]
    const ampm = ampmMatch[3].toUpperCase()
    if (ampm === "PM" && h !== 12) h += 12
    if (ampm === "AM" && h === 12) h = 0
    return `${String(h).padStart(2, "0")}:${m}`
  }
  // "HH:MM:SS" or "HH:MM"
  return t.substring(0, 5)
}

/** Display time as "H:MM AM/PM" in the table */
function formatTimeDisplay(t: string): string {
  if (!t) return ""
  const [hStr, mStr] = t.split(":")
  const h = parseInt(hStr)
  const m = mStr ?? "00"
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function normalizeSource(raw: string): AppointmentSource {
  const s = (raw ?? "").toLowerCase().replace(/[-_]/g, " ").trim()
  if (s === "walk in" || s === "walkin") return "Walk In"
  if (s === "call") return "Call"
  return "Online"
}

function toUIAppointment(r: AppointmentRecord): Appointment {
  return {
    id: r.id,
    client: r.clientName,
    phone: r.phoneNumber,
    service: (r.services ?? []).join(", "),
    employee: r.staff ?? "",
    date: r.date,
    time: toInputTime(r.time),
    status: r.status as AppointmentStatus,
    source: normalizeSource(r.source),
  }
}

const emptyForm = {
  client: "",
  phone: "",
  service: "",
  employee: "",
  date: "",
  time: "",
  source: "Online" as AppointmentSource,
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [serviceOptions, setServiceOptions] = useState<string[]>([])
  const [employeeOptions, setEmployeeOptions] = useState<string[]>([])
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([])

  const [searchName, setSearchName] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [timeFilter, setTimeFilter] = useState("All Time")
  const [sourceFilter, setSourceFilter] = useState("All Sources")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [currentPage, setCurrentPage] = useState(1)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [newAppointment, setNewAppointment] = useState(emptyForm)
  const [nameLocked, setNameLocked] = useState(false)

  const normalizePhone = (value: string) => value.replace(/\D/g, "")

  const syncClientFromPhone = useCallback((phoneValue: string) => {
    const normalizedPhone = normalizePhone(phoneValue)
    if (!normalizedPhone) {
      setNameLocked(false)
      setNewAppointment((current) => ({ ...current, client: "" }))
      return
    }

    const matchedClient = clientOptions.find((client) => normalizePhone(client.phone) === normalizedPhone)
    if (matchedClient) {
      setNameLocked(true)
      setNewAppointment((current) => ({ ...current, client: matchedClient.name }))
      return
    }

    setNameLocked(false)
    setNewAppointment((current) => ({ ...current, client: "" }))
  }, [clientOptions])

  useEffect(() => {
    syncClientFromPhone(newAppointment.phone)
  }, [newAppointment.phone, clientOptions, syncClientFromPhone])

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getAppointments({ page: 1, limit: 1000 })
      const list: AppointmentRecord[] = res?.data ?? res ?? []
      setAppointments(list.map(toUIAppointment))
    } catch (err) {
      console.error("Failed to fetch appointments", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchClients = useCallback(async () => {
    const res = await getClients(1, 1000)
    const list = res?.data ?? res ?? []
    setClientOptions(list.map((client: any) => ({ id: client.id, name: client.name, phone: client.phone })))
  }, [])

  useEffect(() => {
    fetchAppointments()
    getActiveServices()
      .then((list: { name: string }[]) => setServiceOptions(list.map((s) => s.name)))
      .catch(console.error)
    getBasicEmployees()
      .then((list: { name: string }[]) => setEmployeeOptions(list.map((e) => e.name)))
      .catch(console.error)
    fetchClients()
      .catch(console.error)
  }, [fetchAppointments, fetchClients])

  const filteredAppointments = appointments.filter((apt) => {
    const matchesName = apt.client.toLowerCase().includes(searchName.toLowerCase())
    const matchesPhone = apt.phone.includes(searchPhone)
    const matchesSource = sourceFilter === "All Sources" || apt.source === sourceFilter
    const matchesStatus = statusFilter === "All Status" || apt.status === statusFilter

    let matchesTime = true
    if (timeFilter !== "All Time") {
      const aptDate = new Date(apt.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      switch (timeFilter) {
        case "Today":
          matchesTime = aptDate.toDateString() === today.toDateString()
          break
        case "This Week": {
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          matchesTime = aptDate >= weekStart && aptDate <= weekEnd
          break
        }
        case "This Month":
          matchesTime =
            aptDate.getMonth() === today.getMonth() &&
            aptDate.getFullYear() === today.getFullYear()
          break
        case "Last 6 Months": {
          const sixMonthsAgo = new Date(today)
          sixMonthsAgo.setMonth(today.getMonth() - 6)
          matchesTime = aptDate >= sixMonthsAgo
          break
        }
        case "This Year":
          matchesTime = aptDate.getFullYear() === today.getFullYear()
          break
      }
    }

    return matchesName && matchesPhone && matchesSource && matchesStatus && matchesTime
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchName, searchPhone, timeFilter, sourceFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE))
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleAddAppointment = async () => {
    if (!newAppointment.client || !newAppointment.service || !newAppointment.date) return
    try {
      await createAppointment({
        clientName: newAppointment.client,
        phoneNumber: newAppointment.phone,
        date: newAppointment.date,
        time: newAppointment.time,
        staff: newAppointment.employee || undefined,
        services: newAppointment.service ? [newAppointment.service] : undefined,
        source: newAppointment.source,
      })
      setNewAppointment(emptyForm)
      setNameLocked(false)
      setIsDialogOpen(false)
      fetchAppointments()
    } catch (err) {
      console.error("Failed to create appointment", err)
    }
  }

  const handleStatusChange = async (appointment: Appointment, newStatus: AppointmentStatus) => {
    try {
      await updateAppointment(appointment.phone, { status: newStatus })
      fetchAppointments()
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  const handleEditAppointment = async () => {
    if (!selectedAppointment) return
    try {
      await updateAppointment(selectedAppointment.phone, {
        clientName: selectedAppointment.client,
        date: selectedAppointment.date,
        time: selectedAppointment.time,
        staff: selectedAppointment.employee || undefined,
        services: selectedAppointment.service ? [selectedAppointment.service] : undefined,
        status: selectedAppointment.status,
        source: selectedAppointment.source,
      })
      setEditDialogOpen(false)
      setSelectedAppointment(null)
      fetchAppointments()
    } catch (err) {
      console.error("Failed to update appointment", err)
    }
  }

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return
    try {
      await deleteAppointment(selectedAppointment.id)
      setDeleteDialogOpen(false)
      setSelectedAppointment(null)
      fetchAppointments()
    } catch (err) {
      console.error("Failed to delete appointment", err)
    }
  }

  const exportToCSV = () => {
    const headers = ["Client", "Phone", "Service", "Employee", "Date", "Time", "Status", "Source"]
    const csvData = filteredAppointments.map((apt) =>
      [apt.client, apt.phone, apt.service, apt.employee, apt.date, apt.time, apt.status, apt.source].join(",")
    )
    const csv = [headers.join(","), ...csvData].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "appointments.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split("\n").slice(1)
        const promises = lines
          .filter((line) => line.trim())
          .map((line) => {
            const [client, phone, service, employee, date, time, , source] = line.split(",")
            return createAppointment({
              clientName: client?.trim() ?? "",
              phoneNumber: phone?.trim() ?? "",
              services: service?.trim() ? [service.trim()] : undefined,
              staff: employee?.trim() || undefined,
              date: date?.trim() ?? "",
              time: time?.trim() ?? "",
              source: source?.trim() || "Online",
            })
          })
        Promise.allSettled(promises).then(() => fetchAppointments())
      }
      reader.readAsText(file)
    }
    event.target.value = ""
  }

  const getStatusButtonStyle = (status: AppointmentStatus) => {
    switch (status) {
      case "Completed":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
      case "Confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
      case "Checked In":
        return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
      case "In Service":
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
      case "Pending":
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
    }
  }

  return (
    <div className="premium-page p-4 sm:p-6 md:p-8">
      <div className="flex flex-wrap gap-3 items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary/70 uppercase mb-1">Schedule</p>
          <h1 className="text-2xl font-semibold text-foreground">Appointments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your salon appointments</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="import-csv">
            <input
              id="import-csv"
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </span>
            </Button>
          </label>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setNewAppointment(emptyForm)
                setNameLocked(false)
                return
              }
              fetchClients().catch(console.error)
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[620px]">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>
              <div className="mt-2 space-y-5">
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold tracking-wide">Phone Number</Label>
                  <Input
                    value={newAppointment.phone}
                    onChange={(e) => {
                      const nextPhone = e.target.value
                      setNewAppointment({ ...newAppointment, phone: nextPhone })
                      syncClientFromPhone(nextPhone)
                    }}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold tracking-wide">Client Name</Label>
                  <Input
                    value={newAppointment.client}
                    onChange={(e) => setNewAppointment({ ...newAppointment, client: e.target.value })}
                    placeholder={nameLocked ? "Client name matched from phone" : "Enter client name"}
                    readOnly={nameLocked}
                    disabled={nameLocked}
                    className={nameLocked ? "bg-muted cursor-not-allowed" : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold tracking-wide">Service</Label>
                  <Select
                    value={newAppointment.service}
                    onValueChange={(value) => setNewAppointment({ ...newAppointment, service: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold tracking-wide">Employee</Label>
                  <Select
                    value={newAppointment.employee}
                    onValueChange={(value) => setNewAppointment({ ...newAppointment, employee: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeOptions.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold tracking-wide">Date</Label>
                    <Input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold tracking-wide">Time</Label>
                    <Input
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold tracking-wide">Source</Label>
                  <Select
                    value={newAppointment.source}
                    onValueChange={(value: AppointmentSource) =>
                      setNewAppointment({ ...newAppointment, source: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Walk In">Walk In</SelectItem>
                      <SelectItem value="Call">Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddAppointment} className="mt-1 w-full h-10">
                  Schedule Appointment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by client name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone number..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeFilterOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Sources">All Sources</SelectItem>
                {sourceOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {loading ? "Loading..." : `${filteredAppointments.length} results`}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary/60" />Client</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-primary/60" />Phone</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-primary/60" />Service</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-primary/60" />Employee</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary/60" />Date & Time</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-primary/60" />Source</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary/60" />Status</span></TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading appointments...
                  </TableCell>
                </TableRow>
              ) : filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No appointments found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.client}</TableCell>
                    <TableCell>{appointment.phone}</TableCell>
                    <TableCell>{appointment.service}</TableCell>
                    <TableCell>{appointment.employee}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{appointment.date}</span>
                        <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                        <span>{formatTimeDisplay(appointment.time)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{appointment.source}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${getStatusButtonStyle(appointment.status)} min-w-[110px] justify-between`}
                          >
                            {appointment.status}
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {statusOptions.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusChange(appointment, status)}
                              className={appointment.status === status ? "bg-accent" : ""}
                            >
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setViewDialogOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAppointment({ ...appointment })
                              setEditDialogOpen(true)
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {!loading && filteredAppointments.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredAppointments.length)} of {filteredAppointments.length} entries
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs">Page {currentPage} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Client Name</Label>
                  <p className="font-medium">{selectedAppointment.client}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedAppointment.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Service</Label>
                  <p className="font-medium">{selectedAppointment.service}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Employee</Label>
                  <p className="font-medium">{selectedAppointment.employee}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{selectedAppointment.date}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time</Label>
                  <p className="font-medium">{formatTimeDisplay(selectedAppointment.time)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Source</Label>
                  <p className="font-medium">{selectedAppointment.source}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">{selectedAppointment.status}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="mt-2 space-y-5">
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold tracking-wide">Client Name</Label>
                <Input
                  value={selectedAppointment.client}
                  onChange={(e) =>
                    setSelectedAppointment({ ...selectedAppointment, client: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold tracking-wide">Phone Number</Label>
                <Input
                  value={selectedAppointment.phone}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold tracking-wide">Service</Label>
                <Select
                  value={selectedAppointment.service}
                  onValueChange={(value) =>
                    setSelectedAppointment({ ...selectedAppointment, service: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold tracking-wide">Employee</Label>
                <Select
                  value={selectedAppointment.employee}
                  onValueChange={(value) =>
                    setSelectedAppointment({ ...selectedAppointment, employee: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeOptions.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold tracking-wide">Date</Label>
                  <Input
                    type="date"
                    value={selectedAppointment.date}
                    onChange={(e) =>
                      setSelectedAppointment({ ...selectedAppointment, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold tracking-wide">Time</Label>
                  <Input
                    type="time"
                    value={selectedAppointment.time}
                    onChange={(e) =>
                      setSelectedAppointment({ ...selectedAppointment, time: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold tracking-wide">Status</Label>
                <Select
                  value={selectedAppointment.status}
                  onValueChange={(value: AppointmentStatus) =>
                    setSelectedAppointment({ ...selectedAppointment, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEditAppointment} className="mt-1 h-10 w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete the appointment for{" "}
            <span className="font-medium text-foreground">{selectedAppointment?.client}</span>?
            This action cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAppointment}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
