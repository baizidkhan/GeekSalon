"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  DialogDescription,
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
import { Plus, Search, Calendar, Clock, MoreHorizontal, Upload, Download, ChevronDown, Eye, Pencil, Trash2, User, Phone, Scissors, UserCheck, Globe, Zap, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from "@/api/appointments/appointments"
import { getClients } from "@/api/clients/clients"
import { getActiveServices } from "@/api/services/services"
import { getStylists } from "@/api/employees/employees"
import { getAppointmentSettings, getInvoiceSettings } from "@/api/settings/settings"
import { toast } from "sonner"

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

function escapeCsvValue(value: string | null | undefined): string {
  const safeValue = (value ?? "").toString()
  const escapedValue = safeValue.replace(/"/g, '""')
  if (/[",\n]/.test(escapedValue)) {
    return `"${escapedValue}"`
  }
  return escapedValue
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === "," && !inQuotes) {
      values.push(current)
      current = ""
      continue
    }

    current += char
  }

  values.push(current)
  return values
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
  services: [] as string[],
  employee: "",
  date: "",
  time: "",
  source: "Online" as AppointmentSource,
}

type NewAppointmentField = "phone" | "client" | "services" | "employee" | "date" | "time"

export default function AppointmentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [serviceOptions, setServiceOptions] = useState<{ name: string; price: number }[]>([])
  const [employeeOptions, setEmployeeOptions] = useState<string[]>([])
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([])

  const [searchName, setSearchName] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [timeFilter, setTimeFilter] = useState(() => {
    const param = searchParams.get("timeFilter")
    return param && timeFilterOptions.includes(param) ? param : "All Time"
  })
  const [sourceFilter, setSourceFilter] = useState("All Sources")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [currentPage, setCurrentPage] = useState(1)
  const [taxRate, setTaxRate] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [newAppointment, setNewAppointment] = useState(emptyForm)
  const [nameLocked, setNameLocked] = useState(false)
  const [newAppointmentErrors, setNewAppointmentErrors] = useState<Partial<Record<NewAppointmentField, string>>>({})
  const [minDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })
  const [maxDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 60)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })
  const [openTime, setOpenTime] = useState("")
  const [closeTime, setCloseTime] = useState("")

  useEffect(() => {
  }, [])


  const normalizePhone = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "")
    if (digitsOnly.startsWith("8801") && digitsOnly.length === 13) return digitsOnly
    if (digitsOnly.startsWith("01") && digitsOnly.length === 11) return digitsOnly
    if (digitsOnly.startsWith("1") && digitsOnly.length === 10) return `0${digitsOnly}`
    return digitsOnly
  }

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
      .then((list: { name: string; price: number }[]) => setServiceOptions(list.map((s) => ({ name: s.name, price: s.price }))))
      .catch(console.error)
    getStylists()
      .then((list: { name: string }[]) => setEmployeeOptions(list.map((e) => e.name)))
      .catch(console.error)
    fetchClients()
      .catch(console.error)
    getAppointmentSettings()
      .then((settings) => {
        if (settings?.openingTime) setOpenTime(settings.openingTime.substring(0, 5))
        if (settings?.closingTime) setCloseTime(settings.closingTime.substring(0, 5))
      })
      .catch(console.error)
    getInvoiceSettings()
      .then((settings) => {
        if (settings?.taxRate) setTaxRate(Number(settings.taxRate))
      })
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

  const clearNewAppointmentError = (field: NewAppointmentField) => {
    setNewAppointmentErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const validateNewAppointment = () => {
    const errors: Partial<Record<NewAppointmentField, string>> = {}
    if (!newAppointment.phone.trim()) errors.phone = "Please fill this field."
    if (!newAppointment.client.trim()) errors.client = "Please fill this field."
    if (newAppointment.services.length === 0) errors.services = "Please select at least one service."
    if (!newAppointment.employee.trim()) errors.employee = "Please fill this field."
    if (!newAppointment.date.trim()) {
      errors.date = "Please fill this field."
    } else {
      if (newAppointment.date < minDate) errors.date = "Please select a valid upcoming date."
      if (newAppointment.date > maxDate) errors.date = "Date cannot exceed 60 days."
    }

    if (!newAppointment.time.trim()) {
      errors.time = "Please fill this field."
    } else {
      if (openTime && newAppointment.time < openTime) errors.time = `Time cannot be before ${openTime} and after ${closeTime}.`
      if (closeTime && newAppointment.time > closeTime) errors.time = `Time cannot be before ${openTime} and after ${closeTime}.`
    }
    return errors
  }

  const handleAddAppointment = async () => {
    const errors = validateNewAppointment()
    setNewAppointmentErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      setIsSubmitting(true)
      await createAppointment({
        clientName: newAppointment.client,
        phoneNumber: normalizePhone(newAppointment.phone),
        date: newAppointment.date,
        time: newAppointment.time,
        staff: newAppointment.employee || undefined,
        services: newAppointment.services.length > 0 ? newAppointment.services : undefined,
        source: newAppointment.source,
      })
      setNewAppointment(emptyForm)
      setNewAppointmentErrors({})
      setNameLocked(false)
      setIsDialogOpen(false)
      fetchAppointments()
      toast.success("Appointment created successfully")
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message
      const parsedMessage = Array.isArray(backendMessage)
        ? backendMessage.join(", ")
        : backendMessage || "Failed to create appointment"
      toast.error(parsedMessage)
      console.error("Failed to create appointment", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (appointment: Appointment, newStatus: AppointmentStatus) => {
    if (newStatus === "Confirmed" && !appointment.employee?.trim()) {
      toast.error("Employee should be selected for updating the status")
      setSelectedAppointment({ ...appointment, status: "Confirmed" })
      setEditDialogOpen(true)
      return
    }

    try {
      setIsSubmitting(true)
      await updateAppointment(appointment.id, {
        status: newStatus,
        staff: appointment.employee || undefined,
      })
      fetchAppointments()
      if (newStatus === "Confirmed") {
        router.push("/billing")
      }
    } catch (err) {
      console.error("Failed to update status", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditAppointment = async () => {
    if (!selectedAppointment) return
    try {
      setIsSubmitting(true)
      await updateAppointment(selectedAppointment.id, {
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return
    try {
      setIsSubmitting(true)
      await deleteAppointment(selectedAppointment.id)
      setDeleteDialogOpen(false)
      setSelectedAppointment(null)
      fetchAppointments()
    } catch (err) {
      console.error("Failed to delete appointment", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportToCSV = () => {
    const headers = ["Client", "Phone", "Service", "Employee", "Date", "Time", "Status", "Source"]
    const csvData = filteredAppointments.map((apt) =>
      [apt.client, apt.phone, apt.service, apt.employee, apt.date, apt.time, apt.status, apt.source]
        .map((value) => escapeCsvValue(value ?? ""))
        .join(",")
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
            const [client, phone, service, employee, date, time, , source] = parseCsvLine(line.trim())
            return createAppointment({
              clientName: client?.trim() ?? "",
              phoneNumber: phone?.trim() ?? "",
              services: service?.trim()
                ? service.split(",").map((svc) => svc.trim()).filter(Boolean)
                : undefined,
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
                setNewAppointmentErrors({})
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
                <DialogDescription>
                  Fill in the required details to create a new appointment.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 space-y-5">
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold tracking-wide">Phone Number <span className="text-destructive">*</span></Label>
                  <Input
                    value={newAppointment.phone}
                    onChange={(e) => {
                      const nextPhone = e.target.value
                      setNewAppointment({ ...newAppointment, phone: nextPhone })
                      if (nextPhone.trim()) clearNewAppointmentError("phone")
                      syncClientFromPhone(nextPhone)
                    }}
                    placeholder="Enter phone number"
                  />
                  {newAppointmentErrors.phone && (
                    <p className="text-xs text-destructive">{newAppointmentErrors.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold tracking-wide">Client Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={newAppointment.client}
                    onChange={(e) => {
                      const nextClient = e.target.value
                      setNewAppointment({ ...newAppointment, client: nextClient })
                      if (nextClient.trim()) clearNewAppointmentError("client")
                    }}
                    placeholder={nameLocked ? "Client name matched from phone" : "Enter client name"}
                    readOnly={nameLocked}
                    disabled={nameLocked}
                    className={nameLocked ? "bg-muted cursor-not-allowed" : undefined}
                  />
                  {newAppointmentErrors.client && (
                    <p className="text-xs text-destructive">{newAppointmentErrors.client}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold tracking-wide">Service <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <span className={newAppointment.services.length === 0 ? "text-muted-foreground" : "text-foreground"}>
                          {newAppointment.services.length === 0
                            ? "Select services"
                            : newAppointment.services.join(", ")}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
                      {serviceOptions.map((s) => (
                        <div
                          key={s.name}
                          className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                          onClick={() => {
                            const selected = newAppointment.services
                            const next = selected.includes(s.name)
                              ? selected.filter((x) => x !== s.name)
                              : [...selected, s.name]
                            setNewAppointment({ ...newAppointment, services: next })
                            if (next.length > 0) clearNewAppointmentError("services")
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox checked={newAppointment.services.includes(s.name)} />
                            <span className="text-sm">{s.name}</span>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">${parseFloat(s.price.toString()).toFixed(2)}</span>
                        </div>
                      ))}
                    </PopoverContent>
                  </Popover>
                  {newAppointmentErrors.services && (
                    <p className="text-xs text-destructive">{newAppointmentErrors.services}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold tracking-wide">Total Price (incl. tax)</Label>
                  <Input
                    value={`$${(() => {
                      const subtotal = newAppointment.services.reduce((acc, serviceName) => {
                        const service = serviceOptions.find((s) => s.name === serviceName)
                        return acc + parseFloat((service?.price || 0).toString())
                      }, 0)
                      const tax = (subtotal * parseFloat(taxRate.toString())) / 100
                      return (subtotal + tax).toFixed(2)
                    })()}`}
                    readOnly
                    className="bg-muted cursor-not-allowed font-medium text-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold tracking-wide">Employee <span className="text-destructive">*</span></Label>
                    <Select
                      value={newAppointment.employee}
                      onValueChange={(value) => {
                        setNewAppointment({ ...newAppointment, employee: value })
                        if (value.trim()) clearNewAppointmentError("employee")
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeeOptions.map((e) => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {newAppointmentErrors.employee && (
                      <p className="text-xs text-destructive">{newAppointmentErrors.employee}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold tracking-wide">Source</Label>
                    <Select
                      value={newAppointment.source}
                      onValueChange={(value: AppointmentSource) =>
                        setNewAppointment({ ...newAppointment, source: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Walk In">Walk In</SelectItem>
                        <SelectItem value="Call">Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold tracking-wide">Date <span className="text-destructive">*</span></Label>
                    <Input
                      type="date"
                      min={minDate}
                      max={maxDate}
                      value={newAppointment.date}
                      onChange={(e) => {
                        const nextDate = e.target.value
                        setNewAppointment({ ...newAppointment, date: nextDate })
                        if (nextDate.trim()) clearNewAppointmentError("date")
                      }}
                    />
                    {newAppointmentErrors.date && (
                      <p className="text-xs text-destructive">{newAppointmentErrors.date}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold tracking-wide">Time <span className="text-destructive">*</span></Label>
                    <Input
                      type="time"
                      min={openTime}
                      max={closeTime}
                      value={newAppointment.time}
                      onChange={(e) => {
                        const nextTime = e.target.value
                        setNewAppointment({ ...newAppointment, time: nextTime })
                        if (nextTime.trim()) clearNewAppointmentError("time")
                      }}
                    />
                    {newAppointmentErrors.time && (
                      <p className="text-xs text-destructive">{newAppointmentErrors.time}</p>
                    )}
                  </div>
                </div>
                <Button onClick={handleAddAppointment} className="mt-1 w-full h-10" disabled={isSubmitting}>
                  {isSubmitting ? "Save Changes...." : "Schedule Appointment"}
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
                          {statusOptions.map((status) => {
                            const isRestricted = ["Checked In", "In Service", "Completed"].includes(status)
                            const canAccess = appointment.status !== "Pending" && appointment.status !== "Cancelled"
                            const isDisabled = isRestricted && !canAccess

                            return (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => !isDisabled && handleStatusChange(appointment, status)}
                                className={`
                                  ${appointment.status === status ? "bg-accent" : ""}
                                  ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                                disabled={isDisabled}
                              >
                                {status}
                              </DropdownMenuItem>
                            )
                          })}
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
            <DialogDescription>
              Review the selected appointment information.
            </DialogDescription>
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
            <DialogDescription>
              Update appointment information and save your changes.
            </DialogDescription>
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
                      <SelectItem key={s.name} value={s.name}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{s.name}</span>
                          <span className="text-muted-foreground">${parseFloat(s.price.toString()).toFixed(2)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold tracking-wide">Total Price (incl. tax)</Label>
                <Input
                  value={`$${(() => {
                    // Split the service string if it contains multiple (though Select only supports one here)
                    const services = selectedAppointment.service ? selectedAppointment.service.split(", ").map(s => s.trim()) : []
                    const subtotal = services.reduce((acc, serviceName) => {
                      const service = serviceOptions.find((s) => s.name === serviceName)
                      return acc + parseFloat((service?.price || 0).toString())
                    }, 0)
                    const tax = (subtotal * parseFloat(taxRate.toString())) / 100
                    return (subtotal + tax).toFixed(2)
                  })()}`}
                  readOnly
                  className="bg-muted cursor-not-allowed font-medium text-primary"
                />
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
                    min={minDate}
                    max={maxDate}
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
                    min={openTime}
                    max={closeTime}
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
              <Button onClick={handleEditAppointment} className="mt-1 h-10 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Save Changes...." : "Save Changes"}
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
            <DialogDescription>
              This action permanently removes the selected appointment.
            </DialogDescription>
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
            <Button variant="destructive" onClick={handleDeleteAppointment} disabled={isSubmitting}>
              {isSubmitting ? "Save Changes...." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
