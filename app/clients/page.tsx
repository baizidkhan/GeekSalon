"use client"

import { getClients, createClient, updateClient, deleteClient } from "@/api/clients/clients"
import { useState, useMemo, useEffect } from "react"
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
import { Plus, Search, Phone, Mail, MoreHorizontal, Upload, Download, ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  visits: number
  totalSpent: number
  lastVisit: string
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

const VISIT_SORT_OPTIONS = [
  { value: "none", label: "Sort by Spent" },
  { value: "high", label: "Spent: High to Low" },
  { value: "low", label: "Spent: Low to High" },
]

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState("all")
  const [visitSort, setVisitSort] = useState("none")
  const [customDateFrom, setCustomDateFrom] = useState("")
  const [customDateTo, setCustomDateTo] = useState("")
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    getClients().then((res) => {
      setClients(res.data ?? res)
      setLoading(false)
    }).catch(console.error)
  }, [])

  // View/Edit/Delete dialogs
  const [viewClient, setViewClient] = useState<Client | null>(null)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [deleteClientState, setDeleteClientState] = useState<Client | null>(null)

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
      case "today":
        return itemDate.toDateString() === now.toDateString()
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return itemDate >= weekAgo
      case "month":
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
      case "6months":
        const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        return itemDate >= sixMonthsAgo
      case "year":
        return itemDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  }

  const filteredClients = useMemo(() => {
    let result = clients.filter(
      (client) =>
        (client.name.toLowerCase().includes(search.toLowerCase()) ||
          client.email.toLowerCase().includes(search.toLowerCase()) ||
          client.phone.includes(search)) &&
        filterByDate(client.lastVisit)
    )

    if (visitSort === "high") {
      result = [...result].sort((a, b) => b.totalSpent - a.totalSpent)
    } else if (visitSort === "low") {
      result = [...result].sort((a, b) => a.totalSpent - b.totalSpent)
    }

    return result
  }, [clients, search, timeFilter, visitSort, customDateFrom, customDateTo])

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.phone)
      return
    await createClient(newClient)
    const res = await getClients()
    setClients(res.data ?? res)
    setIsDialogOpen(false)
    setNewClient({ name: "", email: "", phone: "" })

  }

  const handleEditSave = async () => {
    if (!editClient) return
    await updateClient(editClient.id, editClient)
    const res = await getClients()
    setClients(res.data ?? res)
    setEditClient(null)

  }

  const handleDelete = async () => {
    if (!deleteClientState) return
    await deleteClient(deleteClientState.id)
    setClients(clients.filter(c => c.id !== deleteClientState.id))
    setDeleteClientState(null)
  }


  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Visits", "Total Spent", "Last Visit"]
    const rows = filteredClients.map(c => [c.name, c.email, c.phone, c.visits, c.totalSpent, c.lastVisit])
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "clients.csv"
    a.click()
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split("\n").slice(1)
      const imported = lines.filter(l => l.trim()).map((line, i) => {
        const [name, email, phone, visits, totalSpent, lastVisit] = line.split(",")
        return {
          id: `imported-${Date.now()}-${i}`,
          name: name?.trim() || "",
          email: email?.trim() || "",
          phone: phone?.trim() || "",
          visits: parseInt(visits) || 0,
          totalSpent: parseFloat(totalSpent) || 0,
          lastVisit: lastVisit?.trim() || new Date().toISOString().split("T")[0],
        }
      })
      setClients([...clients, ...imported])
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
            <p className="text-muted-foreground">Manage your client database</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
              <Button variant="outline" asChild>
                <span><Upload className="w-4 h-4 mr-2" />Import CSV</span>
              </Button>
            </label>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={newClient.name}
                      onChange={(e) =>
                        setNewClient({ ...newClient, name: e.target.value })
                      }
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newClient.email}
                      onChange={(e) =>
                        setNewClient({ ...newClient, email: e.target.value })
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={newClient.phone}
                      onChange={(e) =>
                        setNewClient({ ...newClient, phone: e.target.value })
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                  <Button onClick={handleAddClient} className="w-full">
                    Add Client
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Popover open={showCustomDate && timeFilter === "custom"} onOpenChange={(open) => setShowCustomDate(open)}>
                <PopoverTrigger asChild>
                  <div>
                    <Select value={timeFilter} onValueChange={(v) => { setTimeFilter(v); if (v === "custom") setShowCustomDate(true) }}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">From</Label>
                      <Input type="date" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">To</Label>
                      <Input type="date" value={customDateTo} onChange={(e) => setCustomDateTo(e.target.value)} />
                    </div>
                    <Button size="sm" className="w-full" onClick={() => setShowCustomDate(false)}>Apply</Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Select value={visitSort} onValueChange={setVisitSort}>
                <SelectTrigger className="w-36">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISIT_SORT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground ml-auto">{filteredClients.length} results</span>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        {client.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{client.visits}</TableCell>
                  <TableCell>৳{(client.totalSpent ?? 0).toLocaleString()}</TableCell>
                  <TableCell>{client.lastVisit ?? '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewClient(client)}>
                          <Eye className="w-4 h-4 mr-2" />View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditClient({ ...client })}>
                          <Pencil className="w-4 h-4 mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteClientState(client)}>
                          <Trash2 className="w-4 h-4 mr-2" />Delete
                        </DropdownMenuItem>
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
      <Dialog open={!!viewClient} onOpenChange={() => setViewClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {viewClient && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">{getInitials(viewClient.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{viewClient.name}</p>
                  <p className="text-sm text-muted-foreground">{viewClient.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Phone</Label><p className="font-medium">{viewClient.phone}</p></div>
                <div><Label className="text-muted-foreground">Visits</Label><p className="font-medium">{viewClient.visits}</p></div>
                <div><Label className="text-muted-foreground">Total Spent</Label><p className="font-medium">৳{viewClient.totalSpent.toLocaleString()}</p></div>
                <div><Label className="text-muted-foreground">Last Visit</Label><p className="font-medium">{viewClient.lastVisit ?? '-'}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editClient} onOpenChange={() => setEditClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          {editClient && (
            <div className="space-y-4 mt-4">
              <div><Label>Full Name</Label><Input value={editClient.name} onChange={(e) => setEditClient({ ...editClient, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={editClient.email} onChange={(e) => setEditClient({ ...editClient, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={editClient.phone} onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })} /></div>
              <Button className="w-full" onClick={handleEditSave}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteClientState} onOpenChange={() => setDeleteClientState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to delete <strong>{deleteClientState?.name}</strong>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteClientState(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
