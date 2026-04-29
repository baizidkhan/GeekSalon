"use client"

import { getClients, createClient, updateClient, deleteClient } from "@admin/api/clients/clients"
import { useState, useMemo, useEffect, useCallback } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
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
import { Plus, Search, Phone, Mail, MoreHorizontal, Upload, Download, Eye, Pencil, Trash2, User, Calendar, Zap, Receipt, History, LayoutList, LayoutGrid, Scissors } from "lucide-react"
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
  email: string | null
  phone: string
  visits: number
  totalSpent: number
  firstVisit: string | null
  lastVisit: string
  appointments?: Array<{
    services?: string[] | null
    source?: string | null
  }>
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

const PAGE_SIZE = 12

const normalizePhone = (value: string) => value.replace(/\D/g, "")

const getMainService = (client: Client) => {
  const serviceCounts = new Map<string, number>()

  for (const appointment of client.appointments ?? []) {
    for (const service of appointment.services ?? []) {
      const normalizedService = service.trim()
      if (!normalizedService) continue
      serviceCounts.set(normalizedService, (serviceCounts.get(normalizedService) ?? 0) + 1)
    }
  }

  let topService = "-"
  let topCount = 0

  for (const [service, count] of serviceCounts.entries()) {
    if (count > topCount) {
      topService = service
      topCount = count
    }
  }

  return topCount > 0 ? `${topService} (${topCount} ${topCount === 1 ? "time" : "times"})` : "-"
}

const normalizeAppointmentSource = (raw: string | null | undefined) => {
  const source = (raw ?? "").toLowerCase().replace(/[-_]/g, " ").trim()
  if (source === "walk in" || source === "walkin") return "Walk In"
  if (source === "call") return "Call"
  return "Online"
}

const getMainMethod = (client: Client) => {
  const allowedSources: Array<"Online" | "Walk In" | "Call"> = ["Online", "Walk In", "Call"]
  const sourceCounts = new Map<string, number>()

  for (const appointment of client.appointments ?? []) {
    const normalizedSource = normalizeAppointmentSource(appointment.source)
    sourceCounts.set(normalizedSource, (sourceCounts.get(normalizedSource) ?? 0) + 1)
  }

  let topSource = ""
  let topCount = 0

  for (const source of allowedSources) {
    const count = sourceCounts.get(source) ?? 0
    if (count > topCount) {
      topSource = source
      topCount = count
    }
  }

  if (topCount <= 0) return ""
  if (topCount === client.visits) return `all via ${topSource}`
  return `${topCount} via ${topSource}`
}

// Bangladeshi phone validation: 01[3-9]XXXXXXXX or +8801[3-9]XXXXXXXX
const isValidPhone = (phone: string) => {
  const normalized = normalizePhone(phone)
  return /^(?:88)?01[3-9]\d{8}$/.test(normalized)
}

export default function ClientsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState("all")
  const [customDateFrom, setCustomDateFrom] = useState("")
  const [customDateTo, setCustomDateTo] = useState("")
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const fetchClients = useCallback(async () => {
    try {
      const res = await getClients(1, 1000)
      setClients(res.data ?? res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

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
    const searchTerm = debouncedSearch.trim().toLowerCase()
    const normalizedSearch = normalizePhone(debouncedSearch)

    let result = clients.filter(
      (client) => {
        if (!searchTerm) {
          return filterByDate(client.lastVisit)
        }

        const nameMatch = (client.name ?? "").toLowerCase().includes(searchTerm)
        const phoneMatch =
          normalizedSearch.length > 0 &&
          normalizePhone(client.phone ?? "").includes(normalizedSearch)

        return (nameMatch || phoneMatch) && filterByDate(client.lastVisit)
      }
    )

    // Primary sort: most appointments first. Tie-breaker: latest visit first.
    result = [...result].sort((a, b) => {
      if ((b.visits ?? 0) !== (a.visits ?? 0)) {
        return (b.visits ?? 0) - (a.visits ?? 0)
      }

      const aLastVisit = new Date(a.lastVisit ?? "").getTime()
      const bLastVisit = new Date(b.lastVisit ?? "").getTime()
      const safeALastVisit = Number.isNaN(aLastVisit) ? 0 : aLastVisit
      const safeBLastVisit = Number.isNaN(bLastVisit) ? 0 : bLastVisit
      return safeBLastVisit - safeALastVisit
    })

    return result
  }, [clients, debouncedSearch, timeFilter, customDateFrom, customDateTo])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, timeFilter, customDateFrom, customDateTo])

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE))
  const paginatedClients = filteredClients.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.phone)
      return
    if (!isValidPhone(newClient.phone)) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Phone must be in format: 01712345678 or +8801712345678"
      })
      return
    }
    await createClient(newClient)
    const res = await getClients(1, 1000)
    setClients(res.data ?? res)
    setIsDialogOpen(false)
    setNewClient({ name: "", email: "", phone: "" })
    toast({
      title: "Success",
      description: "Client created successfully"
    })
  }

  const handleEditSave = async () => {
    if (!editClient) return

    // Validate name and phone
    if (!editClient.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Client name is required"
      })
      return
    }

    if (!isValidPhone(editClient.phone)) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Phone must be in format: 01712345678 or +8801712345678"
      })
      return
    }

    try {
      // Send only the necessary fields to the server (not computed fields like visits, totalSpent)
      await updateClient(editClient.id, {
        name: editClient.name,
        phone: editClient.phone,
        email: editClient.email || null,
      })

      // Refresh the client list to show updated data
      const res = await getClients(1, 1000)
      setClients(res.data ?? res)
      setEditClient(null)

      toast({
        title: "Success",
        description: "Client updated successfully. Changes will reflect across all pages."
      })
    } catch (error) {
      console.error("Error updating client:", error)
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update client. Please try again."
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteClientState) return
    try {
      await deleteClient(deleteClientState.id)
      setClients(clients.filter(c => c.id !== deleteClientState.id))
      setDeleteClientState(null)
      toast({
        title: "Success",
        description: "Client deleted successfully"
      })
    } catch (error) {
      console.error("Error deleting client:", error)
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete client. Please try again."
      })
    }
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
    reader.onload = async (event) => {
      const text = event.target?.result as string
      const lines = text.split("\n").slice(1).filter(l => l.trim())
      for (const line of lines) {
        const [name, email, phone] = line.split(",")
        if (!name?.trim() || !phone?.trim()) continue
        try {
          await createClient({
            name: name.trim(),
            email: email?.trim() || undefined,
            phone: phone.trim(),
          })
        } catch (err) {
          console.error(`Failed to import client ${name}`, err)
        }
      }
      fetchClients()
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
    <>
      <div className="premium-page p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary/70 uppercase mb-1">Database</p>
            <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage your client database</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
              <DialogContent className="sm:max-w-[620px]">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <div className="mt-2 space-y-5 pb-6">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold tracking-wide">Full Name</Label>
                    <Input
                      value={newClient.name}
                      onChange={(e) =>
                        setNewClient({ ...newClient, name: e.target.value })
                      }
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold tracking-wide">Email</Label>
                    <Input
                      type="email"
                      value={newClient.email}
                      onChange={(e) =>
                        setNewClient({ ...newClient, email: e.target.value })
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-semibold tracking-wide">Phone Number</Label>
                    <Input
                      value={newClient.phone}
                      onChange={(e) =>
                        setNewClient({ ...newClient, phone: e.target.value })
                      }
                      placeholder="01712345678 or +8801712345678"
                    />
                  </div>
                  <Button onClick={handleAddClient} className="mt-1 h-10 w-full">
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

              <span className="text-sm text-muted-foreground ml-auto">{filteredClients.length} results</span>

              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
                  title="List view"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary/60" />Client</span></TableHead>
                    <TableHead><span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-primary/60" />Contact</span></TableHead>
                    <TableHead><span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary/60" />Total Appointments</span></TableHead>
                    <TableHead><span className="flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-primary/60" />Main Service</span></TableHead>
                    <TableHead><span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-primary/60" />Total Spent</span></TableHead>
                    <TableHead><span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary/60" />Last Visit</span></TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => router.push(`/admin/clients/${client.id}`)}
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          router.push(`/admin/clients/${client.id}`)
                        }
                      }}
                    >
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
                          {client.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              {client.email}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {client.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.visits} {client.visits === 1 ? 'time' : 'times'}{getMainMethod(client) ? ` (${getMainMethod(client)})` : ""}
                      </TableCell>
                      <TableCell>{getMainService(client)}</TableCell>
                      <TableCell>৳{(client.totalSpent ?? 0).toLocaleString()}</TableCell>
                      <TableCell>{client.lastVisit ?? '-'}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
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
                            <DropdownMenuItem onClick={() => setEditClient({ ...client, name: client.name ?? "", email: client.email ?? "", phone: client.phone ?? "" })}>
                              <Pencil className="w-4 h-4 mr-2" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/clients/${client.id}`)}>
                              <History className="w-4 h-4 mr-2" />History
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
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedClients.map((client) => (
                <div
                  key={client.id}
                  className="bg-background border border-border rounded-2xl overflow-hidden flex flex-col cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
                  onClick={() => router.push(`/admin/clients/${client.id}`)}
                >
                  {/* Card Header with gradient */}
                  <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-5 pt-5 pb-8">
                    <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/60 hover:bg-background">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewClient(client)}>
                            <Eye className="w-4 h-4 mr-2" />View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditClient({ ...client, name: client.name ?? "", email: client.email ?? "", phone: client.phone ?? "" })}>
                            <Pencil className="w-4 h-4 mr-2" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/clients/${client.id}`)}>
                            <History className="w-4 h-4 mr-2" />History
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteClientState(client)}>
                            <Trash2 className="w-4 h-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Avatar className="h-14 w-14 ring-2 ring-background shadow-sm">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col flex-1 px-5 -mt-4">
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3 flex-1">
                      <div>
                        <p className="font-semibold text-base leading-tight">{client.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                          <p className="text-xs text-muted-foreground">{client.phone}</p>
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                            <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1 pt-3 border-t border-border">
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">{client.visits}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Visits</p>
                        </div>
                        <div className="text-center border-l border-border">
                          <p className="text-lg font-bold text-foreground">৳{(client.totalSpent ?? 0) >= 1000 ? ((client.totalSpent ?? 0) / 1000).toFixed(1) + 'k' : (client.totalSpent ?? 0).toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Spent</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 mt-1 border-t border-border">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <p className="text-[10px] uppercase tracking-wide">Last Visit</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {client.lastVisit
                            ? new Date(client.lastVisit).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center gap-1 px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => setViewClient(client)}>
                      <Eye className="w-3 h-3 mr-1" />View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => setEditClient({ ...client, name: client.name ?? "", email: client.email ?? "", phone: client.phone ?? "" })}>
                      <Pencil className="w-3 h-3 mr-1" />Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => router.push(`/admin/clients/${client.id}`)}>
                      <History className="w-3 h-3 mr-1" />History
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && filteredClients.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredClients.length)} of {filteredClients.length} entries
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
      <Dialog open={!!viewClient} onOpenChange={() => setViewClient(null)}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {viewClient && (
            <div className="mt-2 space-y-5 pb-24">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">{getInitials(viewClient.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{viewClient.name}</p>
                  {viewClient.email && (
                    <p className="text-sm text-muted-foreground">{viewClient.email}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-[13px] font-semibold tracking-wide text-muted-foreground">Phone</Label><p className="font-medium">{viewClient.phone}</p></div>
                <div className="space-y-1"><Label className="text-[13px] font-semibold tracking-wide text-muted-foreground">Visits</Label><p className="font-medium">{viewClient.visits}</p></div>
                <div className="space-y-1"><Label className="text-[13px] font-semibold tracking-wide text-muted-foreground">Total Spent</Label><p className="font-medium">৳{viewClient.totalSpent.toLocaleString()}</p></div>
                <div className="space-y-1"><Label className="text-[13px] font-semibold tracking-wide text-muted-foreground">Last Visit</Label><p className="font-medium">{viewClient.lastVisit ?? '-'}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editClient} onOpenChange={() => setEditClient(null)}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          {editClient && (
            <div className="mt-2 space-y-5 pb-24">
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold tracking-wide">Full Name</Label>
                <Input value={editClient.name ?? ""} onChange={(e) => setEditClient({ ...editClient, name: e.target.value })} placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold tracking-wide">Email</Label>
                <Input type="email" value={editClient.email ?? ""} onChange={(e) => setEditClient({ ...editClient, email: e.target.value })} placeholder="Enter email address" />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold tracking-wide">Phone Number</Label>
                <Input
                  value={editClient.phone ?? ""}
                  onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
                  placeholder="01712345678 or +8801712345678"
                />
                {editClient.phone && !isValidPhone(editClient.phone) && (
                  <p className="text-sm text-destructive mt-1">Invalid phone number format</p>
                )}
              </div>
              <Button className="mt-1 h-10 w-full" onClick={handleEditSave}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteClientState} onOpenChange={() => setDeleteClientState(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
          </DialogHeader>
          <p className="mt-1 text-muted-foreground leading-relaxed">Are you sure you want to delete <strong>{deleteClientState?.name}</strong>? This action cannot be undone.</p>
          <DialogFooter className="pb-2">
            <Button variant="outline" onClick={() => setDeleteClientState(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
