"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
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
import { Plus, Search, Calendar, Clock, MoreHorizontal, Upload, Download, ChevronDown, Eye, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type AppointmentStatus = "Pending" | "Confirmed" | "Checked In" | "In Service" | "Completed" | "Cancelled"
type AppointmentSource = "Online" | "Walk In" | "Call"

interface Appointment {
  id: string
  client: string
  phone: string
  service: string
  employee: string
  date: string
  time: string
  status: AppointmentStatus
  source: AppointmentSource
}

const initialAppointments: Appointment[] = [
  {
    id: "1",
    client: "Priya Sharma",
    phone: "9876543210",
    service: "Haircut - Women",
    employee: "Anjali Verma",
    date: "2026-04-06",
    time: "10:00 AM",
    status: "Completed",
    source: "Online",
  },
  {
    id: "2",
    client: "Rahul Kumar",
    phone: "9876543211",
    service: "Haircut - Men",
    employee: "Vikram Singh",
    date: "2026-04-06",
    time: "11:30 AM",
    status: "Checked In",
    source: "Walk In",
  },
  {
    id: "3",
    client: "Meera Patel",
    phone: "9876543212",
    service: "Hair Spa",
    employee: "Anjali Verma",
    date: "2026-04-05",
    time: "02:00 PM",
    status: "Pending",
    source: "Online",
  },
  {
    id: "4",
    client: "Amit Gupta",
    phone: "9876543213",
    service: "Facial - Basic",
    employee: "Sunita Rao",
    date: "2026-04-07",
    time: "03:30 PM",
    status: "Confirmed",
    source: "Call",
  },
]

const statusOptions: AppointmentStatus[] = ["Pending", "Confirmed", "Checked In", "In Service", "Completed", "Cancelled"]
const sourceOptions: AppointmentSource[] = ["Online", "Walk In", "Call"]
const timeFilterOptions = ["All Time", "Today", "This Week", "This Month", "Last 6 Months", "This Year", "Custom Date"]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [searchName, setSearchName] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [timeFilter, setTimeFilter] = useState("All Time")
  const [sourceFilter, setSourceFilter] = useState("All Sources")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [newAppointment, setNewAppointment] = useState({
    client: "",
    phone: "",
    service: "",
    employee: "",
    date: "",
    time: "",
    source: "Online" as AppointmentSource,
  })

  const filteredAppointments = appointments.filter((apt) => {
    const matchesName = apt.client.toLowerCase().includes(searchName.toLowerCase())
    const matchesPhone = apt.phone.includes(searchPhone)
    const matchesSource = sourceFilter === "All Sources" || apt.source === sourceFilter
    const matchesStatus = statusFilter === "All Status" || apt.status === statusFilter
    
    // Time filter logic
    let matchesTime = true
    if (timeFilter !== "All Time") {
      const aptDate = new Date(apt.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      switch (timeFilter) {
        case "Today":
          matchesTime = aptDate.toDateString() === today.toDateString()
          break
        case "This Week":
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          matchesTime = aptDate >= weekStart && aptDate <= weekEnd
          break
        case "This Month":
          matchesTime = aptDate.getMonth() === today.getMonth() && aptDate.getFullYear() === today.getFullYear()
          break
        case "Last 6 Months":
          const sixMonthsAgo = new Date(today)
          sixMonthsAgo.setMonth(today.getMonth() - 6)
          matchesTime = aptDate >= sixMonthsAgo
          break
        case "This Year":
          matchesTime = aptDate.getFullYear() === today.getFullYear()
          break
      }
    }
    
    return matchesName && matchesPhone && matchesSource && matchesStatus && matchesTime
  })

  const handleAddAppointment = () => {
    if (newAppointment.client && newAppointment.service && newAppointment.date) {
      setAppointments([
        ...appointments,
        {
          id: Date.now().toString(),
          ...newAppointment,
          status: "Pending",
        },
      ])
      setNewAppointment({
        client: "",
        phone: "",
        service: "",
        employee: "",
        date: "",
        time: "",
        source: "Online",
      })
      setIsDialogOpen(false)
    }
  }

  const handleStatusChange = (appointmentId: string, newStatus: AppointmentStatus) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ))
  }

  const handleEditAppointment = () => {
    if (selectedAppointment) {
      setAppointments(appointments.map(apt =>
        apt.id === selectedAppointment.id ? selectedAppointment : apt
      ))
      setEditDialogOpen(false)
      setSelectedAppointment(null)
    }
  }

  const handleDeleteAppointment = () => {
    if (selectedAppointment) {
      setAppointments(appointments.filter(apt => apt.id !== selectedAppointment.id))
      setDeleteDialogOpen(false)
      setSelectedAppointment(null)
    }
  }

  const exportToCSV = () => {
    const headers = ["Client", "Phone", "Service", "Employee", "Date", "Time", "Status", "Source"]
    const csvData = filteredAppointments.map(apt => 
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
        const imported = lines.filter(line => line.trim()).map((line, index) => {
          const [client, phone, service, employee, date, time, status, source] = line.split(",")
          return {
            id: `imported-${Date.now()}-${index}`,
            client: client?.trim() || "",
            phone: phone?.trim() || "",
            service: service?.trim() || "",
            employee: employee?.trim() || "",
            date: date?.trim() || "",
            time: time?.trim() || "",
            status: (status?.trim() as AppointmentStatus) || "Pending",
            source: (source?.trim() as AppointmentSource) || "Online",
          }
        })
        setAppointments([...appointments, ...imported])
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
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Appointments</h1>
            <p className="text-muted-foreground">Manage your salon appointments</p>
          </div>
          <div className="flex items-center gap-3">
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Client Name</Label>
                    <Input
                      value={newAppointment.client}
                      onChange={(e) =>
                        setNewAppointment({ ...newAppointment, client: e.target.value })
                      }
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={newAppointment.phone}
                      onChange={(e) =>
                        setNewAppointment({ ...newAppointment, phone: e.target.value })
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label>Service</Label>
                    <Select
                      value={newAppointment.service}
                      onValueChange={(value) =>
                        setNewAppointment({ ...newAppointment, service: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Haircut - Men">Haircut - Men</SelectItem>
                        <SelectItem value="Haircut - Women">Haircut - Women</SelectItem>
                        <SelectItem value="Hair Spa">Hair Spa</SelectItem>
                        <SelectItem value="Facial - Basic">Facial - Basic</SelectItem>
                        <SelectItem value="Threading - Eyebrow">Threading - Eyebrow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Employee</Label>
                    <Select
                      value={newAppointment.employee}
                      onValueChange={(value) =>
                        setNewAppointment({ ...newAppointment, employee: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Anjali Verma">Anjali Verma</SelectItem>
                        <SelectItem value="Vikram Singh">Vikram Singh</SelectItem>
                        <SelectItem value="Sunita Rao">Sunita Rao</SelectItem>
                        <SelectItem value="Raj Malhotra">Raj Malhotra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newAppointment.date}
                        onChange={(e) =>
                          setNewAppointment({ ...newAppointment, date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={newAppointment.time}
                        onChange={(e) =>
                          setNewAppointment({ ...newAppointment, time: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Source</Label>
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
                  <Button onClick={handleAddAppointment} className="w-full">
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
                  {timeFilterOptions.map(option => (
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
                  {sourceOptions.map(option => (
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
                  {statusOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {filteredAppointments.length} results
              </span>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
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
                      <span>{appointment.time}</span>
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
                        {statusOptions.map(status => (
                          <DropdownMenuItem 
                            key={status}
                            onClick={() => handleStatusChange(appointment.id, status)}
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
                        <DropdownMenuItem onClick={() => {
                          setSelectedAppointment(appointment)
                          setViewDialogOpen(true)
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedAppointment({...appointment})
                          setEditDialogOpen(true)
                        }}>
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
              ))}
            </TableBody>
          </Table>
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
                    <p className="font-medium">{selectedAppointment.time}</p>
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
              </DialogContent>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Client Name</Label>
                  <Input
                    value={selectedAppointment.client}
                    onChange={(e) =>
                      setSelectedAppointment({ ...selectedAppointment, client: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={selectedAppointment.phone}
                    onChange={(e) =>
                      setSelectedAppointment({ ...selectedAppointment, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Service</Label>
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
                      <SelectItem value="Haircut - Men">Haircut - Men</SelectItem>
                      <SelectItem value="Haircut - Women">Haircut - Women</SelectItem>
                      <SelectItem value="Hair Spa">Hair Spa</SelectItem>
                      <SelectItem value="Facial - Basic">Facial - Basic</SelectItem>
                      <SelectItem value="Threading - Eyebrow">Threading - Eyebrow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Employee</Label>
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
                      <SelectItem value="Anjali Verma">Anjali Verma</SelectItem>
                      <SelectItem value="Vikram Singh">Vikram Singh</SelectItem>
                      <SelectItem value="Sunita Rao">Sunita Rao</SelectItem>
                      <SelectItem value="Raj Malhotra">Raj Malhotra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={selectedAppointment.date}
                      onChange={(e) =>
                        setSelectedAppointment({ ...selectedAppointment, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={selectedAppointment.time}
                      onChange={(e) =>
                        setSelectedAppointment({ ...selectedAppointment, time: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
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
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleEditAppointment} className="w-full">
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
    </DashboardLayout>
  )
}
