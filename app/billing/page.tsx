"use client"

import { useState, useMemo } from "react"
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
  paymentMethod: "Cash" | "Card" | "UPI"
  date: string
  status: "Paid" | "Pending" | "Refunded"
}

const initialInvoices: Invoice[] = [
  { id: "1", invoiceNo: "INV-001", client: "Fatema Begum", services: ["Haircut - Women", "Hair Spa"], amount: 2500, paymentMethod: "UPI", date: "2026-04-06", status: "Paid" },
  { id: "2", invoiceNo: "INV-002", client: "Md. Rafiqul Islam", services: ["Haircut - Men"], amount: 300, paymentMethod: "Cash", date: "2026-04-06", status: "Paid" },
  { id: "3", invoiceNo: "INV-003", client: "Nasrin Akhter", services: ["Facial - Basic", "Threading - Eyebrow"], amount: 1200, paymentMethod: "Card", date: "2026-04-05", status: "Paid" },
  { id: "4", invoiceNo: "INV-004", client: "Karim Hossain", services: ["Haircut - Men", "Beard Trim"], amount: 500, paymentMethod: "UPI", date: "2026-04-05", status: "Pending" },
]

const TIME_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "6months", label: "Last 6 Months" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Date" },
]

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState("all")
  const [customDateFrom, setCustomDateFrom] = useState("")
  const [customDateTo, setCustomDateTo] = useState("")
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [newInvoice, setNewInvoice] = useState({ client: "", services: "", amount: "", paymentMethod: "Cash" as const })
  
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null)
  const [deleteInvoice, setDeleteInvoice] = useState<Invoice | null>(null)

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

  const handleAddInvoice = () => {
    if (newInvoice.client && newInvoice.amount) {
      const nextInvoiceNo = `INV-${String(invoices.length + 1).padStart(3, "0")}`
      setInvoices([...invoices, {
        id: Date.now().toString(),
        invoiceNo: nextInvoiceNo,
        client: newInvoice.client,
        services: newInvoice.services.split(",").map((s) => s.trim()),
        amount: parseFloat(newInvoice.amount),
        paymentMethod: newInvoice.paymentMethod,
        date: new Date().toISOString().split("T")[0],
        status: "Paid",
      }])
      setNewInvoice({ client: "", services: "", amount: "", paymentMethod: "Cash" })
      setIsDialogOpen(false)
    }
  }

  const handleEditSave = () => {
    if (editInvoice) {
      setInvoices(invoices.map(inv => inv.id === editInvoice.id ? editInvoice : inv))
      setEditInvoice(null)
    }
  }

  const handleDelete = () => {
    if (deleteInvoice) {
      setInvoices(invoices.filter(inv => inv.id !== deleteInvoice.id))
      setDeleteInvoice(null)
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

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split("\n").slice(1)
      const imported = lines.filter(l => l.trim()).map((line, i) => {
        const [invoiceNo, client, services, amount, paymentMethod, date, status] = line.split(",")
        return {
          id: `imported-${Date.now()}-${i}`,
          invoiceNo: invoiceNo?.trim() || `INV-${Date.now()}`,
          client: client?.trim() || "",
          services: services?.split(";").map(s => s.trim()) || [],
          amount: parseFloat(amount) || 0,
          paymentMethod: (paymentMethod?.trim() as "Cash" | "Card" | "UPI") || "Cash",
          date: date?.trim() || new Date().toISOString().split("T")[0],
          status: (status?.trim() as "Paid" | "Pending" | "Refunded") || "Pending",
        }
      })
      setInvoices([...invoices, ...imported])
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-700"
      case "Pending": return "bg-amber-100 text-amber-700"
      case "Refunded": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const totalRevenue = invoices.filter((inv) => inv.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Billing / POS</h1>
            <p className="text-muted-foreground">Manage invoices and payments</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
              <Button variant="outline" asChild><span><Upload className="w-4 h-4 mr-2" />Import CSV</span></Button>
            </label>
            <Button variant="outline" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Invoice</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create New Invoice</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div><Label>Client Name</Label><Input value={newInvoice.client} onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })} placeholder="Enter client name" /></div>
                  <div><Label>Services (comma separated)</Label><Input value={newInvoice.services} onChange={(e) => setNewInvoice({ ...newInvoice, services: e.target.value })} placeholder="e.g., Haircut, Hair Spa" /></div>
                  <div><Label>Amount (৳)</Label><Input type="number" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })} placeholder="Enter amount" /></div>
                  <div>
                    <Label>Payment Method</Label>
                    <Select value={newInvoice.paymentMethod} onValueChange={(value: "Cash" | "Card" | "UPI") => setNewInvoice({ ...newInvoice, paymentMethod: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                      </SelectContent>
                    </Select>
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
            <p className="text-2xl font-semibold text-foreground mt-1">{invoices.length}</p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Pending Payments</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{invoices.filter((inv) => inv.status === "Pending").length}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
              <span className="text-sm text-muted-foreground ml-auto">{filteredInvoices.length} results</span>
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
              {filteredInvoices.map((invoice) => (
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
                        <DropdownMenuItem onClick={() => setEditInvoice({...invoice})}><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem><Printer className="w-4 h-4 mr-2" />Print</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteInvoice(invoice)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
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
      <Dialog open={!!editInvoice} onOpenChange={() => setEditInvoice(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Invoice</DialogTitle></DialogHeader>
          {editInvoice && (
            <div className="space-y-4 mt-4">
              <div><Label>Client</Label><Input value={editInvoice.client} onChange={(e) => setEditInvoice({...editInvoice, client: e.target.value})} /></div>
              <div><Label>Amount</Label><Input type="number" value={editInvoice.amount} onChange={(e) => setEditInvoice({...editInvoice, amount: parseFloat(e.target.value) || 0})} /></div>
              <div>
                <Label>Status</Label>
                <Select value={editInvoice.status} onValueChange={(v: "Paid" | "Pending" | "Refunded") => setEditInvoice({...editInvoice, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleEditSave}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteInvoice} onOpenChange={() => setDeleteInvoice(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Invoice</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to delete invoice <strong>{deleteInvoice?.invoiceNo}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteInvoice(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
