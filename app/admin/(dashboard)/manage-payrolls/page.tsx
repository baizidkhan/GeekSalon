"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Download, User, UserCheck, Receipt, MinusCircle, Zap, Loader2, MoreHorizontal, Pencil, ChevronLeft, ChevronRight, Users } from "lucide-react"
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
  updatePayrollRecord,
  type PayrollRecord,
  type CreatePayrollDto,
  type PayrollStatus,
} from "@admin/api/hr-payroll/hr-payroll"
import { getBasicEmployees } from "@admin/api/employees/employees"
import { StatCard } from "@admin/components/stat-card"
import { useBusiness } from "@/context/BusinessContext"
import { useDebounce } from "@/hooks/use-debounce"
import { Search, Filter } from "lucide-react"
// jsPDF is imported dynamically to avoid SSR build errors

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

type MergedRecord = PayrollRecord & { _virtual?: boolean }

export default function HRPayrollPage() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear())
  const [page, setPage] = useState(1)
  const [records, setRecords] = useState<PayrollRecord[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CreatePayrollDto>(EMPTY_FORM)
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; role?: string; salary?: number }>>([])

  const [viewRecord, setViewRecord] = useState<MergedRecord | null>(null)
  const [editRecord, setEditRecord] = useState<MergedRecord | null>(null)
  const [editForm, setEditForm] = useState<CreatePayrollDto>(EMPTY_FORM)
  const [editSaving, setEditSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { businessName } = useBusiness()

  // Auto-calculate netSalary for Create Form
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      netSalary: Number(prev.baseSalary || 0) + Number(prev.bonus || 0) - Number(prev.deductions || 0)
    }))
  }, [form.baseSalary, form.bonus, form.deductions])

  // Auto-calculate netSalary for Edit Form
  useEffect(() => {
    setEditForm(prev => ({
      ...prev,
      netSalary: Number(prev.baseSalary || 0) + Number(prev.bonus || 0) - Number(prev.deductions || 0)
    }))
  }, [editForm.baseSalary, editForm.bonus, editForm.deductions])

  const fetchPayroll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPayrollRecords(
        selectedMonth, 
        selectedYear, 
        page, 
        PAGE_SIZE,
        debouncedSearch || undefined,
        statusFilter === "all" ? undefined : statusFilter
      )
      setRecords(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch {
      toast.error("Error loading payroll records")
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear, page, debouncedSearch, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [selectedMonth, selectedYear, debouncedSearch, statusFilter])

  useEffect(() => {
    fetchPayroll()
  }, [fetchPayroll])

  useEffect(() => {
    getBasicEmployees()
      .then((list) => {
        const rows = Array.isArray(list) ? list : list?.data ?? []
        setEmployees(rows)
      })
      .catch(() => setEmployees([]))
  }, [])

  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // clamp month if year is changed to current year while a future month was selected
  useEffect(() => {
    if (selectedYear === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth)
    }
  }, [selectedYear])

  const mergedRecords = useMemo<MergedRecord[]>(() => {
    const byName = new Map(records.map((r) => [r.employeeName.toLowerCase(), r]))

    // virtual rows only apply to the current month — new employees have no past records
    const isCurrentPeriod = selectedMonth === currentMonth && selectedYear === currentYear
    
    // Virtual rows should also respect search and status filters
    const statusMatchesPending = statusFilter === "all" || statusFilter === "Pending"
    
    const missingRows = (isCurrentPeriod && statusMatchesPending)
      ? employees
        .filter((e) => {
          const matchesSearch = !debouncedSearch || e.name.toLowerCase().includes(debouncedSearch.toLowerCase())
          const isNotCreated = !byName.has(e.name.toLowerCase())
          return matchesSearch && isNotCreated
        })
        .map((e) => ({
          id: `virtual-${e.id}`,
          employeeId: e.id,
          employeeName: e.name,
          role: e.role || "",
          baseSalary: Number(e.salary) || 0,
          bonus: 0,
          deductions: 0,
          netSalary: Number(e.salary) || 0,
          status: "Pending" as PayrollStatus,
          payDate: "",
          month: selectedMonth,
          year: selectedYear,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _virtual: true,
        }))
      : []

    return [...records, ...missingRows]
  }, [records, employees, selectedMonth, selectedYear, debouncedSearch, statusFilter])

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {}
    if (!form.employeeId) newErrors.employeeId = "Employee ID is required"
    if (!form.employeeName) newErrors.employeeName = "Employee name is required"
    if (!form.role) newErrors.role = "Role is required"
    if (form.baseSalary <= 0) newErrors.baseSalary = "Base salary must be greater than 0"
    if ((form.bonus ?? 0) < 0) newErrors.bonus = "Bonus cannot be negative"
    if ((form.deductions ?? 0) < 0) newErrors.deductions = "Deductions cannot be negative"
    if (form.status === "Paid" && !form.payDate) newErrors.payDate = "Pay date is required when status is Paid"
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Please fix the errors in the form")
      return
    }

    setSaving(true)
    try {
      await createPayrollRecord({ ...form, month: selectedMonth, year: selectedYear })
      toast.success("Payroll record created")
      setIsCreateOpen(false)
      setForm(EMPTY_FORM)
      setErrors({})
      fetchPayroll()
    } catch (error: any) {
      const backendErrors = error.response?.data?.message
      if (Array.isArray(backendErrors)) {
        const newErrors: Record<string, string> = {}
        backendErrors.forEach((msg: string) => {
          if (msg.toLowerCase().includes("salary")) newErrors.baseSalary = msg
          if (msg.toLowerCase().includes("date")) newErrors.payDate = msg
          if (msg.toLowerCase().includes("id")) newErrors.employeeId = msg
          if (msg.toLowerCase().includes("name")) newErrors.employeeName = msg
          if (msg.toLowerCase().includes("role")) newErrors.role = msg
        })
        setErrors(newErrors)
      }
      
      const errorMessage = Array.isArray(backendErrors) ? backendErrors[0] : backendErrors
      toast.error(typeof errorMessage === 'string' && errorMessage !== "Internal server error" ? errorMessage : "Failed to create payroll record")
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (record: MergedRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditRecord(record)
    setEditForm({
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      role: record.role,
      baseSalary: Number(record.baseSalary),
      bonus: Number(record.bonus),
      deductions: Number(record.deductions),
      netSalary: Number(record.netSalary),
      status: record.status,
      payDate: record.payDate ?? "",
      month: record.month,
      year: record.year,
    })
  }

  const handleEditSave = async () => {
    if (!editRecord) return
    
    const newErrors: Record<string, string> = {}
    if ((editForm.bonus ?? 0) < 0) newErrors.bonus = "Bonus cannot be negative"
    if ((editForm.deductions ?? 0) < 0) newErrors.deductions = "Deductions cannot be negative"
    if (editForm.status === "Paid" && !editForm.payDate) newErrors.payDate = "Pay date is required when status is Paid"
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Please fix the errors in the form")
      return
    }

    setEditSaving(true)
    try {
      if (editRecord._virtual) {
        await createPayrollRecord({ ...editForm, month: selectedMonth, year: selectedYear })
        toast.success("Payroll record saved")
      } else {
        await updatePayrollRecord(editRecord.id, editForm)
        toast.success("Payroll record updated")
      }
      setEditRecord(null)
      setErrors({})
      fetchPayroll()
    } catch (error: any) {
      const backendErrors = error.response?.data?.message
      if (Array.isArray(backendErrors)) {
        const newErrors: Record<string, string> = {}
        backendErrors.forEach((msg: string) => {
          if (msg.toLowerCase().includes("salary")) newErrors.baseSalary = msg
          if (msg.toLowerCase().includes("date")) newErrors.payDate = msg
        })
        setErrors(newErrors)
      }

      const errorMessage = Array.isArray(backendErrors) ? backendErrors[0] : backendErrors
      toast.error(typeof errorMessage === 'string' && errorMessage !== "Internal server error" ? errorMessage : "Failed to save payroll record")
    } finally {
      setEditSaving(false)
    }
  }

  const downloadPayrollSlip = async (record: PayrollRecord) => {
    if (typeof window === 'undefined') return
    // Dynamically import browser-compatible version of jsPDF to avoid SSR issues
    const { default: jsPDF } = await import("jspdf/dist/jspdf.es.min.js")
    const { default: autoTable } = await (import("jspdf-autotable") as any)
    
    const doc = new (jsPDF as any)()
    const monthName = MONTHS.find((m) => m.value === record.month)?.label || "Month"

    // Set header
    doc.setFontSize(20)
    doc.setTextColor(40)
    doc.text(`${businessName} Salary Slip`, 105, 20, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Period: ${monthName} ${record.year}`, 105, 28, { align: "center" })

    // Employee Details
    const details = [
      ["Employee Name", record.employeeName],
      ["Employee ID", record.employeeId],
      ["Role", record.role],
      ["Status", record.status],
      ["Pay Date", record.payDate || "N/A"],
    ]

    autoTable(doc, {
      startY: 40,
      head: [["Description", "Details"]],
      body: details,
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
    })

    // Salary Breakdown
    const salaryData = [
      ["Base Salary", `BDT ${Number(record.baseSalary).toLocaleString()}`],
      ["Bonus", `BDT ${Number(record.bonus).toLocaleString()}`],
      ["Deductions", `BDT ${Number(record.deductions).toLocaleString()}`],
      ["Net Salary", `BDT ${Number(record.netSalary).toLocaleString()}`],
    ]

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Earnings/Deductions", "Amount"]],
      body: salaryData,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129] },
      columnStyles: { 1: { halign: "right" } },
    })

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 30
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text("________________________", 40, finalY)
    doc.text("Employee Signature", 40, finalY + 5)

    doc.text("________________________", 140, finalY)
    doc.text("Authorized Signature", 140, finalY + 5)

    doc.setFontSize(8)
    doc.text("This is a computer generated document and does not require a physical signature.", 105, finalY + 20, { align: "center" })

    doc.save(`SalarySlip_${businessName}_${record.employeeName}_${monthName}_${record.year}.pdf`)
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

  const prevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear((y) => y - 1)
      setSelectedMonth(12)
    } else {
      setSelectedMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear((y) => y + 1)
      setSelectedMonth(1)
    } else {
      setSelectedMonth((m) => m + 1)
    }
  }

  const atCurrentPeriod = selectedMonth === currentMonth && selectedYear === currentYear

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
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Month navigator */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="w-24 text-center text-sm font-medium">
            {MONTHS.find((m) => m.value === selectedMonth)?.label}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={nextMonth}
            disabled={atCurrentPeriod}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Year navigator */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedYear((y) => y - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="w-24 text-center text-sm font-medium">{selectedYear}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedYear((y) => y + 1)}
            disabled={selectedYear >= currentYear}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <StatCard
          title="Total Payroll"
          value={`৳${totalPayroll.toLocaleString()}`}
          icon={Receipt}
          iconWrapperClassName="bg-blue-50 text-blue-500"
          className="border-t-4 border-t-transparent hover:border-t-blue-500 transition-all"
        />
        <StatCard
          title="Pending"
          value={`৳${pendingPayroll.toLocaleString()}`}
          icon={MinusCircle}
          iconWrapperClassName="bg-amber-50 text-amber-500"
          className="border-t-4 border-t-transparent hover:border-t-amber-500 transition-all"
        />
        <StatCard
          title="Employees"
          value={employees.length || total}
          icon={Users}
          iconWrapperClassName="bg-emerald-50 text-emerald-500"
          className="border-t-4 border-t-transparent hover:border-t-emerald-500 transition-all"
        />
      </div>

      {/* Payroll Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
            <h3 className="font-medium mr-2">Payroll Records</h3>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search employee..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="pl-9 h-9"
              />
            </div>
            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue placeholder="All Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) setErrors({}) }}>
            {/* <DialogTrigger asChild>
              <Button size="sm" className="shrink-0" onClick={() => setForm({ ...EMPTY_FORM, month: selectedMonth, year: selectedYear })}>
                <Plus className="w-4 h-4 mr-2" />
                Process Payroll
              </Button>
            </DialogTrigger> */}
            <DialogContent className="">
              <DialogHeader>
                <DialogTitle>Process Payroll</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4 pb-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={errors.employeeId ? "text-destructive" : ""}>Employee ID <span className="text-destructive">*</span></Label>
                    <Input 
                      className={errors.employeeId ? "border-destructive" : ""}
                      value={form.employeeId} 
                      onChange={(e) => {
                        setForm({ ...form, employeeId: e.target.value })
                        if (errors.employeeId) setErrors(prev => ({ ...prev, employeeId: "" }))
                      }} 
                      placeholder="EMP001" 
                    />
                    {errors.employeeId && <p className="text-[10px] text-destructive mt-1">{errors.employeeId}</p>}
                  </div>
                  <div>
                    <Label className={errors.employeeName ? "text-destructive" : ""}>Employee Name <span className="text-destructive">*</span></Label>
                    <Input 
                      className={errors.employeeName ? "border-destructive" : ""}
                      value={form.employeeName} 
                      onChange={(e) => {
                        setForm({ ...form, employeeName: e.target.value })
                        if (errors.employeeName) setErrors(prev => ({ ...prev, employeeName: "" }))
                      }} 
                      placeholder="Full name" 
                    />
                    {errors.employeeName && <p className="text-[10px] text-destructive mt-1">{errors.employeeName}</p>}
                  </div>
                </div>
                <div>
                  <Label className={errors.role ? "text-destructive" : ""}>Role <span className="text-destructive">*</span></Label>
                  <Input 
                    className={errors.role ? "border-destructive" : ""}
                    value={form.role} 
                    onChange={(e) => {
                      setForm({ ...form, role: e.target.value })
                      if (errors.role) setErrors(prev => ({ ...prev, role: "" }))
                    }} 
                    placeholder="e.g. Senior Stylist" 
                  />
                  {errors.role && <p className="text-[10px] text-destructive mt-1">{errors.role}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={errors.baseSalary ? "text-destructive" : ""}>Base Salary <span className="text-destructive">*</span></Label>
                    <Input 
                      className={errors.baseSalary ? "border-destructive" : ""}
                      type="number" 
                      min={0} 
                      value={form.baseSalary} 
                      onChange={(e) => {
                        setForm({ ...form, baseSalary: Number(e.target.value) })
                        if (errors.baseSalary) setErrors(prev => ({ ...prev, baseSalary: "" }))
                      }} 
                    />
                    {errors.baseSalary && <p className="text-[10px] text-destructive mt-1">{errors.baseSalary}</p>}
                  </div>
                  <div>
                    <Label className={errors.bonus ? "text-destructive" : ""}>Bonus</Label>
                    <Input 
                      className={errors.bonus ? "border-destructive" : ""}
                      type="number" 
                      min={0} 
                      value={form.bonus} 
                      onChange={(e) => {
                        setForm({ ...form, bonus: Number(e.target.value) })
                        if (errors.bonus) setErrors(prev => ({ ...prev, bonus: "" }))
                      }} 
                    />
                    {errors.bonus && <p className="text-[10px] text-destructive mt-1">{errors.bonus}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={errors.deductions ? "text-destructive" : ""}>Deductions</Label>
                    <Input 
                      className={errors.deductions ? "border-destructive" : ""}
                      type="number" 
                      min={0} 
                      value={form.deductions} 
                      onChange={(e) => {
                        setForm({ ...form, deductions: Number(e.target.value) })
                        if (errors.deductions) setErrors(prev => ({ ...prev, deductions: "" }))
                      }} 
                    />
                    {errors.deductions && <p className="text-[10px] text-destructive mt-1">{errors.deductions}</p>}
                  </div>
                  <div>
                    <Label>Net Salary</Label>
                    <Input 
                      type="number" 
                      min={0} 
                      value={form.netSalary} 
                      readOnly 
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select 
                      value={form.status} 
                      onValueChange={(v) => {
                        setForm({ ...form, status: v as PayrollStatus })
                        if (v !== "Paid" && errors.payDate) setErrors(prev => ({ ...prev, payDate: "" }))
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={errors.payDate ? "text-destructive" : ""}>Pay Date {form.status === "Paid" && <span className="text-destructive">*</span>}</Label>
                    <Input 
                      className={errors.payDate ? "border-destructive" : ""}
                      type="date" 
                      value={form.payDate} 
                      onChange={(e) => {
                        setForm({ ...form, payDate: e.target.value })
                        if (errors.payDate) setErrors(prev => ({ ...prev, payDate: "" }))
                      }} 
                    />
                    {errors.payDate && <p className="text-[10px] text-destructive mt-1">{errors.payDate}</p>}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsCreateOpen(false); setErrors({}) }} className="w-full">
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving} className="w-full">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : mergedRecords.length === 0 ? (
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
                {mergedRecords.map((record) => (
                  <TableRow
                    key={record.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setViewRecord(record)}
                  >
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewRecord(record)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => openEdit(record, e)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadPayrollSlip(record)}>Download Slip</DropdownMenuItem>
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

      {/* View Details Dialog */}
      <Dialog open={!!viewRecord} onOpenChange={(open) => !open && setViewRecord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payroll Details</DialogTitle>
          </DialogHeader>
          {viewRecord && (
            <div className="space-y-4 py-2 pb-2">
              <div className="flex items-center gap-3 border-b pb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary text-base">
                    {getInitials(viewRecord.employeeName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-base">{viewRecord.employeeName}</p>
                  <p className="text-sm text-muted-foreground">{viewRecord.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Employee ID</p>
                  <p className="font-medium">{viewRecord.employeeId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Period</p>
                  <p className="font-medium">{MONTHS.find(m => m.value === viewRecord.month)?.label} {viewRecord.year}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Base Salary</p>
                  <p className="font-medium">৳{Number(viewRecord.baseSalary).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Bonus</p>
                  <p className="font-medium text-green-600">+৳{Number(viewRecord.bonus).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Deductions</p>
                  <p className="font-medium text-red-600">-৳{Number(viewRecord.deductions).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Net Salary</p>
                  <p className="font-semibold text-base">৳{Number(viewRecord.netSalary).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewRecord.status)}`}>
                    {viewRecord.status}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Pay Date</p>
                  <p className="font-medium">{viewRecord.payDate || "—"}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => downloadPayrollSlip(viewRecord)} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Slip
                </Button>
                <Button variant="outline" onClick={() => { setViewRecord(null); openEdit(viewRecord, { stopPropagation: () => { } } as any) }} className="w-full">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={() => setViewRecord(null)} className="w-full">Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editRecord} onOpenChange={(open) => { if (!open) { setEditRecord(null); setErrors({}); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payroll — {editRecord?.employeeName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2 pb-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Base Salary</Label>
                <Input
                  type="number"
                  value={editForm.baseSalary}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <div>
                <Label className={errors.bonus ? "text-destructive" : ""}>Bonus</Label>
                <Input
                  className={errors.bonus ? "border-destructive" : ""}
                  type="number"
                  min={0}
                  value={editForm.bonus}
                  onChange={(e) => {
                    setEditForm({ ...editForm, bonus: Number(e.target.value) })
                    if (errors.bonus) setErrors(prev => ({ ...prev, bonus: "" }))
                  }}
                />
                {errors.bonus && <p className="text-[10px] text-destructive mt-1">{errors.bonus}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={errors.deductions ? "text-destructive" : ""}>Deductions</Label>
                <Input
                  className={errors.deductions ? "border-destructive" : ""}
                  type="number"
                  min={0}
                  value={editForm.deductions}
                  onChange={(e) => {
                    setEditForm({ ...editForm, deductions: Number(e.target.value) })
                    if (errors.deductions) setErrors(prev => ({ ...prev, deductions: "" }))
                  }}
                />
                {errors.deductions && <p className="text-[10px] text-destructive mt-1">{errors.deductions}</p>}
              </div>
              <div>
                <Label>Net Salary</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.netSalary}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select 
                  value={editForm.status} 
                  onValueChange={(v) => {
                    setEditForm({ ...editForm, status: v as PayrollStatus })
                    if (v !== "Paid" && errors.payDate) setErrors(prev => ({ ...prev, payDate: "" }))
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={errors.payDate ? "text-destructive" : ""}>Pay Date {editForm.status === "Paid" && <span className="text-destructive">*</span>}</Label>
                <Input
                  className={errors.payDate ? "border-destructive" : ""}
                  type="date"
                  value={editForm.payDate}
                  onChange={(e) => {
                    setEditForm({ ...editForm, payDate: e.target.value })
                    if (errors.payDate) setErrors(prev => ({ ...prev, payDate: "" }))
                  }}
                />
                {errors.payDate && <p className="text-[10px] text-destructive mt-1">{errors.payDate}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditRecord(null); setErrors({}) }} className="w-full">
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editSaving} className="w-full">
              {editSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
