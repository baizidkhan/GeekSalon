"use client"

import { useState, useMemo, useEffect } from "react"
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from "@/api/billing/billing"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Plus, Search, Receipt, Printer, MoreHorizontal, Upload, Download, Eye, Pencil, Trash2 } from "lucide-react"
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
  services: string[]
  amount: number
  paymentMethod: "Cash" | "bKash" | "Card"
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

function mapInvoice(inv: any): Invoice {
  return {
    id: inv.id,
    invoiceNo: inv.invoiceNumber,
    client: inv.client?.name ?? "Walk-in",
    services: inv.services ?? [],
    amount: Number(inv.total),
    paymentMethod: inv.paymentMethod,
    date: inv.createdAt?.split("T")[0] ?? "",
    status: inv.status,
  }
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState("all")
  const [customDateFrom, setCustomDateFrom] = useState("")
  const [customDateTo, setCustomDateTo] = useState("")
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    staff: "",
    printBy: "",
    services: "",
    total: "",
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
      mapped.sort((a: Invoice, b: Invoice) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setInvoices(mapped)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
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
    return invoices.filter(
      (inv) =>
        (inv.client.toLowerCase().includes(search.toLowerCase()) ||
          inv.invoiceNo.toLowerCase().includes(search.toLowerCase())) &&
        filterByDate(inv.date)
    )
  }, [invoices, search, timeFilter, customDateFrom, customDateTo])

  const handleAddInvoice = async () => {
    if (!newInvoice.staff) return
    try {
      await createInvoice({
        staff: newInvoice.staff,
        printBy: newInvoice.status === "Paid" ? newInvoice.printBy || undefined : undefined,
        services: newInvoice.services ? newInvoice.services.split(",").map(s => s.trim()) : [],
        total: newInvoice.total ? parseFloat(newInvoice.total) : undefined,
        paymentMethod: newInvoice.paymentMethod,
        status: newInvoice.status,
      })
      setNewInvoice({ staff: "", printBy: "", services: "", total: "", paymentMethod: "Cash", status: "Unpaid" })
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

  const handleExportCSV = () => {
    const headers = ["Invoice No", "Client", "Services", "Amount", "Payment Method", "Date", "Status"]
    const rows = filteredInvoices.map(inv => [inv.invoiceNo, inv.client, inv.services.join("; "), inv.amount, inv.paymentMethod, inv.date, inv.status])
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

  const totalRevenue = invoices.filter(inv => inv.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Billing / POS</h1>
            <p className="text-muted-foreground">Manage invoices and payments</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Invoice</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create New Invoice</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Staff</Label>
                    <Input value={newInvoice.staff} onChange={(e) => setNewInvoice({ ...newInvoice, staff: e.target.value })} placeholder="Staff name" />
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
            <p className="text-2xl font-semibold text-foreground mt-1">{invoices.length}</p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Unpaid</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{invoices.filter(inv => inv.status === "Unpaid").length}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No invoices found.</TableCell></TableRow>
              ) : filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell><div className="flex items-center gap-2"><Receipt className="w-4 h-4 text-muted-foreground" /><span className="font-medium">{invoice.invoiceNo}</span></div></TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell><div className="text-sm">{invoice.services.join(", ")}</div></TableCell>
                  <TableCell className="font-medium">৳{invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>{invoice.paymentMethod}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>{invoice.status}</span></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewInvoice(invoice)}><Eye className="w-4 h-4 mr-2" />View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditInvoiceState({ ...invoice })}><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem><Printer className="w-4 h-4 mr-2" />Print</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteInvoiceState(invoice)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invoice Details</DialogTitle></DialogHeader>
          {viewInvoice && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Invoice No</Label><p className="font-medium">{viewInvoice.invoiceNo}</p></div>
                <div><Label className="text-muted-foreground">Client</Label><p className="font-medium">{viewInvoice.client}</p></div>
                <div><Label className="text-muted-foreground">Services</Label><p className="font-medium">{viewInvoice.services.join(", ")}</p></div>
                <div><Label className="text-muted-foreground">Amount</Label><p className="font-medium">৳{viewInvoice.amount.toLocaleString()}</p></div>
                <div><Label className="text-muted-foreground">Payment Method</Label><p className="font-medium">{viewInvoice.paymentMethod}</p></div>
                <div><Label className="text-muted-foreground">Date</Label><p className="font-medium">{viewInvoice.date}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><p className="font-medium">{viewInvoice.status}</p></div>
              </div>
            </div>
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
    </DashboardLayout>
  )
}
