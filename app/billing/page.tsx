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
import { Plus, Search, Receipt, Printer, MoreHorizontal } from "lucide-react"
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
  {
    id: "1",
    invoiceNo: "INV-001",
    client: "Fatema Begum",
    services: ["Haircut - Women", "Hair Spa"],
    amount: 2500,
    paymentMethod: "UPI",
    date: "2026-04-06",
    status: "Paid",
  },
  {
    id: "2",
    invoiceNo: "INV-002",
    client: "Md. Rafiqul Islam",
    services: ["Haircut - Men"],
    amount: 300,
    paymentMethod: "Cash",
    date: "2026-04-06",
    status: "Paid",
  },
  {
    id: "3",
    invoiceNo: "INV-003",
    client: "Nasrin Akhter",
    services: ["Facial - Basic", "Threading - Eyebrow"],
    amount: 1200,
    paymentMethod: "Card",
    date: "2026-04-05",
    status: "Paid",
  },
  {
    id: "4",
    invoiceNo: "INV-004",
    client: "Karim Hossain",
    services: ["Haircut - Men", "Beard Trim"],
    amount: 500,
    paymentMethod: "UPI",
    date: "2026-04-05",
    status: "Pending",
  },
]

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    client: "",
    services: "",
    amount: "",
    paymentMethod: "Cash" as const,
  })

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddInvoice = () => {
    if (newInvoice.client && newInvoice.amount) {
      const nextInvoiceNo = `INV-${String(invoices.length + 1).padStart(3, "0")}`
      setInvoices([
        ...invoices,
        {
          id: Date.now().toString(),
          invoiceNo: nextInvoiceNo,
          client: newInvoice.client,
          services: newInvoice.services.split(",").map((s) => s.trim()),
          amount: parseFloat(newInvoice.amount),
          paymentMethod: newInvoice.paymentMethod,
          date: new Date().toISOString().split("T")[0],
          status: "Paid",
        },
      ])
      setNewInvoice({ client: "", services: "", amount: "", paymentMethod: "Cash" })
      setIsDialogOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700"
      case "Pending":
        return "bg-amber-100 text-amber-700"
      case "Refunded":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const totalRevenue = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Billing / POS</h1>
            <p className="text-muted-foreground">Manage invoices and payments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Client Name</Label>
                  <Input
                    value={newInvoice.client}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, client: e.target.value })
                    }
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label>Services (comma separated)</Label>
                  <Input
                    value={newInvoice.services}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, services: e.target.value })
                    }
                    placeholder="e.g., Haircut, Hair Spa"
                  />
                </div>
                <div>
                  <Label>Amount (৳)</Label>
                  <Input
                    type="number"
                    value={newInvoice.amount}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select
                    value={newInvoice.paymentMethod}
                    onValueChange={(value: "Cash" | "Card" | "UPI") =>
                      setNewInvoice({ ...newInvoice, paymentMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddInvoice} className="w-full">
                  Create Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              ৳{totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Total Invoices</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {invoices.length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Pending Payments</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {invoices.filter((inv) => inv.status === "Pending").length}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{invoice.invoiceNo}</span>
                    </div>
                  </TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>
                    <div className="text-sm">{invoice.services.join(", ")}</div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ৳{invoice.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{invoice.paymentMethod}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
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
                        <DropdownMenuItem>
                          <Printer className="w-4 h-4 mr-2" />
                          Print Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Refund</DropdownMenuItem>
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
