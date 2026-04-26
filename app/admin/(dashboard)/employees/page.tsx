"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2 } from "lucide-react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Phone, MoreHorizontal, Pencil, Trash2, Eye, User, UserCheck, Scissors, Zap, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  createEmployee,
  getEmployeesFiltered,
  updateEmployee,
  deleteEmployee
} from "@admin/api/employees/employees"
import { getServices } from "@admin/api/services/services"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

export enum EmployeeRole {
  STYLIST = 'Stylist',
  MANAGER = 'Manager',
  RECEPTIONIST = 'Receptionist',
  ASSISTANT = 'Assistant',
  OTHER = 'Other',
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  RESIGNED = 'RESIGNED',
  RETIRED = 'RETIRED',
  PROBATION = 'PROBATION',
  TRAINING = 'TRAINING',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
}

interface Employee {
  id: string
  name: string
  role: EmployeeRole
  phone: string
  email: string
  salary: number
  commission: number
  shift: string
  experience: number
  joinDate: string
  employmentType: EmploymentType
  fingerprintCode: string | null
  specializations: string[]
  status: EmployeeStatus
  image?: string | null
  about?: string | null
}


export default function EmployeesPage() {
  const PAGE_SIZE = 10

  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [serviceOptions, setServiceOptions] = useState<string[]>([])
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: EmployeeRole.OTHER,
    phone: "",
    email: "",
    salary: "0",
    commission: "0",
    shift: "",
    experience: "0",
    joinDate: new Date().toISOString().split('T')[0],
    fingerprintCode: "",
    specializations: [] as string[],
    about: "",
  })

  const [serviceToView, setServiceToView] = useState<Employee | null>(null)
  const [serviceToEdit, setServiceToEdit] = useState<Employee | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<Employee | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const compressToWebP = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(webpFile);
            }
          }, 'image/webp', 0.95); // High quality WebP
        };
      };
    });
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const data = await getEmployeesFiltered()
      const mappedData = data.map((emp: any) => ({
        ...emp,
        specializations: emp.specializations || []
      }))
      setEmployees(mappedData)
    } catch (error) {
      console.error("Failed to fetch employees:", error)
      toast.error("Failed to load employees")
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchEmployees()
    getServices()
      .then((list: { name: string }[]) => setServiceOptions(list.map((s) => s.name)))
      .catch(() => setServiceOptions([]))
  }, [])

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.role.toLowerCase().includes(search.toLowerCase())
    )
  }, [employees, search])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE))
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleAddEmployee = async () => {
    if (newEmployee.name && newEmployee.role && newEmployee.phone && parseFloat(newEmployee.salary) > 0) {
      try {
        setIsAdding(true)
        const cleanPhone = newEmployee.phone.replace(/[\s- ]/g, "").replace(/^\+88/, "88")
        if (!cleanPhone.startsWith('88') && cleanPhone.startsWith('01')) {
          // Keep as is, regex allows optional 88
        }

        const payload: any = {
          name: newEmployee.name.trim(),
          role: newEmployee.role,
          phone: cleanPhone,
          salary: parseFloat(newEmployee.salary) || 0,
          commission: parseFloat(newEmployee.commission) || 0,
          experience: parseInt(newEmployee.experience) || 0,
          status: EmployeeStatus.ACTIVE,
          employmentType: EmploymentType.FULL_TIME,
        }

        if (newEmployee.email?.trim()) payload.email = newEmployee.email.trim()
        if (newEmployee.shift?.trim()) payload.shift = newEmployee.shift.trim()
        if (newEmployee.joinDate) payload.joinDate = newEmployee.joinDate
        if (newEmployee.fingerprintCode?.trim()) payload.fingerprintCode = newEmployee.fingerprintCode.trim()
        if (newEmployee.about?.trim()) payload.about = newEmployee.about.trim()

        if (newEmployee.specializations.length > 0) payload.specializations = newEmployee.specializations

        const formData = new FormData()
        if (imageFile) {
          const webpFile = await compressToWebP(imageFile)
          formData.append('image', webpFile)
        }
        formData.append('data', JSON.stringify(payload))

        await createEmployee(formData)


        toast.success("Employee added successfully")
        setNewEmployee({
          name: "",
          role: EmployeeRole.OTHER,
          phone: "",
          email: "",
          salary: "0",
          commission: "0",
          shift: "",
          experience: "0",
          joinDate: new Date().toISOString().split('T')[0],
          fingerprintCode: "",
          specializations: [],
          about: "",
        })
        setIsAddDialogOpen(false)
        setImageFile(null)
        setImagePreview(null)
        fetchEmployees()
      } catch (error: any) {
        console.log(error)
        console.error("Failed to add employee:", error)
        toast.error(error?.response?.data?.message || "Failed to add employee")
      } finally {
        setIsAdding(false)
      }
    }
  }

  const handleEditSave = async () => {
    if (serviceToEdit) {
      try {
        setIsEditing(true)
        const cleanPhone = serviceToEdit.phone.replace(/[\s-]/g, "")
        const payload = {
          name: serviceToEdit.name,
          role: serviceToEdit.role,
          phone: cleanPhone,
          email: serviceToEdit.email || undefined,
          salary: Number(serviceToEdit.salary) || 0,
          commission: Number(serviceToEdit.commission) || 0,
          shift: serviceToEdit.shift || undefined,
          experience: Number(serviceToEdit.experience) || 0,
          joinDate: serviceToEdit.joinDate || undefined,
          status: serviceToEdit.status,
          employmentType: serviceToEdit.employmentType,
          fingerprintCode: serviceToEdit.fingerprintCode || undefined,
          about: serviceToEdit.about || undefined,
          specializations: Array.isArray(serviceToEdit.specializations)
            ? serviceToEdit.specializations
            : (serviceToEdit.specializations as string).split(',').map(s => s.trim()).filter(s => s !== "")
        }

        const formData = new FormData()
        if (editImageFile) {
          const webpFile = await compressToWebP(editImageFile)
          formData.append('image', webpFile)
        }
        formData.append('data', JSON.stringify(payload))

        await updateEmployee(serviceToEdit.id, formData)

        toast.success("Employee updated successfully")
        setServiceToEdit(null)
        setEditImageFile(null)
        setEditImagePreview(null)
        fetchEmployees()
      } catch (error) {
        console.error("Failed to update employee:", error)
        toast.error("Failed to update employee")
      } finally {
        setIsEditing(false)
      }
    }
  }

  const handleDelete = async () => {
    if (serviceToDelete) {
      try {
        setIsDeleting(true)
        await deleteEmployee(serviceToDelete.id)
        toast.success("Employee deleted successfully")
        setServiceToDelete(null)
        fetchEmployees()
      } catch (error) {
        console.error("Failed to delete employee:", error)
        toast.error("Failed to delete employee")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case EmployeeStatus.ACTIVE:
        return "bg-green-100 text-green-700"
      case EmployeeStatus.ON_LEAVE:
        return "bg-amber-100 text-amber-700"
      case EmployeeStatus.INACTIVE:
        return "bg-gray-100 text-gray-700"
      case EmployeeStatus.SUSPENDED:
      case EmployeeStatus.TERMINATED:
        return "bg-red-100 text-red-700"
      default:
        return "bg-blue-100 text-blue-700"
    }
  }


  return (
    <>
      <div className="premium-page p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Employees</h1>
            <p className="text-muted-foreground">Manage your salon staff</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <ScrollArea className="pr-4 py-2 h-[60vh]">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="col-span-2">
                    <Label>Full Name <span className="text-destructive">*</span></Label>
                    <Input
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Profile Image</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Avatar className="h-20 w-20">
                        {imagePreview
                          ? <AvatarImage src={imagePreview} alt="Preview" className="object-cover" />
                          : null
                        }
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          {newEmployee.name ? getInitials(newEmployee.name) : <User className="h-8 w-8" />}
                        </AvatarFallback>
                      </Avatar>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setImageFile(file)
                            setImagePreview(URL.createObjectURL(file))
                          }
                        }}
                        className="max-w-[250px]"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Role <span className="text-destructive">*</span></Label>
                    <Select
                      value={newEmployee.role}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value as EmployeeRole })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                      <SelectContent>
                        {Object.values(EmployeeRole).map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Phone Number <span className="text-destructive">*</span></Label>
                    <Input
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                      placeholder="017XXXXXXXX"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label>Join Date</Label>
                    <Input
                      type="date"
                      value={newEmployee.joinDate}
                      onChange={(e) => setNewEmployee({ ...newEmployee, joinDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Salary (৳) <span className="text-destructive">*</span></Label>
                    <Input
                      type="number"
                      value={newEmployee.salary}
                      onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Commission (%)</Label>
                    <Input
                      type="number"
                      value={newEmployee.commission}
                      onChange={(e) => setNewEmployee({ ...newEmployee, commission: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Shift</Label>
                    <Input
                      value={newEmployee.shift}
                      onChange={(e) => setNewEmployee({ ...newEmployee, shift: e.target.value })}
                      placeholder="Morning, Day, etc."
                    />
                  </div>
                  <div>
                    <Label>Experience (years)</Label>
                    <Input
                      type="number"
                      value={newEmployee.experience}
                      onChange={(e) => setNewEmployee({ ...newEmployee, experience: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Fingerprint Code</Label>
                    <Input
                      value={newEmployee.fingerprintCode}
                      onChange={(e) => setNewEmployee({ ...newEmployee, fingerprintCode: e.target.value })}
                      placeholder="Enter device code if any"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>About Yourself</Label>
                    <Input
                      value={newEmployee.about}
                      onChange={(e) => setNewEmployee({ ...newEmployee, about: e.target.value })}
                      placeholder="Write a short bio..."
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Specializations</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <span className={newEmployee.specializations.length === 0 ? "text-muted-foreground" : "text-foreground"}>
                            {newEmployee.specializations.length === 0
                              ? "Select services"
                              : newEmployee.specializations.join(", ")}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
                        {serviceOptions.map((service) => (
                          <div
                            key={service}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                            onClick={() => {
                              const selected = newEmployee.specializations
                              const next = selected.includes(service)
                                ? selected.filter((x) => x !== service)
                                : [...selected, service]
                              setNewEmployee({ ...newEmployee, specializations: next })
                            }}
                          >
                            <Checkbox checked={newEmployee.specializations.includes(service)} />
                            <span className="text-sm">{service}</span>
                          </div>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button onClick={handleAddEmployee} className="w-full" disabled={isAdding}>
                  {isAdding ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding Employee...</>
                  ) : (
                    "Add Employee"
                  )}
                </Button>
              </DialogFooter>
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
                <TableHead><span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary/60" />Employee</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-primary/60" />Role</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-primary/60" />Contact</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-primary/60" />Specializations</span></TableHead>
                <TableHead><span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary/60" />Status</span></TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">Loading...</TableCell></TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No employees found.</TableCell></TableRow>
              ) : (
                paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={employee.image ?? undefined} alt={employee.name} className="object-cover" />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{employee.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Since {employee.joinDate}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{employee.role}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {employee.phone}
                        </div>
                        <p className="text-muted-foreground truncate max-w-[150px]">{employee.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {employee.specializations?.slice(0, 2).map((spec) => (
                          <span
                            key={spec}
                            className="px-2 py-0.5 bg-secondary rounded text-[10px]"
                          >
                            {spec}
                          </span>
                        ))}
                        {employee.specializations?.length > 2 && (
                          <span className="px-2 py-0.5 bg-secondary rounded text-[10px]">
                            +{employee.specializations.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-medium ${getStatusColor(
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
                          <DropdownMenuItem onClick={() => setServiceToView(employee)}>
                            <Eye className="w-4 h-4 mr-2" />Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setServiceToEdit({ ...employee })}>
                            <Pencil className="w-4 h-4 mr-2" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setServiceToDelete(employee)}>
                            <Trash2 className="w-4 h-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!loading && filteredEmployees.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredEmployees.length)} of {filteredEmployees.length} entries
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
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!serviceToView} onOpenChange={() => setServiceToView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Employee Profile</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {serviceToView && (
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4 border-b pb-4">
                  <Avatar className="h-16 w-16 text-xl">
                    <AvatarImage src={serviceToView.image ?? undefined} alt={serviceToView.name} className="object-cover" />
                    <AvatarFallback>{getInitials(serviceToView.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{serviceToView.name}</h3>
                    <p className="text-muted-foreground">{serviceToView.role} • {serviceToView.employmentType}</p>
                    <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(serviceToView.status)}`}>
                      {serviceToView.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div><Label className="text-muted-foreground">Phone</Label><p className="font-medium">{serviceToView.phone}</p></div>
                  <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{serviceToView.email}</p></div>
                  <div><Label className="text-muted-foreground">Salary</Label><p className="font-medium">৳{Number(serviceToView.salary).toLocaleString()}</p></div>
                  <div><Label className="text-muted-foreground">Commission</Label><p className="font-medium">{serviceToView.commission}%</p></div>
                  <div><Label className="text-muted-foreground">Experience</Label><p className="font-medium">{serviceToView.experience} years</p></div>
                  <div><Label className="text-muted-foreground">Join Date</Label><p className="font-medium">{serviceToView.joinDate}</p></div>
                  <div className="col-span-2"><Label className="text-muted-foreground">About</Label><p className="font-medium text-sm italic">"{serviceToView.about || "No bio added yet."}"</p></div>
                  <div><Label className="text-muted-foreground">Shift</Label><p className="font-medium">{serviceToView.shift || "Not set"}</p></div>
                  <div><Label className="text-muted-foreground">Fingerprint</Label><p className="font-medium">{serviceToView.fingerprintCode || "None"}</p></div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Specializations</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {serviceToView.specializations?.map(s => (
                      <span key={s} className="px-2 py-1 bg-secondary rounded text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!serviceToEdit} onOpenChange={() => setServiceToEdit(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader><DialogTitle>Edit Employee</DialogTitle></DialogHeader>
          <ScrollArea className="pr-4 py-2 h-[60vh]">
            {serviceToEdit && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="col-span-2">
                  <Label>Full Name</Label>
                  <Input
                    value={serviceToEdit.name}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, name: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Profile Image</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={editImagePreview ?? serviceToEdit.image ?? undefined}
                        alt={serviceToEdit.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {getInitials(serviceToEdit.name)}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setEditImageFile(file)
                          setEditImagePreview(URL.createObjectURL(file))
                        }
                      }}
                      className="max-w-[250px]"
                    />
                  </div>
                </div>
                <div>
                  <Label>Role</Label>
                  <Select
                    value={serviceToEdit.role}
                    onValueChange={(value) => setServiceToEdit({ ...serviceToEdit, role: value as EmployeeRole })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(EmployeeRole).map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={serviceToEdit.status}
                    onValueChange={(value) => setServiceToEdit({ ...serviceToEdit, status: value as EmployeeStatus })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(EmployeeStatus).map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Employment Type</Label>
                  <Select
                    value={serviceToEdit.employmentType}
                    onValueChange={(value) => setServiceToEdit({ ...serviceToEdit, employmentType: value as EmploymentType })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(EmploymentType).map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={serviceToEdit.phone}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={serviceToEdit.email}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Salary (৳)</Label>
                  <Input
                    type="number"
                    value={serviceToEdit.salary}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, salary: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Commission (%)</Label>
                  <Input
                    type="number"
                    value={serviceToEdit.commission}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, commission: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Shift</Label>
                  <Input
                    value={serviceToEdit.shift}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, shift: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Experience (years)</Label>
                  <Input
                    type="number"
                    value={serviceToEdit.experience}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, experience: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Join Date</Label>
                  <Input
                    type="date"
                    value={serviceToEdit.joinDate}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, joinDate: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Fingerprint Code</Label>
                  <Input
                    value={serviceToEdit.fingerprintCode || ""}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, fingerprintCode: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>About Yourself</Label>
                  <Input
                    value={serviceToEdit.about || ""}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, about: e.target.value })}
                    placeholder="Write a short bio..."
                  />
                </div>
                <div className="col-span-2">
                  <Label>Specializations (comma separated)</Label>
                  <Input
                    value={Array.isArray(serviceToEdit.specializations) ? serviceToEdit.specializations.join(', ') : ""}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, specializations: e.target.value.split(',').map(s => s.trim()) })}
                  />
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button className="w-full" onClick={handleEditSave} disabled={isEditing}>
              {isEditing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving Changes...</>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!serviceToDelete} onOpenChange={() => setServiceToDelete(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Employee</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to delete <strong>{serviceToDelete?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceToDelete(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
