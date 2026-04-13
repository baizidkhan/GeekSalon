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
import { Plus, Search, Phone, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Employee {
  id: string
  name: string
  role: string
  phone: string
  email: string
  joinDate: string
  status: "Active" | "On Leave" | "Inactive"
  specializations: string[]
}

const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Rumana Akter",
    role: "Senior Stylist",
    phone: "+880 1711-111111",
    email: "rumana@salonbos.com",
    joinDate: "2024-01-15",
    status: "Active",
    specializations: ["Hair Styling", "Hair Coloring", "Hair Spa"],
  },
  {
    id: "2",
    name: "Md. Sohel Rana",
    role: "Barber",
    phone: "+880 1812-222222",
    email: "sohel@salonbos.com",
    joinDate: "2024-03-01",
    status: "Active",
    specializations: ["Men Haircut", "Beard Styling"],
  },
  {
    id: "3",
    name: "Shahnaz Parvin",
    role: "Beautician",
    phone: "+880 1911-333333",
    email: "shahnaz@salonbos.com",
    joinDate: "2024-02-10",
    status: "Active",
    specializations: ["Facials", "Skin Care", "Threading"],
  },
  {
    id: "4",
    name: "Taslima Khanam",
    role: "Nail Technician",
    phone: "+880 1611-444444",
    email: "taslima@salonbos.com",
    joinDate: "2024-04-01",
    status: "Active",
    specializations: ["Manicure", "Pedicure", "Nail Art"],
  },
]

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
  })

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddEmployee = () => {
    if (newEmployee.name && newEmployee.role && newEmployee.phone) {
      setEmployees([
        ...employees,
        {
          id: Date.now().toString(),
          name: newEmployee.name,
          role: newEmployee.role,
          phone: newEmployee.phone,
          email: newEmployee.email,
          joinDate: new Date().toISOString().split("T")[0],
          status: "Active",
          specializations: [],
        },
      ])
      setNewEmployee({ name: "", role: "", phone: "", email: "" })
      setIsDialogOpen(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "On Leave":
        return "bg-amber-100 text-amber-700"
      case "Inactive":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Employees</h1>
            <p className="text-muted-foreground">Manage your salon staff</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select
                    value={newEmployee.role}
                    onValueChange={(value) =>
                      setNewEmployee({ ...newEmployee, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Senior Stylist">Senior Stylist</SelectItem>
                      <SelectItem value="Junior Stylist">Junior Stylist</SelectItem>
                      <SelectItem value="Barber">Barber</SelectItem>
                      <SelectItem value="Beautician">Beautician</SelectItem>
                      <SelectItem value="Nail Technician">Nail Technician</SelectItem>
                      <SelectItem value="Receptionist">Receptionist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={newEmployee.phone}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                </div>
                <Button onClick={handleAddEmployee} className="w-full">
                  Add Employee
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specializations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Since {employee.joinDate}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      {employee.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {employee.specializations.slice(0, 2).map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 bg-secondary rounded text-xs"
                        >
                          {spec}
                        </span>
                      ))}
                      {employee.specializations.length > 2 && (
                        <span className="px-2 py-0.5 bg-secondary rounded text-xs">
                          +{employee.specializations.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        employee.status
                      )}`}
                    >
                      {employee.status}
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
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Schedule</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
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
