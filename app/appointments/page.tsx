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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Calendar, Clock, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Appointment {
  id: string
  client: string
  service: string
  employee: string
  date: string
  time: string
  status: "Scheduled" | "Completed" | "Cancelled" | "No Show"
  type: "Online" | "Walk-in"
}

const initialAppointments: Appointment[] = [
  {
    id: "1",
    client: "Priya Sharma",
    service: "Haircut - Women",
    employee: "Anjali Verma",
    date: "2026-04-06",
    time: "10:00 AM",
    status: "Completed",
    type: "Online",
  },
  {
    id: "2",
    client: "Rahul Kumar",
    service: "Haircut - Men",
    employee: "Vikram Singh",
    date: "2026-04-06",
    time: "11:30 AM",
    status: "Completed",
    type: "Walk-in",
  },
  {
    id: "3",
    client: "Meera Patel",
    service: "Hair Spa",
    employee: "Anjali Verma",
    date: "2026-04-05",
    time: "02:00 PM",
    status: "Completed",
    type: "Online",
  },
  {
    id: "4",
    client: "Amit Gupta",
    service: "Facial - Basic",
    employee: "Sunita Rao",
    date: "2026-04-07",
    time: "03:30 PM",
    status: "Scheduled",
    type: "Walk-in",
  },
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    client: "",
    service: "",
    employee: "",
    date: "",
    time: "",
    type: "Online" as const,
  })

  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.client.toLowerCase().includes(search.toLowerCase()) ||
      apt.service.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddAppointment = () => {
    if (newAppointment.client && newAppointment.service && newAppointment.date) {
      setAppointments([
        ...appointments,
        {
          id: Date.now().toString(),
          ...newAppointment,
          status: "Scheduled",
        },
      ])
      setNewAppointment({
        client: "",
        service: "",
        employee: "",
        date: "",
        time: "",
        type: "Online",
      })
      setIsDialogOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700"
      case "Scheduled":
        return "bg-blue-100 text-blue-700"
      case "Cancelled":
        return "bg-red-100 text-red-700"
      case "No Show":
        return "bg-amber-100 text-amber-700"
      default:
        return "bg-gray-100 text-gray-700"
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
                  <Label>Type</Label>
                  <Select
                    value={newAppointment.type}
                    onValueChange={(value: "Online" | "Walk-in") =>
                      setNewAppointment({ ...newAppointment, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Walk-in">Walk-in</SelectItem>
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

        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.client}</TableCell>
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
                    <span className="text-sm">{appointment.type}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
