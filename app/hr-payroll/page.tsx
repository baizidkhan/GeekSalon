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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Download, Calendar, MoreHorizontal, User, UserCheck, Receipt, MinusCircle, Zap, Scissors, Clock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  role: string
  baseSalary: number
  bonus: number
  deductions: number
  netSalary: number
  status: "Paid" | "Pending" | "Processing"
  payDate: string
}

interface LeaveRecord {
  id: string
  employeeName: string
  type: "Sick" | "Casual" | "Annual" | "Unpaid"
  startDate: string
  endDate: string
  days: number
  status: "Approved" | "Pending" | "Rejected"
}

const payrollRecords: PayrollRecord[] = [
  {
    id: "1",
    employeeId: "EMP001",
    employeeName: "Rumana Akter",
    role: "Senior Stylist",
    baseSalary: 35000,
    bonus: 5000,
    deductions: 2000,
    netSalary: 38000,
    status: "Paid",
    payDate: "2026-03-31",
  },
  {
    id: "2",
    employeeId: "EMP002",
    employeeName: "Md. Sohel Rana",
    role: "Barber",
    baseSalary: 25000,
    bonus: 2000,
    deductions: 1500,
    netSalary: 25500,
    status: "Paid",
    payDate: "2026-03-31",
  },
  {
    id: "3",
    employeeId: "EMP003",
    employeeName: "Shahnaz Parvin",
    role: "Beautician",
    baseSalary: 28000,
    bonus: 3000,
    deductions: 1800,
    netSalary: 29200,
    status: "Pending",
    payDate: "2026-04-30",
  },
  {
    id: "4",
    employeeId: "EMP004",
    employeeName: "Taslima Khanam",
    role: "Nail Technician",
    baseSalary: 22000,
    bonus: 1500,
    deductions: 1200,
    netSalary: 22300,
    status: "Pending",
    payDate: "2026-04-30",
  },
]

const leaveRecords: LeaveRecord[] = [
  {
    id: "1",
    employeeName: "Rumana Akter",
    type: "Annual",
    startDate: "2026-04-15",
    endDate: "2026-04-18",
    days: 4,
    status: "Approved",
  },
  {
    id: "2",
    employeeName: "Md. Sohel Rana",
    type: "Sick",
    startDate: "2026-04-10",
    endDate: "2026-04-10",
    days: 1,
    status: "Approved",
  },
  {
    id: "3",
    employeeName: "Shahnaz Parvin",
    type: "Casual",
    startDate: "2026-04-20",
    endDate: "2026-04-21",
    days: 2,
    status: "Pending",
  },
]
const PAGE_SIZE = 10

export default function HRPayrollPage() {
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [payrollPage, setPayrollPage] = useState(1)
  const [leavePage, setLeavePage] = useState(1)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
      case "Approved":
        return "bg-green-100 text-green-700"
      case "Pending":
        return "bg-amber-100 text-amber-700"
      case "Processing":
        return "bg-blue-100 text-blue-700"
      case "Rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "Sick":
        return "bg-red-100 text-red-700"
      case "Casual":
        return "bg-blue-100 text-blue-700"
      case "Annual":
        return "bg-green-100 text-green-700"
      case "Unpaid":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const totalPayroll = payrollRecords.reduce((sum, r) => sum + r.netSalary, 0)
  const pendingPayroll = payrollRecords
    .filter((r) => r.status === "Pending")
    .reduce((sum, r) => sum + r.netSalary, 0)
  const payrollTotalPages = Math.max(1, Math.ceil(payrollRecords.length / PAGE_SIZE))
  const leaveTotalPages = Math.max(1, Math.ceil(leaveRecords.length / PAGE_SIZE))
  const paginatedPayrollRecords = payrollRecords.slice((payrollPage - 1) * PAGE_SIZE, payrollPage * PAGE_SIZE)
  const paginatedLeaveRecords = leaveRecords.slice((leavePage - 1) * PAGE_SIZE, leavePage * PAGE_SIZE)

  return (
    <DashboardLayout>
      <div className="premium-page p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary/70 uppercase mb-1">Human Resources</p>
            <h1 className="text-2xl font-semibold text-foreground">HR & Payroll</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage payroll and employee records</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="w-5 h-5 text-primary font-bold text-base flex items-center justify-center">৳</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-semibold text-foreground">৳{totalPayroll.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <span className="w-5 h-5 text-amber-600 font-bold text-base flex items-center justify-center">৳</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold text-foreground">৳{pendingPayroll.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Employees</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{payrollRecords.length}</p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Leave Requests</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {leaveRecords.filter((l) => l.status === "Pending").length} pending
            </p>
          </div>
        </div>

        <Tabs defaultValue="payroll" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="leave">Leave Management</TabsTrigger>
          </TabsList>

          <TabsContent value="payroll">
            <div className="bg-card rounded-xl border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-medium">Payroll Records</h3>
                <Dialog open={isPayrollDialogOpen} onOpenChange={setIsPayrollDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Process Payroll
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Process Payroll</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Employee</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Rumana Akter</SelectItem>
                            <SelectItem value="2">Md. Sohel Rana</SelectItem>
                            <SelectItem value="3">Shahnaz Parvin</SelectItem>
                            <SelectItem value="4">Taslima Khanam</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Base Salary</Label>
                          <Input type="number" placeholder="0" />
                        </div>
                        <div>
                          <Label>Bonus</Label>
                          <Input type="number" placeholder="0" />
                        </div>
                      </div>
                      <div>
                        <Label>Deductions</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <Button className="w-full">Process Payment</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary/60" />Employee</span></TableHead>
                      <TableHead><span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-primary/60" />Role</span></TableHead>
                      <TableHead><span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-primary/60" />Base Salary</span></TableHead>
                      <TableHead><span className="flex items-center gap-1.5"><Plus className="w-3.5 h-3.5 text-primary/60" />Bonus</span></TableHead>
                      <TableHead><span className="flex items-center gap-1.5"><MinusCircle className="w-3.5 h-3.5 text-primary/60" />Deductions</span></TableHead>
                      <TableHead><span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-primary/60" />Net Salary</span></TableHead>
                      <TableHead><span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary/60" />Status</span></TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPayrollRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(record.employeeName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{record.employeeName}</p>
                              <p className="text-xs text-muted-foreground">{record.employeeId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{record.role}</TableCell>
                        <TableCell>৳{record.baseSalary.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">+৳{record.bonus.toLocaleString()}</TableCell>
                        <TableCell className="text-red-600">-৳{record.deductions.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">৳{record.netSalary.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status}
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
                              <DropdownMenuItem>Download Slip</DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {payrollRecords.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
                  <span>
                    Showing {(payrollPage - 1) * PAGE_SIZE + 1} to {Math.min(payrollPage * PAGE_SIZE, payrollRecords.length)} of {payrollRecords.length} entries
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={payrollPage === 1}
                      onClick={() => setPayrollPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-xs">Page {payrollPage} of {payrollTotalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={payrollPage === payrollTotalPages}
                      onClick={() => setPayrollPage((p) => Math.min(payrollTotalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leave">
            <div className="bg-card rounded-xl border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-medium">Leave Requests</h3>
                <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Leave
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Leave</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Employee</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Anjali Verma</SelectItem>
                            <SelectItem value="2">Vikram Singh</SelectItem>
                            <SelectItem value="3">Sunita Rao</SelectItem>
                            <SelectItem value="4">Raj Malhotra</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Leave Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sick">Sick Leave</SelectItem>
                            <SelectItem value="Casual">Casual Leave</SelectItem>
                            <SelectItem value="Annual">Annual Leave</SelectItem>
                            <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Start Date</Label>
                          <Input type="date" />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input type="date" />
                        </div>
                      </div>
                      <Button className="w-full">Submit Request</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary/60" />Employee</span></TableHead>
                      <TableHead><span className="flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-primary/60" />Type</span></TableHead>
                      <TableHead><span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary/60" />Period</span></TableHead>
                      <TableHead><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary/60" />Days</span></TableHead>
                      <TableHead><span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary/60" />Status</span></TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLeaveRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getLeaveTypeColor(record.type)}`}>
                            {record.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {record.startDate} - {record.endDate}
                          </div>
                        </TableCell>
                        <TableCell>{record.days} day(s)</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status}
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
                              <DropdownMenuItem>Approve</DropdownMenuItem>
                              <DropdownMenuItem>Reject</DropdownMenuItem>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {leaveRecords.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
                  <span>
                    Showing {(leavePage - 1) * PAGE_SIZE + 1} to {Math.min(leavePage * PAGE_SIZE, leaveRecords.length)} of {leaveRecords.length} entries
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={leavePage === 1}
                      onClick={() => setLeavePage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-xs">Page {leavePage} of {leaveTotalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={leavePage === leaveTotalPages}
                      onClick={() => setLeavePage((p) => Math.min(leaveTotalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
