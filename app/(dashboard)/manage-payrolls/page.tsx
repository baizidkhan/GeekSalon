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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Download, User, UserCheck, Receipt, MinusCircle, Zap, Loader2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  getPayrollRecords,
  createPayrollRecord,
  type PayrollRecord,
  type CreatePayrollDto,
  type PayrollStatus,
} from "@/api/hr-payroll/hr-payroll"

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

const PAGE_SIZE = 10

const EMPTY_FORM: CreatePayrollDto = {
  employeeId: "",
  employeeName: "",
  role: "",
  baseSalary: 0,
  bonus: 0,
  deductions: 0,
  netSalary: 0,
  status: "Pending",
  payDate: "",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
}

export default function HRPayrollPage() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear())
  const [page, setPage] = useState(1)
  const [records, setRecords] = useState<PayrollRecord[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CreatePayrollDto>(EMPTY_FORM)

  const fetchPayroll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPayrollRecords(selectedMonth, selectedYear, page, PAGE_SIZE)
      setRecords(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch {
      toast.error("Error loading payroll records")
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear, page])

  useEffect(() => {
    setPage(1)
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    fetchPayroll()
  }, [fetchPayroll])

  const handleSave = async () => {
    if (!form.employeeId || !form.employeeName || !form.role) {
      toast.error("Employee ID, name, and role are required")
      return
    }
    setSaving(true)
    try {
      await createPayrollRecord({ ...form, month: selectedMonth, year: selectedYear })
      toast.success("Payroll record created")
      setIsDialogOpen(false)
      setForm(EMPTY_FORM)
      fetchPayroll()
    } catch {
      toast.error("Failed to create payroll record")
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-700"
      case "Pending": return "bg-amber-100 text-amber-700"
      case "Processing": return "bg-blue-100 text-blue-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const totalPayroll = records.reduce((sum, r) => sum + Number(r.netSalary), 0)
  const pendingPayroll = records.filter(r => r.status === "Pending").reduce((sum, r) => sum + Number(r.netSalary), 0)

  const currentYear = now.getFullYear()
  const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i)

  return (
    <div className="premium-page p-4 sm:p-6 md:p-8">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary/70 uppercase mb-1">Human Resources</p>
          <h1 className="text-2xl font-semibold text-foreground">Manage Payrolls</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage employee payroll records</p>
        </div>
        <Button variant="outline" className="shrink-0">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Month / Year Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 sm:p-5 border border-border">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <span className="w-5 h-5 text-primary font-bold text-base flex items-center justify-center">৳</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Payroll</p>
              <p className="text-lg sm:text-2xl font-semibold text-foreground truncate">৳{totalPayroll.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 sm:p-5 border border-border">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-amber-100 rounded-lg shrink-0">
              <span className="w-5 h-5 text-amber-600 font-bold text-base flex items-center justify-center">৳</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Pending</p>
              <p className="text-lg sm:text-2xl font-semibold text-foreground truncate">৳{pendingPayroll.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 sm:p-5 border border-border">
          <p className="text-xs sm:text-sm text-muted-foreground">Employees</p>
          <p className="text-lg sm:text-2xl font-semibold text-foreground mt-1">{total}</p>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-medium">Payroll Records</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="shrink-0" onClick={() => setForm({ ...EMPTY_FORM, month: selectedMonth, year: selectedYear })}>
                <Plus className="w-4 h-4 mr-2" />
                Process Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Payroll</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Employee ID</Label>
                    <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="EMP001" />
                  </div>
                  <div>
                    <Label>Employee Name</Label>
                    <Input value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} placeholder="Full name" />
                  </div>
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Senior Stylist" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Base Salary</Label>
                    <Input type="number" min={0} value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Bonus</Label>
                    <Input type="number" min={0} value={form.bonus} onChange={(e) => setForm({ ...form, bonus: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Deductions</Label>
                    <Input type="number" min={0} value={form.deductions} onChange={(e) => setForm({ ...form, deductions: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Net Salary</Label>
                    <Input type="number" min={0} value={form.netSalary} onChange={(e) => setForm({ ...form, netSalary: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PayrollStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Pay Date</Label>
                    <Input type="date" value={form.payDate} onChange={(e) => setForm({ ...form, payDate: e.target.value })} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No payroll records for {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary/60" />Employee</span></TableHead>
                  <TableHead className="hidden sm:table-cell"><span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-primary/60" />Role</span></TableHead>
                  <TableHead className="hidden md:table-cell"><span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-primary/60" />Base Salary</span></TableHead>
                  <TableHead className="hidden md:table-cell"><span className="flex items-center gap-1.5"><Plus className="w-3.5 h-3.5 text-primary/60" />Bonus</span></TableHead>
                  <TableHead className="hidden md:table-cell"><span className="flex items-center gap-1.5"><MinusCircle className="w-3.5 h-3.5 text-primary/60" />Deductions</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-primary/60" />Net Salary</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary/60" />Status</span></TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Avatar className="shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                            {getInitials(record.employeeName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[120px] sm:max-w-none">{record.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{record.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{record.role}</TableCell>
                    <TableCell className="hidden md:table-cell">৳{Number(record.baseSalary).toLocaleString()}</TableCell>
                    <TableCell className="hidden md:table-cell text-green-600">+৳{Number(record.bonus).toLocaleString()}</TableCell>
                    <TableCell className="hidden md:table-cell text-red-600">-৳{Number(record.deductions).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">৳{Number(record.netSalary).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(record.status)}`}>
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
          )}
        </div>

        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-3 border-t border-border text-sm text-muted-foreground">
            <span className="text-xs sm:text-sm">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span className="text-xs">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
