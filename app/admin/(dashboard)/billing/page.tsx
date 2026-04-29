"use client"

import { useState, useMemo, useEffect } from "react"
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from "@admin/api/billing/billing"
import { useBusiness } from "@/context/BusinessContext"
import { getClients } from "@admin/api/clients/clients"
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
import { Plus, Search, Receipt, Printer, MoreHorizontal, Upload, Download, Eye, Pencil, Trash2, User, Scissors, Calendar, Globe, Zap, Phone } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Invoice {
  id: string
  invoiceNo: string
  client: string
  clientPhone: string
  services: string[]
  amount: number
  paidAmount?: number
  paymentMethod: "Cash" | "bKash" | "Card"
  sortAt: string
  date: string
  status: "Paid" | "Unpaid" | "Partial"
}

const TIME_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "6months", label: "Last 6 Months" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Date" },
]
const PAGE_SIZE = 10

function mapInvoice(inv: any): Invoice {
  const sortAt = inv.confirmedAt ?? inv.createdAt ?? ""
  return {
    id: inv.id,
    invoiceNo: inv.invoiceNumber,
    client: inv.client?.name ?? "Walk-in",
    clientPhone: inv.client?.phone ?? "—",
    services: inv.services ?? [],
    amount: Number(inv.total),
    paidAmount: inv.paidAmount != null ? Number(inv.paidAmount) : undefined,
    paymentMethod: inv.paymentMethod,
    sortAt,
    date: sortAt ? sortAt.split("T")[0] : "",
    status: inv.status,
  }
}

function getStatusLabel(status: Invoice["status"]) {
  return status === "Unpaid" ? "Pending Payment" : status
}

export default function BillingPage() {
  const { businessName } = useBusiness()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clientOptions, setClientOptions] = useState<Array<{ id: string; name: string; phone: string }>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [customDateFrom, setCustomDateFrom] = useState("")
  const [customDateTo, setCustomDateTo] = useState("")
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [newInvoice, setNewInvoice] = useState({
    clientId: "",
    printBy: "",
    services: "",
    total: "",
    paidAmount: "",
    paymentMethod: "Cash" as "Cash" | "bKash" | "Card",
    status: "Unpaid" as "Paid" | "Unpaid" | "Partial",
  })

  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [editInvoiceState, setEditInvoiceState] = useState<Invoice | null>(null)
  const [deleteInvoiceState, setDeleteInvoiceState] = useState<Invoice | null>(null)

  const fetchInvoices = async () => {
    try {
      const res = await getInvoices()
      const mapped = (res.data ?? res).map(mapInvoice)
      mapped.sort((a: Invoice, b: Invoice) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime())
      setInvoices(mapped)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
    getClients(1, 1000)
      .then((res) => {
        const list = res?.data ?? res ?? []
        setClientOptions(list.map((c: any) => ({ id: c.id, name: c.name, phone: c.phone })))
      })
      .catch(console.error)
  }, [])

  const filterByDate = (date: string) => {
    if (timeFilter === "all") return true
    if (timeFilter === "custom") {
      if (!customDateFrom && !customDateTo) return true
      const d = new Date(date)
      if (customDateFrom && d < new Date(customDateFrom)) return false
      if (customDateTo && d > new Date(customDateTo)) return false
      return true
    }
    const now = new Date()
    const itemDate = new Date(date)
    switch (timeFilter) {
      case "today": return itemDate.toDateString() === now.toDateString()
      case "week": return itemDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case "month": return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
      case "6months": return itemDate >= new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      case "year": return itemDate.getFullYear() === now.getFullYear()
      default: return true
    }
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch = inv.client.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNo.toLowerCase().includes(search.toLowerCase())
      const matchesDate = filterByDate(inv.date)
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter
      return matchesSearch && matchesDate && matchesStatus
    })
  }, [invoices, search, timeFilter, customDateFrom, customDateTo, statusFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, timeFilter, customDateFrom, customDateTo, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE))
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleAddInvoice = async () => {
    try {
      await createInvoice({
        clientId: newInvoice.clientId || undefined,
        printBy: newInvoice.status === "Paid" ? newInvoice.printBy || undefined : undefined,
        services: newInvoice.services ? newInvoice.services.split(",").map(s => s.trim()) : [],
        total: newInvoice.total ? parseFloat(newInvoice.total) : undefined,
        paidAmount: newInvoice.status === "Partial" && newInvoice.paidAmount ? parseFloat(newInvoice.paidAmount) : undefined,
        paymentMethod: newInvoice.paymentMethod,
        status: newInvoice.status,
      })
      setNewInvoice({ clientId: "", printBy: "", services: "", total: "", paidAmount: "", paymentMethod: "Cash", status: "Unpaid" })
      setIsDialogOpen(false)
      fetchInvoices()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditSave = async () => {
    if (!editInvoiceState) return
    try {
      await updateInvoice(editInvoiceState.id, {
        total: editInvoiceState.amount,
        status: editInvoiceState.status,
        paymentMethod: editInvoiceState.paymentMethod,
        paidAmount: editInvoiceState.status === "Partial" ? (editInvoiceState.paidAmount ?? null) : null,
      })
      setEditInvoiceState(null)
      fetchInvoices()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteInvoiceState) return
    try {
      await deleteInvoice(deleteInvoiceState.id)
      setDeleteInvoiceState(null)
      fetchInvoices()
    } catch (err) {
      console.error(err)
    }
  }

  const handlePrintInvoice = (invoice: Invoice) => {
    const due = invoice.status === "Partial"
      ? Math.max(0, invoice.amount - (invoice.paidAmount ?? 0))
      : 0
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invoice.invoiceNo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; background: #fff; padding: 32px; }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #111; padding-bottom: 16px; }
    .header h1 { font-size: 22px; font-weight: 700; letter-spacing: 1px; }
    .header p { font-size: 12px; color: #555; margin-top: 4px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .meta .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta .value { font-size: 13px; font-weight: 600; margin-top: 2px; }
    .meta .field { margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #f4f4f4; text-align: left; padding: 7px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ccc; }
    td { padding: 7px 10px; border-bottom: 1px solid #eee; }
    .totals-table { width: 220px; margin-left: auto; border-collapse: collapse; }
    .totals-table td { padding: 4px 10px; border: none; font-size: 13px; }
    .totals-table td:last-child { text-align: right; font-weight: 600; }
    .grand-total td { border-top: 2px solid #111 !important; padding-top: 8px !important; font-size: 14px; }
    .status-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid #333; }
    .footer { margin-top: 28px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 12px; }
    @media print { body { padding: 16px; } button { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${businessName}</h1>
    <p>Invoice Receipt</p>
  </div>
  <div class="meta">
    <div>
      <div class="field"><div class="label">Invoice No</div><div class="value">${invoice.invoiceNo}</div></div>
      <div class="field"><div class="label">Date</div><div class="value">${invoice.date}</div></div>
    </div>
    <div style="text-align:right">
      <div class="field"><div class="label">Client</div><div class="value">${invoice.client}</div></div>
      <div class="field"><div class="label">Status</div><div class="value"><span class="status-badge">${getStatusLabel(invoice.status)}</span></div></div>
    </div>
  </div>
  <table>
    <thead><tr><th>#</th><th>Service</th></tr></thead>
    <tbody>
      ${invoice.services.map((s, i) => `<tr><td>${i + 1}</td><td>${s}</td></tr>`).join("")}
    </tbody>
  </table>
  <table class="totals-table">
    <tbody>
      <tr><td>Total</td><td>৳${invoice.amount.toLocaleString()}</td></tr>
      ${invoice.status === "Partial" ? `<tr><td>Paid</td><td style="color:#16a34a">৳${(invoice.paidAmount ?? 0).toLocaleString()}</td></tr><tr><td>Due</td><td style="color:#dc2626">৳${due.toLocaleString()}</td></tr>` : ""}
      <tr class="grand-total"><td>Payment</td><td>${invoice.paymentMethod}</td></tr>
    </tbody>
  </table>
  <div class="footer">Thank you for visiting ${businessName}!</div>
</body>
</html>`
    const win = window.open("", "_blank", "width=620,height=750")
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
  }

  const handleExportCSV = () => {
    const headers = ["Invoice No", "Client", "Services", "Amount", "Payment Method", "Date", "Status"]
    const rows = filteredInvoices.map(inv => [inv.invoiceNo, inv.client, inv.services.join("; "), inv.amount, inv.paymentMethod, inv.date, getStatusLabel(inv.status)])
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "invoices.csv"; a.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-700"
      case "Unpaid": return "bg-amber-100 text-amber-700"
      case "Partial": return "bg-blue-100 text-blue-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const dateFilteredInvoices = useMemo(() => {
    return invoices.filter(inv => filterByDate(inv.date))
  }, [invoices, timeFilter, customDateFrom, customDateTo])

  const totalRevenue = dateFilteredInvoices.filter(inv => inv.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0)
  const totalInvoicesCount = dateFilteredInvoices.length
  const pendingCount = dateFilteredInvoices.filter(inv => inv.status === "Unpaid").length

  return (
    <>
      <div className="premium-page p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary/70 uppercase mb-1">Finance</p>
            <h1 className="text-2xl font-semibold text-foreground">Billing / POS</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage invoices and payments</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Invoice</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create New Invoice</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Client</Label>
                    <Select value={newInvoice.clientId} onValueChange={(v) => setNewInvoice({ ...newInvoice, clientId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select client (optional)" /></SelectTrigger>
                      <SelectContent>
                        {clientOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name} ({c.phone})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Services (comma separated)</Label>
                    <Input value={newInvoice.services} onChange={(e) => setNewInvoice({ ...newInvoice, services: e.target.value })} placeholder="e.g., Haircut, Hair Spa" />
                  </div>
                  <div>
                    <Label>Amount (৳)</Label>
                    <Input type="number" value={newInvoice.total} onChange={(e) => setNewInvoice({ ...newInvoice, total: e.target.value })} placeholder="Leave empty to auto-calculate" />
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <Select value={newInvoice.paymentMethod} onValueChange={(v: "Cash" | "bKash" | "Card") => setNewInvoice({ ...newInvoice, paymentMethod: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="bKash">bKash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={newInvoice.status} onValueChange={(v: "Paid" | "Unpaid" | "Partial") => setNewInvoice({ ...newInvoice, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newInvoice.status === "Paid" && (
                    <div>
                      <Label>Printed By</Label>
                      <Input value={newInvoice.printBy} onChange={(e) => setNewInvoice({ ...newInvoice, printBy: e.target.value })} placeholder="Employee name who printed" />
                    </div>
                  )}
                  {newInvoice.status === "Partial" && (
                    <div>
                      <Label>Amount Paid (৳)</Label>
                      <Input type="number" value={newInvoice.paidAmount} onChange={(e) => setNewInvoice({ ...newInvoice, paidAmount: e.target.value })} placeholder="Enter amount paid so far" />
                      {newInvoice.paidAmount && newInvoice.total && (
                        <p className="text-xs text-muted-foreground mt-1">Due: ৳{Math.max(0, parseFloat(newInvoice.total) - parseFloat(newInvoice.paidAmount)).toLocaleString()}</p>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground bg-muted/40 rounded-md p-3">
                    <div>
                      <p className="font-medium text-foreground/70">Invoice No</p>
                      <p>Auto-generated</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground/70">Date</p>
                      <p>Auto-set on save</p>
                    </div>
                  </div>
                  <Button onClick={handleAddInvoice} className="w-full">Create Invoice</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-semibold text-foreground mt-1">৳{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Total Invoices</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{totalInvoicesCount}</p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Pending Payment</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="flex gap-1 p-3 border-b border-border">
            {[
              { value: "all", label: "All" },
              { value: "Paid", label: "Paid" },
              { value: "Partial", label: "Partial" },
              { value: "Unpaid", label: "Pending" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${statusFilter === opt.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                {opt.label}
                <span className="ml-1.5 text-xs opacity-70">
                  ({invoices.filter(i => opt.value === "all" ? true : i.status === opt.value).length})
                </span>
              </button>
            ))}
          </div>
          <div className="p-4 border-b border-border">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by client or invoice no..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Popover open={showCustomDate && timeFilter === "custom"} onOpenChange={setShowCustomDate}>
                <PopoverTrigger asChild>
                  <div>
                    <Select value={timeFilter} onValueChange={(v) => { setTimeFilter(v); if (v === "custom") setShowCustomDate(true) }}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>{TIME_OPTIONS.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4">
                  <div className="space-y-3">
                    <div><Label className="text-xs">From</Label><Input type="date" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)} /></div>
                    <div><Label className="text-xs">To</Label><Input type="date" value={customDateTo} onChange={(e) => setCustomDateTo(e.target.value)} /></div>
                    <Button size="sm" className="w-full" onClick={() => setShowCustomDate(false)}>Apply</Button>
                  </div>
                </PopoverContent>
              </Popover>
              <span className="text-sm text-muted-foreground ml-auto">{loading ? "Loading..." : `${filteredInvoices.length} results`}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-primary/60" />Invoice</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary/60" />Client</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-primary/60" />Phone</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-primary/60" />Services</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-primary/60" />Amount</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-primary/60" />Payment</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary/60" />Date</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary/60" />Status</span></TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No invoices found.</TableCell></TableRow>
                ) : paginatedInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => setViewInvoice(invoice)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setViewInvoice(invoice)
                      }
                    }}
                  >
                    <TableCell><div className="flex items-center gap-2"><Receipt className="w-4 h-4 text-muted-foreground" /><span className="font-medium">{invoice.invoiceNo}</span></div></TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell>{invoice.clientPhone}</TableCell>
                    <TableCell><div className="text-sm">{invoice.services.join(", ")}</div></TableCell>
                    <TableCell className="font-medium">
                      <div>৳{invoice.amount.toLocaleString()}</div>
                      {invoice.status === "Partial" && (
                        <div className="text-xs text-muted-foreground font-normal">
                          Paid: ৳{(invoice.paidAmount ?? 0).toLocaleString()} · Due: ৳{Math.max(0, invoice.amount - (invoice.paidAmount ?? 0)).toLocaleString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>{getStatusLabel(invoice.status)}</span></TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewInvoice(invoice)}><Eye className="w-4 h-4 mr-2" />View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditInvoiceState({ ...invoice })}><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintInvoice(invoice)}><Printer className="w-4 h-4 mr-2" />Print</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteInvoiceState(invoice)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {!loading && filteredInvoices.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredInvoices.length)} of {filteredInvoices.length} entries
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

      {/* View Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invoice Details</DialogTitle></DialogHeader>
          {viewInvoice && (
            <>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Invoice No</Label><p className="font-medium">{viewInvoice.invoiceNo}</p></div>
                  <div><Label className="text-muted-foreground">Client</Label><p className="font-medium">{viewInvoice.client}</p></div>
                  <div><Label className="text-muted-foreground">Services</Label><p className="font-medium">{viewInvoice.services.join(", ")}</p></div>
                  <div><Label className="text-muted-foreground">Amount</Label><p className="font-medium">৳{viewInvoice.amount.toLocaleString()}</p></div>
                  {viewInvoice.status === "Partial" && (
                    <>
                      <div><Label className="text-muted-foreground">Amount Paid</Label><p className="font-medium text-green-600">৳{(viewInvoice.paidAmount ?? 0).toLocaleString()}</p></div>
                      <div><Label className="text-muted-foreground">Amount Due</Label><p className="font-medium text-red-500">৳{Math.max(0, viewInvoice.amount - (viewInvoice.paidAmount ?? 0)).toLocaleString()}</p></div>
                    </>
                  )}
                  <div><Label className="text-muted-foreground">Payment Method</Label><p className="font-medium">{viewInvoice.paymentMethod}</p></div>
                  <div><Label className="text-muted-foreground">Date</Label><p className="font-medium">{viewInvoice.date}</p></div>
                  <div><Label className="text-muted-foreground">Status</Label><p className="font-medium">{getStatusLabel(viewInvoice.status)}</p></div>
                </div>
              </div>
              <DialogFooter className="mt-2">
                <Button variant="outline" className="w-full" onClick={() => handlePrintInvoice(viewInvoice)}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editInvoiceState} onOpenChange={() => setEditInvoiceState(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Invoice</DialogTitle></DialogHeader>
          {editInvoiceState && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Amount (৳)</Label>
                <Input type="number" value={editInvoiceState.amount} onChange={(e) => setEditInvoiceState({ ...editInvoiceState, amount: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={editInvoiceState.paymentMethod} onValueChange={(v: "Cash" | "bKash" | "Card") => setEditInvoiceState({ ...editInvoiceState, paymentMethod: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="bKash">bKash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editInvoiceState.status} onValueChange={(v: "Paid" | "Unpaid" | "Partial") => setEditInvoiceState({ ...editInvoiceState, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editInvoiceState.status === "Partial" && (
                <div>
                  <Label>Amount Paid (৳)</Label>
                  <Input
                    type="number"
                    value={editInvoiceState.paidAmount ?? ""}
                    onChange={(e) => setEditInvoiceState({ ...editInvoiceState, paidAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter amount paid so far"
                  />
                  {editInvoiceState.paidAmount != null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: ৳{Math.max(0, editInvoiceState.amount - editInvoiceState.paidAmount).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              <Button className="w-full" onClick={handleEditSave}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteInvoiceState} onOpenChange={() => setDeleteInvoiceState(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Invoice</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to delete invoice <strong>{deleteInvoiceState?.invoiceNo}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteInvoiceState(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
